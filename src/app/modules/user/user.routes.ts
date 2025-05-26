import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from '../user/user.validation';
import { UserControllers } from '../user/user.controller';
import { multerUpload } from '../../utils/multerUpload';
import { multerUploadMultiple } from '../../utils/multipleFile';
import { updateMulterUpload } from '../../utils/updateMulterUpload';
import { parseBody } from '../../middlewares/parseBody';
import { UserRole } from '@prisma/client';
const router = express.Router();

router.post(
  '/',
  validateRequest(UserValidations.registerUser),
  UserControllers.registerUser
);


// router.get('/', auth(UserRole.ADMIN), UserControllers.getAllUsers);
router.put('/', auth(), validateRequest(UserValidations.updateUserSchema), UserControllers.updateMyProfile);
// router.get('/me', auth(), UserControllers.getMyProfile);
router.get('/streak', auth(),UserControllers.getStreak)
router.put('/do-not-disturb', auth(),UserControllers.doNotDisturb )

router.post(
  '/forgot-password',auth(),
  validateRequest(UserValidations.forgetPasswordSchema),
  UserControllers.forgotPassword,
);

router.get(
  '/',
  auth(UserRole.ADMIN),
  UserControllers.getAllUsers,
)



// router.get('/earnings', auth(), UserControllers.getEarnings);

// router.post(
//   '/social-sign-in',
//   //validateRequest(UserValidations.socialLoginSchema),
//   UserControllers.socialLogin,
// );

// router.post(
//   '/social-sign-up',
//   //validateRequest(UserValidations.socialLoginSchema),
//   UserControllers.socialRegister,
// );


// router.get('/:id',auth(), UserControllers.getUserDetails);

// router.put(
//   '/student-id-info',
//   updateMulterUpload.single('studentIdImage'),
//   parseBody,
//   auth(UserRole.USER),
//   UserControllers.studentIdInfo,
// );



// router.put('/update-password', auth(), UserControllers.updateMyPassword);

// router.put(
//   '/approve-student/:id',
//   auth(UserRole.ADMIN),
//   UserControllers.updateStudentIdStatus,
// );

// router.put('/update-user-role', auth(), UserControllers.updateUserRoleStatus);

// router.put('/change-password', auth(), UserControllers.changePassword);


router.post('/resend-otp',auth(), UserControllers.resendOtp);

// router.put(
//   '/verify-otp',auth(),
//   validateRequest(UserValidations.verifyOtpSchema),
//   UserControllers.verifyOtp
// );

router.put(
  '/verify-otp-forgot-password',auth(),
  validateRequest(UserValidations.verifyOtpSchema),
  UserControllers.verifyOtpForgotPassword
);

router.put('/reset-password', UserControllers.updatePassword);


// router.post(
//   '/withdraw',
//   auth(),
//   UserControllers.withdrawBalance,
// );

// router.put(
//   '/update-profile-image',
//   multerUpload.single('profileImage'),
//   auth(),
//   UserControllers.updateProfileImage,
// );

// router.put(
//   '/id-proof',
//   multerUploadMultiple.fields([
//     { name: 'frontIdCard', maxCount: 1 },
//     { name: 'backIdCard', maxCount: 1 },
//   ]),
//   auth(),
//   UserControllers.uploadIdProof,
// );

// router.put(
//   '/update-student-id-status/:id',
//   auth(UserRole.ADMIN),
//   UserControllers.updateStudentStatus,
// );

export const UserRouters = router;
