"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteCategory } from '../../_actions/categories';
import { DeleteTransaction } from '../_actions/deleteTransaction';


interface Props {
    open: boolean;
    setOpen:(open:boolean) => void;
    transactionId: string;
    from: Date;
    to: Date;
}

function DeleteTransactionDialog({open,setOpen,transactionId,from,to}:Props) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["transaction", "history", from, to] });
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
    <AlertDialog open={open} onOpenChange={setOpen}>
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