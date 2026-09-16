import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id: number;
    iat?: number;
    exp?: number;
}

export const privateRoute: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido", data: null });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
        return res.status(401).json({ error: "Formato do token inválido", data: null });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: "Token malformatado", data: null });
    }

    try {
        const secret = process.env.JWT_SECRET || "default_secret_key";
        const decoded = jwt.verify(token, secret) as TokenPayload;

        req.userId = decoded.id;
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado", data: null });
    }
};
