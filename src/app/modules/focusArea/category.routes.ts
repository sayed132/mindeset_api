import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { categoryController } from './category.controller';
import { categoryValidation } from './category.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(categoryValidation.createSchema),
  categoryController.createCategory,
);

router.get('/', auth(), categoryController.getCategoryList);

router.get('/:id', auth(), categoryController.getCategoryById);

router.put(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(categoryValidation.updateSchema),
  categoryController.updateCategory,
);

router.delete('/:id', auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
