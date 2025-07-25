import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Authenticate the user. Only logged-in users can see other users.
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    // If not logged in, send a 401 Unauthorized error.
    return res.status(401).json({ error: 'You must be logged in to view users.' });
  }

  // 2. This endpoint only supports the GET method.
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 3. Use a try...catch block to handle any potential database errors.
  try {
    // 4. Fetch all users from the database.
    const users = await prisma.user.findMany({
      where: {
        // IMPORTANT: Exclude the currently logged-in user from the list.
        // You can't assign a task to yourself on this page.
        id: { not: session.user.id } 
      },
      select: {
        // Only select the data we need for the frontend.
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        // Sort the users alphabetically by name.
        name: 'asc',
      }
    });

    // 5. Send the list of users back to the frontend with a 200 OK status.
    // If no other users are found, this will correctly send an empty array [].
    return res.status(200).json(users);

  } catch (error) {
    // If there's an error connecting to or querying the database, log it and send a 500 error.
    console.error("DATABASE ERROR - FAILED TO FETCH USERS:", error);
    return res.status(500).json({ error: "An error occurred while fetching users from the database." });
  }
}