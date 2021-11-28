import { IUserModel, UserModel } from "../models/UserModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import mailer from '../core/nodemailer';

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
               error: 'User not found'
            })

         } else {
            return res.json({
               status: 'success',
               data: user
            })
         }

      } catch (err) {
         return res.json({
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
            password: generateMD5(req.body.password + process.env.SECRET_KEY),
            confirmed_hash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
         }

         const user = await UserModel.create(data,);

         res.json({
            status: 'success',
            data: user
         })

         return mailer.sendMail(
            {
               from: 'admin@twitter.com',
               to: data.email,
               subject: 'Подтверждение почты Twitter',
               html: `Перейдите <a href='http://localhost:3001/auth/verify?hash=${data.confirmed_hash}'>по этой ссылке</a>`
            }
         )

      } catch (err) {
         return res.status(500).json({
            error: err
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
         if (!req.user) return res.status(404);

         const token = jwt.sign({ ...req.user }, process.env.SECRET_KEY || 'kjskszpj', { expiresIn: '30d' });

         return res.json({
            status: 'success',
            data: {
               user: req.user,
               token: token
            }
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }

   authMe = async (req: express.Request, res: express.Response) => {
      console.log('hey')
      try {
         if (!req.user) return res.status(404);

         return res.json({
            status: 'success',
            data: req.user
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }
}

export default new UserController();