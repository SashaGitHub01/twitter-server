import { Router } from "express";
import { authR } from "./authR";
import { commentsR } from "./commentsR";
import { tweetsR } from "./tweetsR";
import { uploadR } from "./uploadR";
import { userR } from "./userR";
import { likesR } from "./likesR";
import { followR } from "./followR";

export const router = Router();

router.use('/auth', authR)
router.use('/upload', uploadR)
router.use('/users', userR)
router.use('/tweets', tweetsR)
router.use('/comments', commentsR)
router.use('/likes', likesR)
router.use('/follow', followR)
