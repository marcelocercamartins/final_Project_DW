import { PrismaClient } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handle(req: NextApiRequest, res:NextApiResponse) 
{

    const prisma = new PrismaClient();
    const response = await prisma.events.findMany();

    return res.json(response);
}