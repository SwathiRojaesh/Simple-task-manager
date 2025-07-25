import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }
  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  res.status(201).json({ message: 'User created successfully', userId: user.id });
}