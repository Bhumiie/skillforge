import cloudinary from "../config/cloudinary.js";

export const uploadBufferToCloudinary = (fileBuffer, originalName, fileType) => {
  return new Promise((resolve, reject) => {
    // Determine folder and resource_type based on type (image vs document)
    const isImage = fileType.startsWith("image/");
    const options = {
      folder: "skillswap",
      resource_type: isImage ? "image" : "raw",
      public_id: Date.now() + "-" + originalName.split(".")[0],
    };

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
};
