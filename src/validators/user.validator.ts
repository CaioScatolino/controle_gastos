import {z} from "zod"

export const createUserSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("E-mail inválido"),
    password: z.string().min(1, "Senha é obrigatória").min(6, "Senha muito curta"),
});