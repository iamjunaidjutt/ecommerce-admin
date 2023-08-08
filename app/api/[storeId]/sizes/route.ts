import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: { params: {storeId: string} }
    ) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { name, value } = body;

        if (!userId) {
            return NextResponse.json({message: "Unauthenticated"}, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({message: "Label is required"}, { status: 400 });
        }

        if (!value) {
            return NextResponse.json({message: "Image URL is required"}, { status: 400 });
        }

        if (!params.storeId) {
            return NextResponse.json({message: "Store ID is required"}, { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            return NextResponse.json({message: "Unauthorized"}, { status: 403 });
        }
        
        const size = await prismadb.size.create({
            data: {
                name,
                value,
                storeId: params.storeId,
            },
        });
        
        return NextResponse.json(size, { status: 201 });
    } catch (error) {
        console.log("[SIZES_POST] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: {storeId: string} }
    ) {
    try {

        if (!params.storeId) {
            return NextResponse.json({message: "Store ID is required"}, { status: 400 });
        }
        
        const sizes = await prismadb.size.findMany({
            where: {
                storeId: params.storeId,
            }
        });
        
        return NextResponse.json(sizes, { status: 200 });
    } catch (error) {
        console.log("[SIZES_GET] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}