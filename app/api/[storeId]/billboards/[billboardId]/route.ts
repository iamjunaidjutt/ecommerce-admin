import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
    req: Request,
    { params }: { params: { billboardId: string } }
) {
    try {
        if (!params.billboardId) {
            return new NextResponse("Missing billboardId", { status: 400 });
        }

        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log("[BILLBOARD_GET] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { label, imageUrl } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!label) {
            return NextResponse.json({message: "Label is required"}, { status: 400 });
        }

        if (!imageUrl) {
            return NextResponse.json({message: "Image URL is required"}, { status: 400 });
        }

        if (!params.storeId) {
            return NextResponse.json({message: "Store ID is required"}, { status: 400 });
        }

        if (!params.billboardId) {
            return new NextResponse("Billboard ID is required", { status: 400 });
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

        const billboard = await prismadb.billboard.updateMany({
            where: {
                id: params.billboardId,
                storeId: params.storeId,
            },
            data: {
                label,
                imageUrl,
            },
        });

        return NextResponse.json(billboard, { status: 201});
    } catch (error) {
        console.log("[BILLBOARD_PATCH] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Missing storeId", { status: 400 });
        }

        if (!params.billboardId) {
            return new NextResponse("Missing billboardId", { status: 400 });
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

        const billboard = await prismadb.billboard.deleteMany({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log("[BILLBOARD_DELETE] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}