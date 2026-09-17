import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { NewUser, outbox_users, User, users } from "../db/schema";
import bcrypt from "bcrypt";

export const createUser = async (data: NewUser) => {
  // Passo 1 -> Verificar se o e-mail já existe

  const existingUser = await getUserByEmail(data.email);

  if (existingUser) {
    throw new Error("E-mail já cadastrado");
  }

  // Passo 2 -> Criptografar senha

  const hashedPassword = await hashPassword(data.password);

  // Passo 3 -> Inserir usuário

  const newUser: NewUser = {
    ...data,
    password: hashedPassword,
  };
  const createdUser = await db.transaction(async (tx) => {
    // 1. Insere o usuário
    const result = await tx.insert(users).values(newUser).$returningId();
    const createdUserId = result[0].id;
    // 2. Insere na outbox usando o MESMO 'tx'
    const { password, ...rest } = newUser;
    await tx.insert(outbox_users).values({
      user_id: createdUserId,
      type: "USER_CREATED",
      data: rest,
      processed: false,
    });
    // 3. Busca o usuário recém-criado para retornar
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, createdUserId))
      .limit(1);
    return user;
  });
  const formattedUser = await formatUser(createdUser);
  return formattedUser;
};

export const login = async (email: string, hashedPassword: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const passwordMatch = await bcrypt.compare(hashedPassword, user.password);

  if (!passwordMatch) {
    throw new Error("Senha incorreta");
  }

  const formattedUser = await formatUser(user);

  return formattedUser;
};

//======= FUNÇÕES AUXILIARES =======

export const getUserByEmail = async (email: string) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    return null;
  }

  return user;
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const formatUser = async (user: User) => {
  const { password, ...rest } = user;

  if (rest.avatar) {
    rest.avatar = `${process.env.BASE_URL}/static/avatars/${rest.avatar}`;
  }
  return rest;
};
