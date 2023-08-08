"use client";

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation'
import React from 'react';

import { cn } from '@/lib/utils';

export function MainNav({
    className,
    ...props
} : React.HTMLAttributes<HTMLElement>) {
    const pathName = usePathname();
    const params = useParams();

    const { storeId } = params;

    const routes = [
        {
            href: `/${storeId}`,
            label: "Dashboard",
            isAcitve: pathName === `/${storeId}`
        },
        {
            href: `/${storeId}/billboards`,
            label: "Billboards",
            isAcitve: pathName === `/${storeId}/billboards`
        },
        {
            href: `/${storeId}/categories`,
            label: "Categories",
            isAcitve: pathName === `/${storeId}/categories`
        },
        {
            href: `/${storeId}/sizes`,
            label: "Sizes",
            isAcitve: pathName === `/${storeId}/sizes`
        },
        {
            href: `/${storeId}/colors`,
            label: "Colors",
            isAcitve: pathName === `/${storeId}/colors`
        },
        {
            href: `/${storeId}/products`,
            label: "Products",
            isAcitve: pathName === `/${storeId}/products`
        },
        {
            href: `/${storeId}/settings`,
            label: "Settings",
            isAcitve: pathName === `/${storeId}/settings`
        },
    ]
    
    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        >
            <div className={`flex items-center justify-center ${className}`}>
                {routes.map(({ href, label, isAcitve }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn( "text-sm font-medium transition-colors hover:text-primary mx-3", isAcitve ? "text-black dark:text-white" : "text-muted-foreground dark:text-muted-background")}
                    >
                        {label}                   
                    </Link>
                ))}
            </div>
        </nav>
    )
}
