import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Yükleme dizinlerini oluştur
const uploadDir = path.join(process.cwd(), 'uploads');
const optimizedDir = path.join(uploadDir, 'optimized');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Orijinal dosya adını al (uzantısız)
    const originalName = path.parse(file.originalname).name;
    // Güvenli bir dosya adı oluştur
    const safeName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    // Benzersiz bir isim oluştur
    const uniqueName = `${safeName}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Sadece resim dosyalarını kabul et
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG, PNG ve WebP formatları desteklenir'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export const optimizeImage = async (
  file: Express.Multer.File,
  options: OptimizeOptions = {}
): Promise<string> => {
  const {
    width = 1200,
    height = 800,
    quality = 80
  } = options;

  // Orijinal dosya adını al (uzantısız)
  const originalName = path.parse(file.originalname).name;
  // Güvenli bir dosya adı oluştur
  const safeName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  // Optimize edilmiş dosya adı
  const optimizedFileName = `${safeName}-optimized-${uuidv4()}.webp`;
  const outputPath = path.join(optimizedDir, optimizedFileName);

  try {
    await sharp(file.path)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toFile(outputPath);

    // Orijinal dosyayı sil
    fs.unlinkSync(file.path);

    return `/uploads/optimized/${optimizedFileName}`;
  } catch (error) {
    // Hata durumunda dosyaları temizle
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
};

export const deleteImage = async (filePath: string): Promise<void> => {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  
  // Dosyanın var olduğunu kontrol et
  if (!fs.existsSync(fullPath)) {
    throw new Error('Dosya bulunamadı');
  }

  // Dosya yolunun güvenli olduğunu kontrol et
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
    throw new Error('Geçersiz dosya yolu');
  }

  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    console.error('Dosya silinirken hata:', error);
    throw error;
  }
}; 