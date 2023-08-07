import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Missing name", { status: 400 });
        }

        const { storeId } = params; 

        if (!storeId) {
            return new NextResponse("Missing storeId", { status: 400 });
        }

        const store = await prismadb.store.updateMany({
            where: {
                id: storeId,
                userId
            },
            data: {
                name
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log("[Stores_StoreId_PATCH] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { storeId } = params; 

        if (!storeId) {
            return new NextResponse("Missing storeId", { status: 400 });
        }

        const store = await prismadb.store.deleteMany({
            where: {
                id: storeId,
                userId
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log("[Stores_StoreId_DELETE] Error: ", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}