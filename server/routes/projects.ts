import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Get all projects
router.get('/', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create a project (protected)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, image, link, tags, featured, githubLink, demoLink, technologies } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image,
        link,
        tags: JSON.stringify(tags),
        featured,
        githubLink,
        demoLink,
        technologies: JSON.stringify(technologies),
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update a project (protected)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, image, link, tags, featured, githubLink, demoLink, technologies } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        image,
        link,
        tags: tags ? JSON.stringify(tags) : undefined,
        featured,
        githubLink,
        demoLink,
        technologies: technologies ? JSON.stringify(technologies) : undefined,
      },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete a project (protected)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 