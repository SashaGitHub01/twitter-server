import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/UserController";
import { registerValidator } from "../validators/register";

export const authR = Router()

authR.post('/register', registerValidator, UserController.create);
authR.get('/me', passport.authenticate('jwt'), UserController.authMe);
authR.get('/logout', UserController.logout);
authR.post('/login', passport.authenticate('local'), UserController.afterLogin);
authR.get('/google',
   passport.authenticate('google', { scope: ['profile', 'email'] }));

authR.get('/google/callback',
   passport.authenticate('google', { scope: ['profile'] }),
   UserController.googleAuth);
authR.get('/verify', registerValidator, UserController.verify);