import express from 'express';
import morgan from 'morgan';
import { config } from 'dotenv';
config();
import mongoose from 'mongoose';
import UserController from './controllers/UserController';
import { registerValidator } from './validators/register';
import passport from 'passport';
import './core/passport';


const app = express();

const PORT = process.env.PORT || 3001;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(passport.initialize());
app.use(express.json());

app.get('/users', UserController.index);

app.get('/users/:username', UserController.getOne);

app.post('/auth/register', registerValidator, UserController.create);

app.get('/auth/me', passport.authenticate('jwt'), UserController.authMe);

app.post('/auth/login', passport.authenticate('local'), UserController.afterLogin);

app.get('/auth/verify', registerValidator, UserController.verify);

const start = async () => {
   try {
      await mongoose.connect(process.env.DB_URL ||
         'mongodb+srv://admin:admin@cluster0.msbqj.mongodb.net/twitter?retryWrites=true&w=majority');
      app.listen(PORT, () => {
         console.log('Server is running')
      })
   } catch (err) {
      console.log(err)
   }
}

start();