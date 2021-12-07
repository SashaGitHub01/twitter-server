import { ITweetSchema, TweetModel } from "../models/TweetModel";
import express from 'express';
import { generateMD5 } from '../utils/generateHash';
import { isValidObjectId, ObjectId } from "mongoose";
import { validationResult } from "express-validator";
import { IUserModel, UserModel } from "../models/UserModel";

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

         const tweet = await TweetModel.findById(id).populate(
            { path: 'comments', populate: { path: 'user' } }
         ).populate('user');

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
         const id = req.user as IUserModel;

         const user = await UserModel.findById(id);

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
            text: req.body.text || ' ',
            images: req.body.images,
            user: user._id as ObjectId,
            comments: [],
            likes: []
         }

         const tweet = await (await TweetModel.create(data)).populate('user');

         await UserModel.updateOne({ _id: user._id }, { $push: { tweets: tweet } })

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

         if (String(tweet.user) !== String(user)) {
            return res.status(401).send();
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

   filterMedia = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;

         if (!userId) return res.status(401).send();

         const tweets = await TweetModel.find({ user: userId, images: { $not: { $size: 0 } } })
            .sort({ createdAt: '-1' })
            .populate('user')
            .exec();

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
}

export default new UserController();