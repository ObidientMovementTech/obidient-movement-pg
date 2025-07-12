import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/aws.js";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import Busboy from 'busboy';

/**
 * Uploads a file buffer to AWS S3
 * @param {Buffer} buffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - S3 file URL
 */
export const uploadBufferToS3 = async (buffer, originalName, options = {}) => {
  try {
    const fileExtension = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Construct the full key with AWS_LOCATION as base folder
    const baseFolder = process.env.AWS_LOCATION || '';
    let key = fileName;

    if (baseFolder && options.folder) {
      key = `${baseFolder}/${options.folder}/${fileName}`;
    } else if (baseFolder) {
      key = `${baseFolder}/${fileName}`;
    } else if (options.folder) {
      key = `${options.folder}/${fileName}`;
    }

    const uploadParams = {
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || 'application/octet-stream',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct the public URL
    const region = process.env.AWS_S3_REGION_NAME;
    const bucketName = process.env.AWS_STORAGE_BUCKET_NAME;

    // Use the standard S3 URL format
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    throw new Error("S3 upload failed: " + error.message);
  }
};

/**
 * Uploads a file to S3, handling both file paths and buffers
 * Compatible with legacy code that expects file.path and new serverless approach
 */
export const uploadToS3 = async (file, options = {}) => {
  try {
    let result;

    if (file.buffer) {
      // Handle direct buffer upload
      result = await uploadBufferToS3(file.buffer, file.originalname || file.name || 'file', {
        contentType: file.mimetype,
        ...options
      });
    } else {
      throw new Error("File buffer is required for S3 upload");
    }

    return result;
  } catch (error) {
    throw new Error("Upload failed: " + error.message);
  }
};

/**
 * Deletes a file from S3
 * @param {string} fileUrl - The S3 file URL
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    throw new Error("S3 delete failed: " + error.message);
  }
};

/**
 * Middleware factory for handling file uploads using busboy
 * Returns middleware function that's compatible with existing upload handling
 */
export const parseFileUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    if (req.headers && req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      const busboy = Busboy({ headers: req.headers });

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const chunks = [];

        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', () => {
          const buffer = Buffer.concat(chunks);
          req.file = {
            fieldname,
            originalname: filename,
            mimetype: mimeType,
            buffer,
            size: buffer.length
          };
        });
      });

      busboy.on('field', (fieldname, value) => {
        req.body = req.body || {};
        req.body[fieldname] = value;
      });

      busboy.on('finish', () => {
        next();
      });

      req.pipe(busboy);
    } else {
      next();
    }
  };
};

/**
 * Upload file and return secure URL (main function used by controllers)
 */
export const handleFileUpload = async (file, folder = 'uploads') => {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const fileUrl = await uploadToS3(file, { folder });
    return fileUrl;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Legacy compatibility exports
export const uploadFile = handleFileUpload;
export const deleteFile = deleteFromS3;
