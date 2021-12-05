import express from 'express';
import morgan from 'morgan';
import { config } from 'dotenv';
config();
import mongoose from 'mongoose';
import UserController from './controllers/UserController';
import { registerValidator } from './validators/register';
import passport from 'passport';
import './core/passport';
import cookieSession from 'cookie-session';
import cors from 'cors';
import TweetsController from './controllers/TweetsController';
import { tweetsValidation } from './validators/tweet';
import multer from 'multer';
import UploadFilesController from './controllers/UploadFilesController';
import './core/cloudinary';

const app = express();

const PORT = process.env.PORT || 3001;

const storage = multer.memoryStorage();

const upload = multer({ storage: storage })


//MW
app.use(passport.initialize());
app.use(cookieSession({
   name: 'session',
   keys: ['key1'],
   maxAge: 777777777
}))
app.use(cors({
   origin: 'http://localhost:3000',
   credentials: true
}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());

//ROUTERS

//auth
app.post('/auth/register', registerValidator, UserController.create);
app.get('/auth/me', UserController.authMe);
app.get('/auth/logout', UserController.logout);
app.post('/auth/login', passport.authenticate('local'), UserController.afterLogin);
app.get('/auth/verify', registerValidator, UserController.verify);

//users
app.get('/user', passport.authenticate('jwt'), UserController.getMe);
app.get('/users', UserController.index);
app.get('/users/:username', UserController.getOne);

//tweets
app.get('/tweets', TweetsController.index);
app.get('/tweets/:id', TweetsController.getOne);
app.post('/tweets', tweetsValidation, passport.authenticate('jwt'), TweetsController.create);
app.delete('/tweets/:id', passport.authenticate('jwt'), TweetsController.delete);
app.put('/tweets/:id', tweetsValidation, passport.authenticate('jwt'), TweetsController.update);

//uploads
app.post('/upload', upload.array('images', 6), UploadFilesController.index);
app.post('/upload/avatar', passport.authenticate('jwt'), upload.single('avatar'), UploadFilesController.avatar);

const start = async () => {
   try {
      await mongoose.connect(process.env.DB_URL ||
         'mongodb+srv://admin:admin@cluster0.msbqj.mongodb.net/twitter?retryWrites=true&w=majority');
      app.listen(PORT, () => {
         console.log('Server is running', PORT)
      })
   } catch (err) {
      console.log(err)
   }
}

start();