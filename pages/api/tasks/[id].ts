import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const taskId = req.query.id as string;
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { createdById: session.user.id },
        { assignedTo: { some: { id: session.user.id } } }
      ]
    }
  });
  if (!task) {
    return res.status(404).json({ error: 'Task not found or permission denied' });
  }
  if (req.method === 'PATCH') {
    const { completed } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    });
    return res.status(200).json(updatedTask);
  }
  if (req.method === 'DELETE') {
    await prisma.task.delete({ where: { id: taskId } });
    return res.status(204).end();
  }
  res.setHeader('Allow', ['PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}