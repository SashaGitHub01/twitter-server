import { IUserModel, UserModel } from "../models/UserModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';

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

   getOne = async (req: express.Request, res: express.Response) => { }

   create = async (req: express.Request, res: express.Response) => { }

   delete = async (req: express.Request, res: express.Response) => { }
}

export default new UserController();