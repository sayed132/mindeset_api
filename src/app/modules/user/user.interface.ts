import { Gender } from "@prisma/client";

export interface IUserFilterRequest {
  name?: string | undefined;
  email?: string | undefined;
}


export interface  IUserUpdate {
  name?: string
  email?: string
  dob?: string
  location?: string,
  gender?:Gender
}