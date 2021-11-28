import { Schema, model, Document } from "mongoose";

export interface IUserModel {
   _id?: string,
   email: string,
   fullName: string,
   username: string,
   password: string,
   confirmed_hash: string,
   confirmed?: boolean,
   location?: string,
   about?: string,
   website?: string,
}

export type UserModelType = IUserModel & Document;

const UserSchema = new Schema<IUserModel>({
   email: {
      unique: true,
      type: String,
      required: true
   },

   fullName: {
      type: String,
      required: true
   },

   username: {
      unique: true,
      type: String,
      required: true
   },

   password: {
      type: String,
      required: true,
   },

   confirmed: {
      type: Boolean,
      default: false,
   },

   confirmed_hash: {
      type: String,
      required: true,
      select: false
   },

   location: {
      type: String,
   },

   about: {
      type: String,
   },

   website: {
      type: String,
   },
})

UserSchema.set('toJSON', {
   transform: function (doc, ret) {
      delete ret['password'];
      delete ret['confirmed_hash'];

      return ret;
   }
})

export const UserModel = model<UserModelType>('User', UserSchema);