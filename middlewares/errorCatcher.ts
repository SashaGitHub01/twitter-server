import express, { NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type MyError = Error & { status: number } & { errors: string[] }

export const errorCatcher = (err: MyError, req: express.Request, res: express.Response, next: NextFunction) => {
   console.log(err)
   if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message, errors: err.errors })
   }

   return res.status(500).json({ message: 'Ошибка сервера' })
}