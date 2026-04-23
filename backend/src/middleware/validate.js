const { ValidationError } = require('../utils/errors');

function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError(result.error.errors.map((e) => e.message).join(', ')));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
