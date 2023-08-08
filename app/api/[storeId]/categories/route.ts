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
        const { name, billboardId } = body;

        if (!userId) {
            return NextResponse.json({message: "Unauthenticated"}, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({message: "Name is required"}, { status: 400 });
        }

        if (!billboardId) {
            return NextResponse.json({message: "Billboard Id is required"}, { status: 400 });
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
        
        const category = await prismadb.category.create({
            data: {
                name,
                billboardId,
                storeId: params.storeId,
            },
        });
        
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.log("[CATEGORIES_POST] Error: ", error);
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
        
        const categories = await prismadb.category.findMany({
            where: {
                storeId: params.storeId,
            }
        });
        
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.log("[CATEGORIES_GET] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}