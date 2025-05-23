import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { upload, optimizeImage, deleteImage } from '../lib/imageUploader';
import path from 'path';
import fs from 'fs';

const router = Router();

// Resim yükle (korumalı)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resim dosyası bulunamadı' });
    }

    // Resim boyutlarını kontrol et
    const fileSize = req.file.size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      fs.unlinkSync(req.file.path); // Geçici dosyayı sil
      return res.status(400).json({ message: 'Resim boyutu 5MB\'dan büyük olamaz' });
    }

    // Resim tipini kontrol et
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path); // Geçici dosyayı sil
      return res.status(400).json({ message: 'Sadece JPEG, PNG ve WebP formatları desteklenir' });
    }

    try {
      const optimizedImagePath = await optimizeImage(req.file, {
        width: 1200,
        height: 800,
        quality: 80
      });

      // Orijinal dosya adını al (uzantısız)
      const originalName = path.parse(req.file.originalname).name;
      
      // Optimize edilmiş dosyanın tam yolunu al
      const optimizedFileName = path.basename(optimizedImagePath);

      res.json({
        url: optimizedImagePath,
        filename: optimizedFileName,
        originalName,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error('Resim optimize edilirken hata:', error);
      // Hata durumunda geçici dosyayı temizle
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      throw new Error('Resim optimize edilirken bir hata oluştu');
    }
  } catch (error: unknown) {
    console.error('Resim yüklenirken hata:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: (error as any).message || 'Resim yüklenirken bir hata oluştu' });
    } else {
      res.status(500).json({ message: 'Resim yüklenirken bilinmeyen bir hata oluştu' });
    }
  }
});

// Resim sil (korumalı)
router.delete('/:filename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Dosya yolunu doğrula
    if (!filename || filename.includes('..')) {
      return res.status(400).json({ message: 'Geçersiz dosya adı' });
    }

    const filePath = `/uploads/optimized/${filename}`;
    
    try {
      await deleteImage(filePath);
      res.status(204).send();
    } catch (error: unknown) {
      console.error('Resim silinirken hata:', error);
      // Dosya bulunamadıysa 404 dön
      if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
        return res.status(404).json({ message: 'Resim bulunamadı' });
      }
      // Diğer hatalar için genel bir hata mesajı döndür
      if (error instanceof Error) {
        res.status(500).json({ message: error.message || 'Resim silinirken bir hata oluştu' });
      } else {
        res.status(500).json({ message: 'Resim silinirken bilinmeyen bir hata oluştu' });
      }
    }
  } catch (error: unknown) {
    console.error('Resim silinirken hata:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Resim silinirken bilinmeyen bir hata oluştu' });
    }
  }
});

export default router; 