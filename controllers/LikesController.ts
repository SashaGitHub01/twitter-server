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

         const user = await UserModel.findById(userId);
         const tweet = await TweetModel.findById(id);
         if (!tweet || !user) return res.status(400).send();

         if (tweet.likes.includes(userId as Schema.Types.ObjectId)
            || user.likes.includes(id as unknown as Schema.Types.ObjectId)) {
            await tweet.updateOne({ $pull: { likes: userId } })
            await user.updateOne({ $pull: { likes: id } })
         } else {
            await tweet.updateOne({ $push: { likes: userId } }, { new: true });
            await user.updateOne({ $push: { likes: id } }, { new: true });
         }

         await tweet.save();
         await user.save();

         return res.json({
            status: 'success',
            data: userId
         })

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }
}

export default new LikesController();