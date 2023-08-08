"use client";

import * as z from "zod";
import { useState } from "react";
import { Store } from "@prisma/client";
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
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";



interface SettingsFormProps {
    initialData: Store;
}


const formSchema = z.object({
    name: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof formSchema>;


const SettingsForm: React.FC<SettingsFormProps> = ({initialData}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const SubmitHandler = async (values: SettingsFormValues) => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/stores/${params.storeId}`, values);
            router.refresh();
            toast.success("Settings updated.");
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setIsLoading(false);
        } 
    }

    const deleteHandler = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/stores/${params.storeId}`);
            router.refresh();
            router.push("/");
            toast.success("Store deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products and categories first.");
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
                    title="Settings"
                    description="Manage store prefrerences"
                />
                <Button
                    variant={"destructive"}
                    size={"icon"}
                    disabled={isLoading}
                    onClick={() => setOpen(true)}
                >
                    <Trash className="h-4 w-4"/>
                </Button>
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
                                        <Input disabled={isLoading} placeholder="Store name" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="ml-auto">
                        Save Changes
                    </Button>
                </form>
            </Form>
            <Separator />
            <ApiAlert 
                title="NEXT_PUBLIC_API_URL" 
                description={`${origin}/api/${params.storeId}`}
                variant={"public"}
            />
        </>
    );
}

export default SettingsForm;