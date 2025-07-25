import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ createdById: userId }, { assignedTo: { some: { id: userId } } }],
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    const { title, description, assignedToUserIds, deadline } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        createdById: userId,
        assignedTo: {
          connect: assignedToUserIds ? assignedToUserIds.map((id: string) => ({ id })) : [{ id: userId }],
        },
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return res.status(201).json(task);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}