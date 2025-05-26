import { z } from 'zod';

const createSchema = z.object({
  
  focusName: z.string().min(1, 'Name is required'),

});

const updateSchema = z.object({
  
  focusName: z.string(),
  
});

export const categoryValidation = {
  createSchema,
  updateSchema,
};
