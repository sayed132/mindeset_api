import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from '../auth/auth.controller';
import { authValidation } from '../auth/auth.validation';
const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

export const AuthRouters = router;
