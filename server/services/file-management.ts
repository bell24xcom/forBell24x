import fs from 'fs/promises';
import path from 'path';

export async function uploadFile(fileBuffer: Buffer, filename: string, folder: string = 'uploads') {
  const uploadDir = path.resolve(process.cwd(), folder);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, fileBuffer);
  return { filePath, message: 'File uploaded successfully' };
}

export async function listFiles(folder: string = 'uploads') {
  const dirPath = path.resolve(process.cwd(), folder);
  const files = await fs.readdir(dirPath);
  return files;
}

export async function deleteFile(filename: string, folder: string = 'uploads') {
  const filePath = path.resolve(process.cwd(), folder, filename);
  await fs.unlink(filePath);
  return { filename, message: 'File deleted successfully' };
}
