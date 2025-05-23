import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import slugify from 'slugify';
import prisma from '../lib/prisma';

const router = Router();

// Get all blog posts
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        published: true,
      },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all blog posts (admin)
router.get('/admin', authenticateToken, isAdmin, async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get a single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
    });

    if (!post || (!post.published && !req.headers['x-admin-token'])) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create a blog post (protected)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, tags, coverImage, published } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    // Slug'ın benzersiz olduğundan emin ol
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return res.status(400).json({ message: 'Bu başlık zaten kullanılmış' });
    }

    // Okuma süresini hesapla (ortalama 200 kelime/dakika)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        tags: tags ? JSON.stringify(tags) : undefined,
        coverImage,
        published: published || false,
        readTime,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update a blog post (protected)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, tags, coverImage, published } = req.body;

    let slug;
    if (title) {
      slug = slugify(title, { lower: true, strict: true });

      // Eğer başlık değiştiyse, yeni slug'ın benzersiz olduğundan emin ol
      const existingPost = await prisma.blogPost.findFirst({
        where: {
          slug,
          id: { not: req.params.id },
        },
      });

      if (existingPost) {
        return res.status(400).json({ message: 'Bu başlık zaten kullanılmış' });
      }
    }

    // Okuma süresini güncelle
    let readTime;
    if (content) {
      const wordCount = content.trim().split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        excerpt,
        slug,
        tags: tags ? JSON.stringify(tags) : undefined,
        coverImage,
        published,
        readTime,
      },
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete a blog post (protected)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 