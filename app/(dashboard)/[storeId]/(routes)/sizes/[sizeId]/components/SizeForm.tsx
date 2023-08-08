"use client";

import * as z from "zod";
import { useState } from "react";
import { Size } from "@prisma/client";
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


const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().nonempty(),
});

type SizeFormValues = z.infer<typeof formSchema>;


interface SizeFormProps {
    initialData: Size | null;
}


const SizeForm: React.FC<SizeFormProps> = ({initialData}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const title = initialData ? "Edit size" : "Create size";
    const description = initialData ? "Edit your size" : "Create a new size";
    const toastMessage = initialData ? "Size updated." : "Size created.";
    const action = initialData ? "Save Changes" : "Create";

    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        }
    });

    const SubmitHandler = async (values: SizeFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/sizes`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/sizes`);
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
            await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
            router.refresh();
            router.push(`/${params.storeId}/sizes`);
            toast.success("Size deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this size first.");
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
                                    <FormLabel htmlFor="name">Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Size name" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="value">Value</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Size value" {...field}/>
                                    </FormControl>
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

export default SizeForm;