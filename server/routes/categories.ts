import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import slugify from 'slugify';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// Tüm kategorileri getir
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            blogPosts: true,
            videos: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(categories);
  } catch (error) {
    console.error('Kategori listesi alınırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kategori detayını getir
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        blogPosts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            coverImage: true,
            createdAt: true,
          },
        },
        videos: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            duration: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            blogPosts: true,
            videos: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    res.json(category);
  } catch (error) {
    console.error('Kategori detayı alınırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni kategori oluştur (korumalı)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Kategori adı gereklidir' });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Slug'ın benzersiz olduğundan emin ol
    const existingCategory = await prisma.category.findFirst({
      where: { 
        OR: [
          { slug },
          { name }
        ]
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Bu isimde bir kategori zaten mevcut' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        _count: {
          select: {
            blogPosts: true,
            videos: true,
          },
        },
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Kategori oluşturulurken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kategori güncelle (korumalı)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const updateData: Prisma.CategoryUpdateInput = {};

    if (name) {
      const slug = slugify(name, { lower: true, strict: true });

      // Eğer isim değiştiyse, yeni slug'ın benzersiz olduğundan emin ol
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug },
            { name }
          ],
          NOT: { id: req.params.id },
        },
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Bu isimde bir kategori zaten mevcut' });
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            blogPosts: true,
            videos: true,
          },
        },
      },
    });

    res.json(category);
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kategori sil (korumalı)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Önce kategorinin var olduğunu kontrol et
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            blogPosts: true,
            videos: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    // İlişkili blog yazıları ve videoların kategorisini null yap
    await prisma.$transaction([
      prisma.blogPost.updateMany({
        where: { categoryId: req.params.id },
        data: { categoryId: null },
      }),
      prisma.video.updateMany({
        where: { categoryId: req.params.id },
        data: { categoryId: null },
      }),
      prisma.category.delete({
        where: { id: req.params.id },
      }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Kategori silinirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 