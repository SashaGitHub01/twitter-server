import { body } from 'express-validator';

export const tweetsValidation = [
   body('text', 'Введите текст').custom((value, { req }) => {
      if (!value && !req.body?.images) throw Error('Нельзя создать пустой твит');

      return ' ';
   })
      .isLength({ max: 250 })
      .withMessage('Максимальное кол-во символов - 250')
]