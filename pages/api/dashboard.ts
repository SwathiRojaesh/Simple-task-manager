// pages/api/dashboard.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const [projectCount, taskCount, pendingCount, completedCount] = await Promise.all([
    prisma.project.count({ where: { createdBy: user.id } }),
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, status: "pending" } }),
    prisma.task.count({ where: { userId: user.id, status: "completed" } }),
  ]);

  return res.status(200).json({ projectCount, taskCount, pendingCount, completedCount });
}
