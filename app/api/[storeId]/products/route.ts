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
        const { 
            name,
            price,
            categoryId,
            sizeId,
            colorId,
            images,
            isFeatured,
            isArchived,
        } = body;

        if (!userId) {
            return NextResponse.json({message: "Unauthenticated"}, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({message: "Name is required"}, { status: 400 });
        }

        if (!price) {
            return NextResponse.json({message: "Price is required"}, { status: 400 });
        }

        if (!categoryId) {
            return NextResponse.json({message: "Category ID is required"}, { status: 400 });
        }

        if (!sizeId) {
            return NextResponse.json({message: "Size ID is required"}, { status: 400 });
        }

        if (!colorId) {
            return NextResponse.json({message: "Color ID is required"}, { status: 400 });
        }

        if (!images || !images.length) {
            return NextResponse.json({message: "Images are required"}, { status: 400 });
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
        
        const product = await prismadb.product.create({
            data: {
                name,
                price,
                categoryId,
                sizeId,
                colorId,
                images: {
                    createMany: {
                        data: images.map((image: { url: string }) => image),
                    },
                },
                isFeatured,
                isArchived,
                storeId: params.storeId,
            },
        });
        
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.log("[PRODUCTS_POST] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: {storeId: string} }
    ) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const isFeatured = searchParams.get("isFeatured");

        if (!params.storeId) {
            return NextResponse.json({message: "Store ID is required"}, { status: 400 });
        }
        
        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                sizeId,
                colorId,
                isFeatured: isFeatured === "true" ? true : undefined,
                isArchived: false,
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });
        
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.log("[PRODUCTS_GET] Error: ", error);
        return NextResponse.json({message: "Internal server error"}, { status: 500 });
    }
}