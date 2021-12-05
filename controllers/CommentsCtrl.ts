import express from 'express'
import { UserModel } from '../models/UserModel';
import { TweetModel } from '../models/TweetModel';
import { CommentModel, ICommentSchema } from '../models/CommentModel';
import { Schema } from 'mongoose';

class CommentsController {
   create = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;
         const id = req.params.id;

         if (!userId && !id) return res.status(401).send();

         const tweet = await TweetModel.findById(id).populate('user');

         if (!tweet) return res.status(404).send();

         const data: ICommentSchema = {
            text: req.body.text,
            user: userId as Schema.Types.ObjectId,
            tweet: tweet._id as Schema.Types.ObjectId
         }

         const comment = await (await CommentModel.create(data)).populate('user');

         if (!comment) return res.status(400).send();

         tweet.comments.push(comment._id);

         await tweet.save();

         return res.json({
            status: 'success',
            data: comment
         })

      } catch (err) {
         return res.status(500).json({
            status: 'error',
            error: err
         })
      }
   }
}

export default new CommentsController();