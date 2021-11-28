import { ITweetSchema, TweetModel } from "../models/TweetModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';
import { isValidObjectId } from "mongoose";
import { validationResult } from "express-validator";
import { IUserModel } from "../models/UserModel";

class UserController {
   index = async (req: express.Request, res: express.Response) => {
      try {
         const tweets = await TweetModel.find({}).sort({ createdAt: '-1' }).populate('user').exec();

         return res.json({
            status: 'success',
            data: tweets
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }

   getOne = async (req: express.Request, res: express.Response) => {
      try {
         const id = req.params.id;

         if (!isValidObjectId(id)) {
            return res.status(400)
         }

         const tweet = await TweetModel.findById(id).populate('user');

         if (!tweet) {
            return res.status(404).send();
         }

         return res.json({
            status: 'success',
            data: tweet
         })

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            error: err
         })
      }
   }

   create = async (req: express.Request, res: express.Response) => {
      try {
         const user = req.user as IUserModel;

         if (!user) {
            return res.status(400).send();
         }

         const errors = validationResult(req);

         if (!errors.isEmpty()) {
            return res.status(403).json({
               status: 'error',
               errors,
            })
         }

         const data: ITweetSchema = {
            text: req.body.text,
            user: user._id
         }

         const tweet = await TweetModel.create(data);

         return res.json({
            status: 'success',
            data: tweet
         })

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            error: err
         })
      }
   }

   delete = async (req: express.Request, res: express.Response) => {
      try {
         const id = req.params.id;
         const user = req.user as IUserModel;

         if (!isValidObjectId(id)) {
            return res.status(400).send();
         }

         const tweet = await TweetModel.findById(id).exec();

         if (!tweet) {
            return res.status(404).send();
         }

         if (String(tweet.user) !== String(user._id)) {
            return res.status(403).send();
         }

         tweet.remove();

         return res.json({
            status: 'success',
            data: tweet
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }

   update = async (req: express.Request, res: express.Response) => {
      try {
         const id = req.params.id;
         const user = req.user as IUserModel;

         if (!isValidObjectId(id)) {
            return res.status(400).send();
         }

         const newText = req.body.text;
         const tweet = await TweetModel.findById(id).exec();

         if (!tweet) {
            return res.status(404).send();
         }

         if (String(tweet.user) !== String(user._id)) {
            return res.status(403).send();
         }

         tweet.text = newText;
         tweet.save();

         return res.json({
            status: 'success',
            data: tweet
         })

      } catch (err) {
         return res.status(500).json({
            error: err
         })
      }
   }
}

export default new UserController();