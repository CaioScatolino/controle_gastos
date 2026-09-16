import { RequestHandler } from "express";
import { createUserSchema } from "../validators/user.validator";
import * as userService from '../services/user.service'
import { NewUser } from "../db/schema";

export const createUser: RequestHandler = async (req, res) => { 

    const data = createUserSchema.parse(req.body) as NewUser;

    const user = await userService.createUser(data)

    return res.json(user);

}