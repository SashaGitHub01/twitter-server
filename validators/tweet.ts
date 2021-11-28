import { body } from 'express-validator';

export const tweetsValidation = [
   body('text', 'Введите текст')
      .isString()
      .isLength({
         max: 280
      })
      .withMessage('Максимальное кол-во символов - 280')
]