import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';


const loginUserFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken: string;
  remember?:Boolean
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
if(!userData){
  throw new AppError(httpStatus.NOT_FOUND, 'Invalid login credentials, please try again.');
 
}
  if (!userData.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid login credentials, please try again.');
  }

  const isCorrectPassword: Boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid login credentials, please try again.');
  }
  let expiry = config.jwt.access_expires_in as string
  if (payload.remember){
    expiry = "1d"
  }
  
  const accessToken = await generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    expiry,
  );
  
  const user = await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      fcmToken: payload.fcmToken,
      accessToken
    },
  });

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    accessToken: accessToken,
  };
};

const logoutUser = async (userId:string)=>{
  const user = await prisma.user.findUnique({where:{id:userId}})

  if (!user){
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  await prisma.user.update({where:{id:userId}, data:{accessToken:null}})
  
}

export const AuthServices = { loginUserFromDB };
