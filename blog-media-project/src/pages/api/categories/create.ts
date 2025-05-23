import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // Adjust the import based on your prisma setup

export default async function createCategory(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
            },
        });
        return res.status(201).json(newCategory);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating category', error });
    }
}