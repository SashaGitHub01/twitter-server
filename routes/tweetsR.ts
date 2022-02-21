import { Router } from "express";
import passport from "passport";
import { tweetsValidation } from "../validators/tweet";
import TweetsController from "../controllers/TweetsController";

export const tweetsR = Router();

tweetsR.get('/', TweetsController.index);
tweetsR.get('/:userId/filter/media', TweetsController.filterMedia);
tweetsR.get('/:userId/filter/likes', TweetsController.filterLikes);
tweetsR.get('/:id', TweetsController.getOne);
tweetsR.post('', tweetsValidation, passport.authenticate('jwt'), TweetsController.create);
tweetsR.delete('/:id', passport.authenticate('jwt'), TweetsController.delete);
tweetsR.put('/:id', tweetsValidation, passport.authenticate('jwt'), TweetsController.update);
