"use client";

import * as z from "zod";
import { useState } from "react";
import { Category, Billboard } from "@prisma/client";
import { Trash } from "lucide-react";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import HeadingForm from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AlertModal from "@/components/modals/AlertModal";
import { useOrigin } from "@/hooks/use-origin";
import { SelectTrigger, SelectValue, Select, SelectContent, SelectItem } from "@/components/ui/select";



const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().nonempty(),
});

type CategoryFormValues = z.infer<typeof formSchema>;


interface CategoryFormProps {
    initialData: Category | null;
    billboards: Billboard[];
}


const CategoryForm: React.FC<CategoryFormProps> = ({initialData, billboards}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const title = initialData ? "Edit category" : "Create category";
    const description = initialData ? "Edit your category" : "Create a new category";
    const toastMessage = initialData ? "Category updated." : "Category created.";
    const action = initialData ? "Save Changes" : "Create";

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            billboardId: "",
        }
    });

    const SubmitHandler = async (values: CategoryFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/categories`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/categories`);
            toast.success(toastMessage);
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setIsLoading(false);
        } 
    }

    const deleteHandler = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
            router.refresh();
            router.push(`/${params.storeId}/categories`);
            toast.success("Category deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this category first.");
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    }


    return (
        <>
            <AlertModal 
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={deleteHandler}
                isLoading={isLoading}
            />
            <div className="flex items-center justify-between">
                <HeadingForm
                    title={title}
                    description={description}
                />
                {initialData && <Button
                    variant={"destructive"}
                    size={"icon"}
                    disabled={isLoading}
                    onClick={() => setOpen(true)}
                >
                    <Trash className="h-4 w-4"/>
                </Button>}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(SubmitHandler)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="label">Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Category Name" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="billboardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="billboardId">Billboard</FormLabel>
                                    <Select 
                                        disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue 
                                                defaultValue={field.value} 
                                                placeholder="Select a Category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {billboards.map((billboard) => (
                                                <SelectItem
                                                    key={billboard.id}
                                                    value={billboard.id}
                                                >
                                                    {billboard.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="ml-auto">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
}

export default CategoryForm;