import express from 'express';
import { config } from 'dotenv';
config();
import cors from 'cors';
import passport from 'passport';
import './core/passport';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import { router } from './routes';
import './core/cloudinary';
import morgan from 'morgan';
import { errorCatcher } from './middlewares/errorCatcher'

const app = express();

const PORT = process.env.PORT || 3001;

//MW
app.set('trust proxy', 1);
app.use(cors({
   origin: ['http://localhost:3000', process.env.CLIENT],
   credentials: true
}));
app.use(cookieSession({
   name: 'session',
   keys: ['key1'],
   maxAge: 7777777777777777,
   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
   httpOnly: process.env.NODE_ENV === 'production' ? false : true,
   secure: process.env.NODE_ENV === 'production' ? true : false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());

//ROUTERS
app.use('/api', router)
app.use(errorCatcher)

const start = async () => {
   try {
      await mongoose.connect(process.env.DB_URL as string, { autoIndex: false });
      app.listen(PORT, () => {
         console.log('Server is running', PORT)
      })
   } catch (err) {
      console.log(err)
   }
}

start();