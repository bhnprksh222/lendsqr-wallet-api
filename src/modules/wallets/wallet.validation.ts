import Joi from "joi";

export const amountSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  reference: Joi.string().trim().optional(),
});

export const transferSchema = Joi.object({
  receiverUserId: Joi.string().uuid().required(),
  amount: Joi.number().positive().precision(2).required(),
  reference: Joi.string().trim().optional(),
});
