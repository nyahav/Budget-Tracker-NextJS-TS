"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteCategory } from '../../_actions/categories';

interface Props {
    open: boolean;
    setOpen:(open:boolean) => void;
    transactionId: string;
}

function DeleteTransactionDialog({open,setOpen,transactionId}:Props) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success("Transaction deleted successfully", {
                id: transactionId,
            });
            await queryClient.invalidateQueries({
                queryKey: ["transactions"],
            });
        },
        onError: () => {
            toast.error("An error occurred while deleting the transaction.", {
                id: transactionId,
            });
        },
    });
  return (
    <AlertDialog>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action is can't be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={()=>{
                    toast.loading("Deleting transaction...",{
                        id:transactionId
                    })
                    deleteMutation.mutate(transactionId)
                }}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteTransactionDialog