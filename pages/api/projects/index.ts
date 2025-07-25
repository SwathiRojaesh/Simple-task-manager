import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.method === "GET") {
    const projects = await prisma.project.findMany({
      where: { createdBy: user.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(projects);
  }

  if (req.method === "POST") {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdBy: user.id,
      },
    });

    return res.status(201).json(project);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
