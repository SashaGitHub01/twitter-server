import { Router } from "express";
import passport from "passport";
import FollowController from "../controllers/FollowController";

export const followR = Router()

followR.post('/:id', passport.authenticate('jwt'), FollowController.create);
followR.delete('/:id', passport.authenticate('jwt'), FollowController.delete);