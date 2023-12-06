import { PrismaClient } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handle(req: NextApiRequest, res:NextApiResponse) 
{
    const event = req.body
    console.log(req.body.eventName);
    const prisma = new PrismaClient();
    const response = await prisma.events.create(event);
}   