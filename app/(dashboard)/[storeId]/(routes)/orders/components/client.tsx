"use client";

import { useParams, useRouter } from "next/navigation";


import Heading from "@/components/ui/Heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { OrderColumn, columns } from "./columns";

interface OrderClientProps {
    data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
    const params = useParams();
    const router = useRouter();

    return (
        <>
            <Heading 
                title={`Orders (${data.length})`}
                description="Check orders for your store" 
            />
            <Separator />
            <DataTable columns={columns} data={data} searchKey="products" />
        </>
    )
}