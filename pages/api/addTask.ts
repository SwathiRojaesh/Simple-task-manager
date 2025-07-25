// pages/api/addTask.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ No longer from /auth/[...nextauth]
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { title, description } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        completed: false,
        user: {
          connect: {
            email: session.user.email!,
          },
        },
      },
    });

    res.status(200).json(task);
  } catch (err) {
    console.error('🔥 Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
}
