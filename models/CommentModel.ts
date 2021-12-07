import { Schema, model, Document } from "mongoose";

export interface ICommentSchema {
   _id?: string,
   user: Schema.Types.ObjectId,
   text: string,
   tweet: Schema.Types.ObjectId,
}

export type CommentModelType = ICommentSchema & Document;

const CommentSchema = new Schema<ICommentSchema>({
   text: {
      type: String,
      required: true,
   },

   user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },

   tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      required: true
   }
},
   {
      timestamps: true
   });

export const CommentModel = model<CommentModelType>('Comment', CommentSchema);