const { validationResult } = require('express-validator');


const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error('❌ Validation Failed:', JSON.stringify(errors.array(), null, 2));
    console.error('📦 Request Body:', req.body);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { validate, asyncHandler };
