"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteCategory } from '../../_actions/categories';
import { DeleteLocation } from '../_actions/deleteLocation';

interface Props {
    open: boolean;
    setOpen:(open:boolean) => void;
    locationId: string;
}

function DeleteLocationDialog({open,setOpen,locationId}:Props) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteLocation,
        onSuccess: async () => {
            toast.success("Location deleted successfully", {
                id: locationId,
            });
            await queryClient.invalidateQueries({
                queryKey: ["locations"],
            });
        },
        onError: () => {
            toast.error("An error occurred while deleting the location.", {
                id: locationId,
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
                    toast.loading("Deleting locations...",{
                        id:locationId
                    })
                    deleteMutation.mutate(locationId)
                }}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteLocationDialog