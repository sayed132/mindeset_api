import { Gender } from '@prisma/client';
import z from 'zod';

const registerUser = z.object({
  
    name: z.string({
      required_error: 'name is required!',
    }),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'phone number is required!',
    }),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .optional(),
 
  email: z
    .string()
    .optional(),
    gender:z.nativeEnum(Gender).optional()
});

const forgetPasswordSchema = z.object({
  email:  z.string({required_error:"Email is required"}).email({message:"Email is invalid"})
});

const changePasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    newPassword: z.string({
      required_error: 'Password is required!',
    }),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.number({
      required_error: 'OTP is required!',
    }),
  }),
});

const socialLoginSchema = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'name is required!',
    }),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    fcmToken: z.string({
      required_error: 'Fcm token is required!',
    }),
  }),
});

const updateUserSchema = z.object({
  name:z.string().optional(),
  email:z.string().email()
})

export const UserValidations = {
  registerUser,
  updateProfileSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  changePasswordSchema,
  socialLoginSchema,
  updateUserSchema
};
