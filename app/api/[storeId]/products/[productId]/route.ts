import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        if (!params.productId) {
            return new NextResponse("Missing productId", { status: 400 });
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId,
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true,
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_GET] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
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

        if (!params.productId) {
            return new NextResponse("Product ID is required", { status: 400 });
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

        await prismadb.product.update({
            where: {
                id: params.productId,
                storeId: params.storeId,
            },
            data: {
                name,
                price,
                categoryId,
                sizeId,
                colorId,
                images: {
                    deleteMany: {},
                },
                isFeatured,
                isArchived,
            },
        });

        const product = await prismadb.product.update({
            where: {
                id: params.productId,
                storeId: params.storeId,
            },
            data: {
                images: {
                    createMany: {
                        data: [...images.map((image: { url: string }) => image)],
                    },
                },
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true,
            },
        });

        return NextResponse.json(product, { status: 201});
    } catch (error) {
        console.log("[PRODUCT_PATCH] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Missing storeId", { status: 400 });
        }

        if (!params.productId) {
            return new NextResponse("Missing productId", { status: 400 });
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

        const product = await prismadb.product.deleteMany({
            where: {
                id: params.productId,
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_DELETE] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    } 
}