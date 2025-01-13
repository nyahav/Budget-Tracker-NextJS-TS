"use client";


import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CreateLocationSchema, CreateLocationSchemaType } from "@/schema/locations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusSquareIcon } from "lucide-react";
import React, { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateLocation } from "../_actions/locations";
import { Locations } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
interface Props {
    successCallBack: (location: Locations) => void;
    trigger?: ReactNode;
}



const propertyTypeOptions = [
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "land", label: "Land" },
    { value: "commercial", label: "Commercial" }
] as const;

const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" }
] as const;

export type CreateLocationFn = (form: CreateLocationSchemaType) => Promise<Locations>;

function CreateLocationDialog({ successCallBack, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm<CreateLocationSchemaType>({
        resolver: zodResolver(CreateLocationSchema),
    });

    const queryClient = useQueryClient();
    const theme = useTheme();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateLocation as CreateLocationFn,
        onSuccess: async (data: Locations) => {
            form.reset();
            toast.success(`Location ${data.address} created successfully 🎉`, {
                id: 'location',
            });
            successCallBack(data);
            await queryClient.invalidateQueries({
                queryKey: ['locations'],
            });
            setOpen(false);
        },
        onError: () => {
            toast.error('Something went wrong', {
                id: 'location',
            });
        },
    });

    const onSubmit = useCallback(
        (values: CreateLocationSchemaType) => {
            toast.loading('Creating location...', {
                id: 'location',
            });
            mutate(values);
        },
        [mutate]
    );
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-3 text-muted-foreground border-separate rounded-none border-b">
                        <PlusSquareIcon className="mr-2 h-4 w-4" />
                        Create new location
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Location</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Core Location Details - Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="New York" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input placeholder="NY" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10001" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Physical Characteristics - Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="squareFeet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Square Feet</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="2000" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bedrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bedrooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="3" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearBuilt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Built</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="1980" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="propertyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {propertyTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Financial Details - Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="purchasePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="500000" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="600000" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="monthlyRent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Rent</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="2000" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status - Row 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                form.reset();
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Button type="submit" disabled={isPending}>
                            {!isPending && "Create"}
                            {isPending && <Loader2 className="animate-spin" />}
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateLocationDialog;