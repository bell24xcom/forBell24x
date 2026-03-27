import express, { Request, Response } from 'express';
// If you see type errors for multer, run: npm install --save-dev @types/multer
import multer from 'multer';
import { uploadFile, listFiles, deleteFile } from '../services/file-management';

const router = express.Router();
const upload = multer();

// POST /api/files/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const result = await uploadFile(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// GET /api/files/list
router.get('/list', async (req: Request, res: Response) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: 'List files failed', details: error.message });
  }
});

// DELETE /api/files/:filename
router.delete('/:filename', async (req: Request, res: Response) => {
  try {
    const result = await deleteFile(req.params.filename);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Delete file failed', details: error.message });
  }
});

export default router;
// If you see errors for csurf, run: npm install csurf @types/csurf
