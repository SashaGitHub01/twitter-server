import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt, JwtFromRequestFunction, } from 'passport-jwt';
import { IUserModel, UserModel } from '../models/UserModel';
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
   secretOrKey: process.env.SECRET_KEY as string,
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

passport.use(new GoogleStrategy({
   clientID: process.env.GOOGLE_CLIENT_ID as string,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
   callbackURL: process.env.PROXY as string + "/api/auth/google/callback"
},
   async (accessToken, refreshToken, profile, cb) => {
      if (profile) {
         try {
            const login = profile._json.email?.split('@')[0];
            const user = await UserModel.findOne({ username: login });

            if (user) {
               cb(null, user);
            }

            if (!user) {
               const size = '=s220-c';
               const picture = profile._json.picture?.split('=s')[0] + size;

               const data: IUserModel = {
                  email: profile._json.email as string,
                  username: login as string,
                  fullName: profile._json.name as string,
                  avatar_url: picture || 'https://res.cloudinary.com/twitter-uploads/image/upload/c_scale,w_250/v1638546128/Avatars/ktedmkkvjlhv7wo2s7wd.jpg',
                  tweets: [],
                  likes: [],
                  followers: [],
                  following: [],
                  confirmed_hash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
               }
               const newUser = await UserModel.create(data);

               cb(null, newUser);
            }
         } catch (err) {
            cb('err');
         }
      }
   }
));

passport.serializeUser((id: any, done) => {
   done(null, id);
});

passport.deserializeUser(async (id, done) => {
   const user = await UserModel.findById(id);
   done(null, user);
});

export { passport };