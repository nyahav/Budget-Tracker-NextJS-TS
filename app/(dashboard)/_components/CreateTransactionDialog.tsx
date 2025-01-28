"use client"

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { Transaction } from "@prisma/client";
import { ReactNode, useCallback, useState } from "react"
import React from 'react'
import {  useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {CategoryPicker} from "./CategoryPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {  Calendar1Icon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transaction";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { LocationPicker } from "./LocationPicker";

interface Props{
    trigger : ReactNode;
    type: TransactionType ;
}

function CreateTransactionDialog({trigger,type}:Props) {
    const form = useForm<CreateTransactionSchemaType>({
        resolver:zodResolver(CreateTransactionSchema),
        defaultValues:{
            type:type,
            date: new Date()
        }
    })
    const [open,setOpen] = useState(false);
    const handleCategoryChange =useCallback((value: string) =>{
        console.log('Selected category:', value);
        form.setValue("category",value);
    },[form])

    const handleLocationChange =useCallback((value: string) =>{
        console.log('Selected location:', value);
        form.setValue("locationId",value);
    },[form])
    const queryClient = useQueryClient();

    const {mutate,isPending} = useMutation({
        mutationFn: CreateTransaction,
        onSuccess:() =>{
            toast.dismiss("creating-transaction");
            toast.success("Transaction created successfully 🎉",{
                id:"create-transaction",
                duration: 5000,
            })
            form.reset({
                type,
                description : "",
                amount: 0,
                date: new Date(),
                category: undefined,
            })
            //after creating a transaction,we invalidate the overview query
            //  which will refetch data in the homepage
            queryClient.invalidateQueries({
                queryKey: ["overview", "history"]
            });
            queryClient.invalidateQueries({
                queryKey: ["transaction", "history"]
            });
            queryClient.invalidateQueries({
                queryKey: ["overview", "stats"]
            })

            setOpen((prev) => !prev)
           
        }
    })

    const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading("Creating transaction...", {
            id: "creating-transaction",
            duration: 3000,
        });
        setTimeout(() => {
            toast.dismiss("creating-transaction");
        }, 5000);

        mutate ( {
            ...values,
            date: DateToUTCDate(values.date),
        });
    
    }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen} >
        <DialogTrigger asChild>
            {trigger}
        </DialogTrigger>
        <DialogContent className="w-full max-w-3xl">
            <DialogHeader>
                <DialogTitle>Create a new{" "} 
                    <span className={cn(
                        "m-1",
                        type === "income"? "text-emerald-500":
                        "text-red-500"
                    )}
                    >{type}
                    </span>
                    transaction
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input  {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Transaction description (optional)
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input  type="number" {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Transaction amount (required)
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    
                    {/* Transaction : {form.watch("category")} */}
                    <div className="flex items-center justify-center gap-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({field}) =>(
                            <FormItem className="flex flex-col">
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <CategoryPicker type={type} onChange={handleCategoryChange}/>
                                </FormControl>
                                <FormDescription>
                                    Select a category for this transaction
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="locationId"
                        render={({field}) =>(
                            <FormItem className="flex flex-col">
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <LocationPicker onChange={handleLocationChange}/>
                                </FormControl>
                                <FormDescription>
                                    Select a Location for this transaction
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({field}) =>(
                            <FormItem className="flex flex-col">
                            <FormLabel>Transaction date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-[200px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    type="button"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                   <Calendar1Icon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 1000 }}>
                              <div className="relative">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(value) =>{
                                    if(!value) return;
                                    const formattedDate = new Date(value);
                                    console.log("@@CALENDAR", formattedDate);
                                    field.onChange(formattedDate);
                                  }}
                                  initialFocus
                                  disabled={false}
                                  ISOWeek={true}
                                />
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Select a date for this transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                    </div>
                </form>
            </Form>
            <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant={"secondary"} onClick={()=>{
                    form.reset();
                }}
                >
                    Cancel
                </Button>
            </DialogClose>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <Button  type="submit" disabled={isPending}>
                {!isPending && "Create"}
                {isPending && <Loader2 className='animate-span'/>}
            </Button>
            </form>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog