import { PrismaClient } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handle(req: NextApiRequest, res:NextApiResponse) 
{
    const {id} = req.body;
    const prisma = new PrismaClient();
    const response = await prisma.user.delete({      
        where:{userID:id}
    });

    return res.json(response);
}