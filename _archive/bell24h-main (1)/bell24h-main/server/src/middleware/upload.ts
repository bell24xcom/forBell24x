import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Upload configuration
const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
};

// Create multer instance
const upload = multer(uploadConfig);

// Error handling middleware
export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB',
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum is 5 files',
      });
    }

    return res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error.message === 'Invalid file type') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX',
    });
  }

  logger.error('File upload error:', error);
  res.status(500).json({
    status: 'error',
    message: 'File upload failed',
  });
};

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount?: number) => {
  return upload.array(fieldName, maxCount);
};

// Fields upload middleware
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return upload.fields(fields);
};

// Validate uploaded files
export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      status: 'error',
      message: 'No file uploaded',
    });
  }

  next();
};

// Clean up uploaded files
export const cleanupUploads = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const files = req.file ? [req.file] : req.files ? Object.values(req.files).flat() : [];

      files.forEach(file => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  next();
};

// Add file metadata to request
export const addFileMetadata = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    req.file = {
      ...req.file,
      url: `/uploads/${req.file.filename}`,
    };
  }

  if (req.files) {
    Object.keys(req.files).forEach(key => {
      req.files[key] = req.files[key].map(file => ({
        ...file,
        url: `/uploads/${file.filename}`,
      }));
    });
  }

  next();
}; 