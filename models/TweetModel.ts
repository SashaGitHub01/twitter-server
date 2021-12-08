import { Schema, model, Document } from "mongoose";

export interface iFile {
   url: string,
   id: string
}

export interface ITweetSchema {
   _id?: string,
   user?: Schema.Types.ObjectId,
   text?: string,
   images?: iFile[],
   comments: Schema.Types.ObjectId[],
   likes: Schema.Types.ObjectId[],
}

export type TweetModelType = ITweetSchema & Document;

const TweetSchema = new Schema<ITweetSchema>({
   text: {
      type: String,
      required: true,
   },

   user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },

   comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', }],

   likes: [{ type: Schema.Types.ObjectId, ref: 'User', unique: true }],

   images: [{ type: String }],
},
   {
      timestamps: true
   });

export const TweetModel = model<TweetModelType>('Tweet', TweetSchema);