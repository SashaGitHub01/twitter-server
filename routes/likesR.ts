import { Router } from "express";
import passport from "passport";
import LikesController from "../controllers/LikesController";

export const likesR = Router()

likesR.post('/:id', passport.authenticate('jwt'), LikesController.create);