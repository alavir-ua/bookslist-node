const {body, validationResult} = require('express-validator')

const userRegValidationRules = () => {
  return [
    body('name').not().isEmpty().withMessage('Поле "Имя" не должно быть пустым').isAlpha().withMessage('В имени' +
      ' должны' +
      ' быть' +
      ' только буквы алфавита').isLength({min: 4}).withMessage('В имени должно быть не менее 4 символов'),
    body('email').not().isEmpty().withMessage('Поле "Email" не должно быть пустым').isEmail().withMessage('Должен быть' +
      ' формат электронной почты'),
    body('password').not().isEmpty().withMessage('Поле "Пароль" не должнен быть пустым').isLength({min: 6}).withMessage('В пароле должно быть не менее 6 символов').isAlphanumeric().withMessage('В пароле должны быть только буквенно-цифровые символы'),
    body('confirmPassword', 'Пароли не совпадают').custom((value, {req}) => (value === req.body.password))
  ]
}

const userUpdValidationRules = () => {
  return [
    body('email').not().isEmpty().withMessage('Поле "Email" не должно быть пустым').isEmail().withMessage('Должен быть' +
      ' формат электронной почты'),
    body('password').not().isEmpty().withMessage('Поле "Пароль" не должнен быть пустым').isLength({min: 6}).withMessage('В пароле должно быть не менее 6 символов').isAlphanumeric().withMessage('В пароле должны быть только буквенно-цифровые символы'),
    body('confirmPassword', 'Пароли не совпадают').custom((value, {req}) => (value === req.body.password))
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  next();
}

module.exports = {userRegValidationRules, userUpdValidationRules, validate};

