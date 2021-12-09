import express from 'express';
import { UserModel } from '../models/UserModel';

class FollowController {
   create = async (req: express.Request, res: express.Response) => {
      try {
         const userId = req.user;
         const id = req.params.id;

         if (!userId) return res.status(401).send();

         const user = await UserModel.findById(id);
         const me = await UserModel.findById(userId);

         if (!me || !user) return res.status(404).send();

         await me.updateOne({ $push: { following: id } }, { new: true })
         await me.save();

         await user.updateOne({ $push: { followers: userId } })
         await user.save();

         return res.json({
            status: 'success',
            data: id,
         })

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

         const user = await UserModel.findById(id);
         const me = await UserModel.findById(userId);

         if (!me || !user) return res.status(404).send();

         await me.updateOne({ $pull: { following: id } }, { new: true })
         await me.save();

         await user.updateOne({ $pull: { followers: userId } })
         await user.save();

         return res.json({
            status: 'success',
            data: id,
         })
      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }
}

export default new FollowController();