"use client";

import * as z from "zod";
import { useState } from "react";
import { Billboard } from "@prisma/client";
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
import ImageUpload from "@/components/ui/image-upload";



const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().nonempty(),
});

type BillboardFormValues = z.infer<typeof formSchema>;


interface BillboardFormProps {
    initialData: Billboard | null;
}


const BillboardForm: React.FC<BillboardFormProps> = ({initialData}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const title = initialData ? "Edit billboard" : "Create billboard";
    const description = initialData ? "Edit your billboard" : "Create a new billboard";
    const toastMessage = initialData ? "Billboard updated." : "Billboard created.";
    const action = initialData ? "Save Changes" : "Create";

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: "",
        }
    });

    const SubmitHandler = async (values: BillboardFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/billboards`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
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
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            toast.success("Billboard deleted.");
        } catch (error) {
            toast.error("Make sure you removed all categories using this billboard first.");
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
                    <FormField 
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="label">Background Image</FormLabel>
                                <FormControl>
                                    <ImageUpload 
                                        value={field.value ? [field.value] : []}
                                        disabled={isLoading}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="label">Label</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Billboard label" {...field}/>
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

export default BillboardForm;