"use client";

import * as z from "zod";
import { useState } from "react";
import { Color } from "@prisma/client";
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
    value: z.string().min(4).regex(/^#([0-9a-f]{3}){1,2}$/i, {
        message: "String must be a valid hex color code.",
    }),
});

type ColorFormValues = z.infer<typeof formSchema>;


interface ColorFormProps {
    initialData: Color | null;
}


const ColorForm: React.FC<ColorFormProps> = ({initialData}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const title = initialData ? "Edit color" : "Create color";
    const description = initialData ? "Edit your color" : "Create a new color";
    const toastMessage = initialData ? "Color updated." : "Color created.";
    const action = initialData ? "Save Changes" : "Create";

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        }
    });

    const SubmitHandler = async (values: ColorFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/colors`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/colors`);
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
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
            router.refresh();
            router.push(`/${params.storeId}/colors`);
            toast.success("Color deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this color first.");
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
                                        <Input disabled={isLoading} placeholder="Color name" {...field}/>
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
                                        <div className="flex items-center gap-x-4">
                                            <Input disabled={isLoading} placeholder="Color value" {...field}/>
                                            <div className="border p-4 rounded-full" style={{backgroundColor: field.value}}></div>
                                        </div>
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

export default ColorForm;