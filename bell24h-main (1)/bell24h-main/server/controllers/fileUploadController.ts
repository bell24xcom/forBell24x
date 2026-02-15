// server/controllers/fileUploadController.ts
import express from 'express';
import multer from 'multer'; // Import multer
import { uploadToS3, deleteFromS3 } from '../../src/utils/aws-s3'; // Adjusted import path

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload a file to S3 using multer
router.post('/upload', upload.single('file'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    
    const key = `rfq-documents/${Date.now()}-${fileName}`; // Add timestamp to prevent overwrites
    
    const s3Response = await uploadToS3(key, fileBuffer);
    res.status(200).json({ url: s3Response.Location, key: key }); // Return key as well for potential deletion
  } catch (error) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete a file from S3
router.delete('/delete/:key(*)', async (req: express.Request, res: express.Response) => { // Added (*) to key to allow slashes
  try {
    const { key } = req.params;
    await deleteFromS3(key);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion failed:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
