import { IUserModel, UserModel } from "../models/UserModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import mailer from '../core/nodemailer';
import cloudinary from "cloudinary";
import { ApiError } from "../utils/ApiError";

interface IUser {
   _id: any,
   [i: string]: string
}

class UserController {
   index = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         const users = await UserModel.find({}).exec()

         return res.json({
            status: 'success',
            data: users
         })

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   getOne = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         const user = await UserModel.findOne({ username: req.params.username }).exec()
         if (!user) {
            return next(ApiError.notFound('User not found'))

         } else {
            await (await user?.populate('tweets')).populate('tweets.user')

            return res.json({
               status: 'success',
               data: user
            })
         }

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   create = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         const errors = validationResult(req);

         if (!errors.isEmpty()) {
            return next(ApiError.badReq(errors.array()[0].msg as string))
         }

         const data: IUserModel = {
            email: req.body.email,
            username: req.body.username,
            fullName: req.body.fullName,
            avatar_url: 'https://res.cloudinary.com/twitter-uploads/image/upload/c_scale,w_250/v1638546128/Avatars/ktedmkkvjlhv7wo2s7wd.jpg',
            password: generateMD5(req.body.password + process.env.SECRET_KEY),
            tweets: [],
            likes: [],
            followers: [],
            following: [],
            confirmed_hash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
         }

         const user = await UserModel.create(data);
         if (!user) {
            return next(ApiError.badReq('Invalid data'))
         }

         const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY as string, { expiresIn: '30d' });

         if (req.session) {
            req.session.token = token;
         }

         mailer.sendMail(
            {
               from: 'admin@twitter.com',
               to: data.email,
               subject: 'Подтверждение почты Twitter',
               html: `Перейдите <a href='http://localhost:3001/auth/verify?hash=${data.confirmed_hash}'>по этой ссылке</a>`
            }
         )

         return res.redirect('/auth/me');

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   verify = async (req: express.Request, res: express.Response) => {
      try {
         const hash = req.query.hash;

         if (!hash) {
            return res.status(404).json({
               error: 'User not found'
            })
         }

         const user = await UserModel.findOne({ confirmed_hash: hash as string })

         if (user) {
            user.confirmed = true;

            await user.save();

            return res.json({
               status: 'succes',
               data: user
            })

         } else {
            return res.status(404).json({
               error: 'User not found'
            })
         }

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }

   afterLogin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         const user = req.user as IUser;
         if (!user) return next(ApiError.unauthorized(''))

         const token = jwt.sign({ id: user?._id }, process.env.SECRET_KEY as string, { expiresIn: '30d' });

         if (req.session) {
            req.session.token = token;
         }

         return res.redirect('/auth/me');

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   googleAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         const user = req.user as IUser;
         if (!user) return res.status(401).send();

         const token = jwt.sign({ id: user?._id }, process.env.SECRET_KEY as string, { expiresIn: '30d' });

         if (req.session) {
            req.session.token = token;
         }

         return res.redirect(`${process.env.CLIENT}/`);

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   authMe = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         if (req.user) {
            const user = await UserModel.findById(req.user).populate('tweets')
            if (!user) return next(ApiError.notFound('User not found'))

            return res.json({
               data: user,
               status: 'success'
            })
         }

         return next(ApiError.unauthorized('Auth error'))

      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   logout = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         req.session = null;
         return res.status(200).send()
      } catch (err: any) {
         return next(ApiError.internal(err.message))
      }
   }

   getMe = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
         return next(ApiError.internal('DEPRICATED'))
      } catch (err: any) {
         return next(ApiError.internal('DEPRICATED'))
      }
   }
}

export default new UserController();