import express from "express";
import auth from "../../middlewares/auth";
import { notificationController } from "./Notification.controller";

const router = express.Router();


router.post(
  "/user/:userId",
  auth(),
  notificationController.sendNotification
);

router.post("/users", auth(), notificationController.sendNotificationToMultipleUsers)

router.post(
  "/send-notification",
  auth(),
  notificationController.sendNotifications
);

router.get("/", auth(), notificationController.getNotifications);
router.get(
  "/:notificationId",
  auth(),
  notificationController.getSingleNotificationById
);

export const notificationsRoute = router;
