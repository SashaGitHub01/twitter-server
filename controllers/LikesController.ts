import express from 'express';
import { TweetModel } from '../models/TweetModel';
import { UserModel } from '../models/UserModel';

class LikesController {
   create = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;
         const id = req.params.id;

         if (!userId) return res.status(401).send();

         const tweet = await TweetModel.findByIdAndUpdate(id, { $push: { likes: userId } }, { new: true });

         if (!tweet) return res.status(400).send();

         res.json({
            status: 'success',
            data: tweet
         })

         return await UserModel.findByIdAndUpdate(userId, { $push: { likes: id } });

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

         return await UserModel.findByIdAndUpdate(userId, { $pull: { likes: id } });

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }
}

export default new LikesController();