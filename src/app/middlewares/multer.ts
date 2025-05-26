import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

interface UploadResponse {
  Location: string; // This will store the formatted URL with "https://"
  Bucket: string;
  Key: string;
  ETag?: string;
}

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Configure upload handlers
const uploadSingle = upload.single("image");
const uploadMultipleImage = upload.fields([
  {
    name: "images",
    maxCount: 10,
  },
]);
const updateProfile = upload.fields([
  { name: "profile", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);
const uploadfile = upload.fields([
  { name: "licFront", maxCount: 1 }, // Accepts one file for licFront
  { name: "licBack", maxCount: 1 }   // Accepts one file for licBack
]);

const destinationFile = upload.fields([
  { name: "fromImage", maxCount: 1 }, // Accepts one file for licFront
  { name: "toImage", maxCount: 1 }   // Accepts one file for licBack
]);

// Configure DigitalOcean Spaces
const s3Client = new S3Client({
  region: "us-east-1", // Replace with your region if necessary
  endpoint: process.env.DO_SPACE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "",
  },
});

// Upload file to DigitalOcean Spaces
const uploadToDigitalOcean = async (
  file: Express.Multer.File
): Promise<UploadResponse> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  try {
    const Key = `kumba/${Date.now()}_${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
      Body: file.buffer, // Use the file buffer directly
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    };

    // Upload file to DigitalOcean Space
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Format the URL to include "https://"
    const fileURL = `${process.env.DO_SPACE_ENDPOINT}/${process.env.DO_SPACE_BUCKET}/${Key}`;
    return {
      Location: fileURL,
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Export file uploader
export const fileUploader = {
  uploadSingle,
  uploadMultipleImage,
  updateProfile,
  uploadfile,
  destinationFile,
  uploadToDigitalOcean,
};
