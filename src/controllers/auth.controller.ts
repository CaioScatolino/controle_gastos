import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { authLoginSchema } from "../validators/auth.validator";
import * as userService from '../services/user.service';

export const login: RequestHandler = async (req, res) => {
    const data = authLoginSchema.parse(req.body);

    const result = await userService.login(data.email, data.password);

    if (!result) {
        return res.status(401).json({ error: "Credenciais inválidas", data: null });
    }

    const secret = process.env.JWT_SECRET || "default_secret_key";
    const token = jwt.sign({ id: result.id }, secret, { expiresIn: "24h" });

    return res.status(201).json({
        error: null,
        data: {
            token,
            user: result
        }
    });
};