import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../errors/AppError';
import prisma from '../utils/prisma';
import { verifyToken } from '../utils/verifyToken';

const auth = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

   
      const session = await prisma.user.findFirst({
        where: { accessToken: token },
      });

      if (!session) {
        throw new AppError(408, "Your session does not exist!");
      }

      const verifyUserToken = verifyToken(
        token,
        config.jwt.access_secret as Secret,
      );

      console.log(verifyUserToken)

      // Check user is exist
      const user = await prisma.user.findUnique({
        where: {
          id: verifyUserToken.id,
        },
      });

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }


      req.user = {
        id:user.id,
        email:user.email,
        role:user.role
      };
     console.log(user)
      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Forbidden!');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
