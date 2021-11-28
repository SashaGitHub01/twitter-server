import { Schema, model, Document } from "mongoose";

export interface ITweetSchema {
   _id?: string,
   user?: Schema.Types.ObjectId,
   text?: string
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
   }
},
   {
      timestamps: true
   });

export const TweetModel = model<TweetModelType>('Tweet', TweetSchema);