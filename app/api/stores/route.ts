import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { name } = body;

        if (!userId) {
            return NextResponse.json({message: "Unauthorized"}, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({message: "Name is required"}, { status: 400 });
        }

        const store = await prismadb.store.create({
            data: {
                name,
                userId,
            },
        });
        
        return NextResponse.json(store);
    } catch (error) {
        console.log("[STORES_POST] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}