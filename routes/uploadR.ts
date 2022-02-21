import { Router } from "express";
import passport from "passport";
import UploadFilesController from "../controllers/UploadFilesController";
import { upload } from '../core/multer';

export const uploadR = Router()

uploadR.post('/upload', upload.array('images', 6), UploadFilesController.index);
uploadR.post('/avatar', passport.authenticate('jwt'), upload.single('avatar'), UploadFilesController.avatar);