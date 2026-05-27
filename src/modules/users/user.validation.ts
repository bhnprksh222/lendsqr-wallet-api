import Joi from "joi";

export const createUserSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  bvn: Joi.string().trim().allow(null, "").optional(),
  password: Joi.string().min(6).required(),
});
