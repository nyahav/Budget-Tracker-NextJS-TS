"use client"

import { Category } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { ReactNode } from 'react'
import { DeleteCategory } from '../_actions/categories';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';


interface Props{
    trigger: ReactNode;
    category: Category;
}
function DeleteCategoryDialog({ category, trigger }: Props) {
    const categoryIdentifier = `${category.name}-${category.type}`;
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success("Category deleted successfully", {
                id: categoryIdentifier,
            });
            await queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
        onError: () => {
            toast.error("An error occurred while deleting the category.", {
                id: categoryIdentifier,
            });
        },
    });
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {trigger}
        </AlertDialogTrigger> 
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action is cant be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={()=>{
                    toast.loading("Deleting category...",{
                        id:categoryIdentifier
                    })
                    deleteMutation.mutate({
                        name: category.name,
                        type: category.type as TransactionType,
                    })
                }}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategoryDialog