// pages/api/projects/[id].ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  if (req.method === "PUT") {
    const { name, description, status } = req.body;
    const project = await prisma.project.update({
      where: { id: id as string },
      data: { name, description, status },
    });
    return res.status(200).json(project);
  }

  if (req.method === "DELETE") {
    await prisma.project.delete({ where: { id: id as string } });
    return res.status(204).end();
  }

  return res.status(405).json({ message: "Method not allowed" });
}
