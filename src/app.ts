import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { PaymentController } from "./app/modules/payment/payment.controller";


const app: Application = express();
app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      "*"
    ],
    methods: ["GET, POST, PUT, DELETE, OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// app.use(
//   '/api/v1/stripe/payment-webhook',
//   express.raw({ type: 'application/json' }),
//   PaymentController.handleWebHook,
// );
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "The server is running. . .",
  });
});

app.use("/api/v1", router);
app.use("/onboarding-success", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Onboarding Successful 🎉</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          background-color: #f4f4f4;
          margin: 0;
          padding: 50px;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: auto;
        }
        h1 {
          color: #28a745;
        }
        p {
          color: #666;
          font-size: 18px;
        }
        .emoji {
          font-size: 50px;
        }
      </style>
    </head>
    <body>
      <div class="container">
  
   
        <p>Please click on “Done” first in the upper left-hand corner of the screen, then close the popup and confirm again. Thank you!</p>
      </div>
    </body>
    </html>
  `);
});

app.use("/reauthenticate", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reauthentication Required 🔐</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          background-color: #f4f4f4;
          margin: 0;
          padding: 50px;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: auto;
        }
        h1 {
          color: #d9534f;
        }
        p {
          color: #666;
          font-size: 18px;
        }
        .emoji {
          font-size: 50px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Please click on “Done” first in the upper left-hand corner of the screen, then close the popup and confirm again. Thank you!</p>
      </div>
    </body>
    </html>
  `);
});





app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
