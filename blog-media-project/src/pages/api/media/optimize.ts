import type { NextApiRequest, NextApiResponse } from 'next';
import { optimizeImage } from '../../../lib/imageProcessing/optimize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { image } = req.body;

            if (!image) {
                return res.status(400).json({ message: 'No image provided' });
            }

            const optimizedImage = await optimizeImage(image);

            return res.status(200).json({ optimizedImage });
        } catch (error) {
            return res.status(500).json({ message: 'Error optimizing image', error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}