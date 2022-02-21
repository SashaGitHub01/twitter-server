import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/UserController";

export const userR = Router()

userR.get('/', UserController.index);
userR.get('/:username', UserController.getOne);