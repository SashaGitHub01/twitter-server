import express from 'express';
import cloudinary from 'cloudinary';
import { UserModel } from '../models/UserModel';

class UploadFilesController {
   index = async (req: express.Request, res: express.Response) => {
      try {
         const files = req.files as Express.Multer.File[];

         if (!files) return res.status(400).send();

         const prom = files.map(async (file: Express.Multer.File) => new Promise((resolve) => {
            cloudinary.v2.uploader.upload_stream({ folder: 'Images' }, (error, result) => {
               if (error || !result) {
                  return res.status(500).json({
                     status: 'error',
                     data: error
                  })
               }
               console.log(result)
               resolve(result.secure_url);

            }).end(file.buffer);
         }))

         Promise.all(prom)
            .then(data => res.json({
               status: 'success',
               data: data
            }));


      } catch (err) {
         return res.status(500).json({
            status: 'error',
            data: null
         })
      }
   }

   avatar = async (req: express.Request, res: express.Response) => {
      try {
         const user = await UserModel.findById(req.user);

         if (!user) return res.status(404).send();

         const file = req.file as Express.Multer.File;

         if (!file) return res.status(400).send();

         cloudinary.v2.uploader.upload_stream({ folder: 'Avatars' }, (error, result) => {
            if (error || !result) {
               throw Error('Upload error')
            }

            const url = result.secure_url;

            user.update({ avatar_url: url });

            user.save();

            return res.json({
               status: 'succes',
               data: user
            })

         }).end(file.buffer)

      } catch (err) {
         return res.json({
            status: 'error',
            data: null
         })
      }
   }
}

export default new UploadFilesController();