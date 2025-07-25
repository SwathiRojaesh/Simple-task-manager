// pages/api/assign.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth"; // ✅ FIXED: Correct import
import { authOptions } from "./auth/[...nextauth]"; // ✅ FIXED: Relative path
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, description, assignedTo, deadline, projectId } = req.body;

    if (!title || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assigner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!assigner) return res.status(404).json({ error: "Assigning user not found" });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        assignedById: assigner.id,
        assignedTo: {
          connect: assignedTo.map((userId: string) => ({ id: userId })),
        },
        // ✅ FIXED: Only add deadline if it's valid
        ...(deadline && { deadline: new Date(deadline) }),
        ...(projectId && {
          project: { connect: { id: projectId } },
        }),
      },
      include: {
        assignedTo: true,
        assignedBy: true,
      },
    });

    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("🔥 Assignment failed:", error);
    return res.status(500).json({ error: "Assignment failed" });
  }
}
