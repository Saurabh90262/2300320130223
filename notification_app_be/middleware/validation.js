const Joi = require("joi");

exports.validateNotification = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid("placement", "result", "event").required(),
    title: Joi.string().max(200).required(),
    message: Joi.string().max(1000).required(),
    metadata: Joi.object(),
    category: Joi.string().valid("urgent", "important", "normal"),
    actionUrl: Joi.string().uri(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  req.body = value;
  next();
};

exports.validateUser = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("student", "admin", "coordinator"),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  req.body = value;
  next();
};
