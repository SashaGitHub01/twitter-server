import { Router } from "express";
import CommentsCtrl from "../controllers/CommentsCtrl";
import passport from "passport";

export const commentsR = Router()

commentsR.post('/:id', passport.authenticate('jwt'), CommentsCtrl.create);
commentsR.delete('/:id', CommentsCtrl.delete);