// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient();
/*
  const response = await prisma.user.findMany({
    where :{
      name: {
      }
    }
  });
*/
  res.status(200).json({ name: 'John Doe' })
}
