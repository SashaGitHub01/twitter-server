import { body } from 'express-validator';

export const registerValidator = [
   body('email', 'Укажите e-mail')
      .isEmail()
      .withMessage('Неверный e-mail')
      .isLength({
         min: 5,
         max: 30
      })
      .withMessage('Данное поле должно содержать от 5 до 30 символов'),

   body('fullName', 'Укажите Ваше имя')
      .isString()
      .isLength({
         min: 2,
         max: 30
      })
      .withMessage('Данное поле должно содержать от 2 до 30 символов'),

   body('username', 'Укажите логин')
      .isString()
      .isLength({
         min: 2,
         max: 30
      })
      .withMessage('Данное поле должно содержать от 2 до 30 символов'),

   body('password', 'Укажите пароль')
      .isString()
      .isLength({
         min: 6,
         max: 50
      })
      .withMessage('Минимальный длина пароля - 6 символов')
      .custom((value, { req }) => {
         if (value !== req.body.password2) {
            throw new Error('Пароли не совпадают')
         } else {
            return value
         }
      })
]
