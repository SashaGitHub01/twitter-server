import express from 'express';
import { Schema } from 'mongoose';
import { TweetModel } from '../models/TweetModel';
import { UserModel } from '../models/UserModel';

class LikesController {
   create = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;
         const id = req.params.id;

         if (!userId) return res.status(401).send();

         const tweet = await TweetModel.findById(id);

         if (!tweet) return res.status(400).send();

         if (tweet?.likes.includes(userId as Schema.Types.ObjectId)) return res.status(400).send();

         await tweet.updateOne({ $push: { likes: userId } }, { new: true });

         tweet.save();

         res.json({
            status: 'success',
            data: tweet
         })

         const user = await UserModel.findById(userId);

         if (!user) return res.status(401).send();

         await user.updateOne({ $push: { likes: id } }, { new: true });
         await user.save();
         console.log(user.likes)
         return;

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }

   delete = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;
         const id = req.params.id;

         if (!userId) return res.status(401).send();

         const tweet = await TweetModel.findByIdAndUpdate(id, { $pull: { likes: userId } }, { new: true });

         if (!tweet) return res.status(400).send();

         res.json({
            status: 'success',
            data: tweet
         })

         await UserModel.findByIdAndUpdate(userId, { $pull: { likes: id } }, { new: true });

         return;
      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }
}

export default new LikesController();