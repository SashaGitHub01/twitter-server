import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, JwtFromRequestFunction, } from 'passport-jwt';
import { UserModel } from '../models/UserModel';
import { generateMD5 } from '../utils/generateHash';
import express from 'express';

const getToken = (req: express.Request) => {
   const getJwtFunc: JwtFromRequestFunction = ExtractJwt.fromHeader('token');

   const token = getJwtFunc(req);

   if (token) {
      return token;
   }

   if (req.session) {
      return req.session.token as string;
   }

   return null;
}

passport.use(new LocalStrategy(
   async (login, password, done) => {
      try {
         const user = await UserModel.findOne({ $or: [{ username: login }, { email: login }] });

         if (!user) {
            return done(null, false);
         }

         if (user.password !== generateMD5(password + process.env.SECRET_KEY)) {
            return done(null, false);
         }

         return done(null, user);
      } catch (err) {
         return done(null, false)
      }
   }
));

passport.use(new JwtStrategy({
   secretOrKey: process.env.SECRET_KEY || '12345',
   jwtFromRequest: getToken as JwtFromRequestFunction
},
   async (payload, done) => {
      try {
         if (payload.id || payload.user._id) {
            return done(null, payload.id || payload.user.id);
         } else {
            return done(null, false);
         }

      } catch (err) {
         return done(err, false);
      }
   }));

passport.serializeUser((id: any, done) => {
   done(null, id);
});

passport.deserializeUser(async (id, done) => {
   console.log(id)
   const user = await UserModel.findById(id);

   done(null, user);
});

export { passport };