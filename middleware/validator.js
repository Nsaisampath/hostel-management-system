const Joi = require('joi');

const studentSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  contact: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required(),
  room_preference: Joi.string().required()
});

const roomSchema = Joi.object({
  room_number: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  availability_status: Joi.string().valid('available', 'occupied', 'maintenance').required(),
  floor: Joi.string().optional(),
  room_type: Joi.string().optional()
});

const feeSchema = Joi.object({
  student_id: Joi.string().required(),
  amount: Joi.number().positive().required(),
  payment_date: Joi.date().optional(),
  due_date: Joi.date().required(),
  status: Joi.string().valid('pending', 'paid', 'overdue').required(),
  payment_method: Joi.string().optional(),
  transaction_id: Joi.string().optional()
});

const noticeSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10)
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validateStudent: validateRequest(studentSchema),
  validateRoom: validateRequest(roomSchema),
  validateFee: validateRequest(feeSchema),
  validateNotice: validateRequest(noticeSchema)
}; 