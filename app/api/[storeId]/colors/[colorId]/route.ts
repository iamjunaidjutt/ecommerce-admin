import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";


export async function GET(
    req: Request,
    { params }: { params: { colorId: string } }
) {
    try {
        if (!params.colorId) {
            return new NextResponse("Missing colorId", { status: 400 });
        }

        const color = await prismadb.color.findUnique({
            where: {
                id: params.colorId,
            }
        });

        return NextResponse.json(color);
    } catch (error) {
        console.log("[COLOR_GET] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, colorId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return NextResponse.json({message: "Name is required"}, { status: 400 });
        }

        if (!value) {
            return NextResponse.json({message: "Value is required"}, { status: 400 });
        }

        if (!params.storeId) {
            return NextResponse.json({message: "Store ID is required"}, { status: 400 });
        }

        if (!params.colorId) {
            return new NextResponse("Color ID is required", { status: 400 });
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

        const color = await prismadb.color.updateMany({
            where: {
                id: params.colorId,
                storeId: params.storeId,
            },
            data: {
                name,
                value,
            },
        });

        return NextResponse.json(color, { status: 201});
    } catch (error) {
        console.log("[COLOR_PATCH] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, colorId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Missing storeId", { status: 400 });
        }

        if (!params.colorId) {
            return new NextResponse("Missing colorId", { status: 400 });
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

        const color = await prismadb.color.deleteMany({
            where: {
                id: params.colorId,
            }
        });

        return NextResponse.json(color);
    } catch (error) {
        console.log("[COLOR_DELETE] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}