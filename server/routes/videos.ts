import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';





const router = Router();


// Get all videos
router.get('/', async (_req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        published: true,
      },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all videos (admin)
router.get('/admin', authenticateToken, isAdmin, async (_req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get a single video
router.get('/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!video || (!video.published && !req.headers['x-admin-token'])) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create a video (protected)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, embedUrl, description, thumbnail, duration, category, tags, published } = req.body;

    const video = await prisma.video.create({
      data: {
        title,
        embedUrl,
        description,
        thumbnail,
        duration,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        published: published || false,
      },
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update a video (protected)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, embedUrl, description, thumbnail, duration, category, tags, published } = req.body;

    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        title,
        embedUrl,
        description,
        thumbnail,
        duration,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        published,
      },
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete a video (protected)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.video.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update video stats
router.post('/:id/stats', async (req, res) => {
  try {
    const { views, likes } = req.body;

    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        views: views !== undefined ? { increment: 1 } : undefined,
        likes: likes !== undefined ? { increment: 1 } : undefined,
      },
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 