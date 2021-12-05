import { IUserModel, UserModel } from "../models/UserModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import mailer from '../core/nodemailer';
import cloudinary from "cloudinary";

interface IUser {
   _id: any,
   [i: string]: string
}

class UserController {
   index = async (req: express.Request, res: express.Response) => {
      try {
         const users = await UserModel.find({}).exec()

         return res.json({
            status: 'success',
            data: users
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }

   getOne = async (req: express.Request, res: express.Response) => {
      try {
         const user = await UserModel.findOne({ username: req.params.username }).exec()

         if (!user) {
            return res.status(404).json({
               status: 'error',
               error: 'User not found'
            })

         } else {
            await user?.populate('tweets');

            return res.json({
               status: 'success',
               data: user
            })
         }

      } catch (err) {
         return res.json({
            status: 'error',
            error: err
         })
      }
   }

   create = async (req: express.Request, res: express.Response) => {
      try {
         const errors = validationResult(req);

         if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors })
         }

         const data = {
            email: req.body.email,
            username: req.body.username,
            fullName: req.body.fullName,
            avatar_url: 'https://res.cloudinary.com/twitter-uploads/image/upload/c_scale,w_250/v1638546128/Avatars/ktedmkkvjlhv7wo2s7wd.jpg',
            password: generateMD5(req.body.password + process.env.SECRET_KEY),
            tweets: [],
            confirmed_hash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
         }

         const user = await UserModel.create(data);

         if (!user) {
            return res.status(400).send();
         }

         const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY || 'kjskszpj', { expiresIn: '30d' });

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

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            error: 'error'
         })
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

   afterLogin = async (req: express.Request, res: express.Response) => {
      try {
         const user = req.user as IUser;

         if (!user) return res.status(404);

         const token = jwt.sign({ id: user?._id }, process.env.SECRET_KEY || 'kjskszpj', { expiresIn: '30d' });

         if (req.session) {
            req.session.token = token;
         }

         return res.redirect('/auth/me');

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            error: 'error'
         })
      }
   }

   authMe = async (req: express.Request, res: express.Response) => {
      try {
         if (req.session?.token) {
            const user = await axios.get(`${process.env.PROXY}/user`, {
               headers: {
                  'token': req.session.token
               }
            })

            return res.json({
               status: 'success',
               data: user.data.data
            })
         }

         return res.json({
            status: 'error',
            data: null
         })

      } catch (err) {
         return res.status(500).json({
            error: 'error',
            status: 'error'
         })
      }
   }

   logout = async (req: express.Request, res: express.Response) => {
      try {
         req.session = null;

         return res.status(200).send()

      } catch (err) {
         return res.status(500).json({
            error: 'error',
            status: 'error'
         })
      }
   }

   getMe = async (req: express.Request, res: express.Response) => {
      try {
         const token = req.headers.token;

         if (!token) return res.status(401).send();

         const data = jwt.decode(token as string, { json: true });

         if (data?.id) {
            const user = await UserModel.findById(data.id);

            await user?.populate('tweets');

            return res.json({
               status: 'succes',
               data: user,
            })
         } else {
            return res.json({
               status: 'error',
               data: null,
            })
         }

      } catch (err) {
         return res.status(500).json({
            error: err,
            status: 'error'
         })
      }
   }
}

export default new UserController();