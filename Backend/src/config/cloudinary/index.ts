// Require the cloudinary library

import { v2 as cloudinary } from "cloudinary";



const options = {
    use_filename: true,
    resourceType: "image",
    folder: "fit-track-images",
    format: "jpg",
    quality: 90,
    crop: "fill",
    width: 400,
    height: 300,
    overwrite: true,
  };

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloudName: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudSecret: process.env.CLOUDINARY_SECRET,
    secure: true,
  });

export { cloudinary, options };