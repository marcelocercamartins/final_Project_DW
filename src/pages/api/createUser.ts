import { PrismaClient } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handle(req: NextApiRequest, res:NextApiResponse) 
{
    const {name} = req.body;
    console.log(req.body.name);
    const prisma = new PrismaClient();
    const response = await prisma.user.create({
        data:{name:name}
    });

    return res.json(response);
}