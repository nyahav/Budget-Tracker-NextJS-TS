"use server"

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"
import { error } from "console";
import { redirect } from "next/navigation";

export async function DeleteLocation(id:string){
    const user = await currentUser();
    if(!user)
    {
        redirect("/sign-in")
    }

    const location = await prisma.locations.findUnique({
        where:{
            userId:user.id,
            id
        }
    })
    if(!location){
        throw new Error("bad reqest")
    }

        
    await prisma.locations.delete({
        where: {
                id,
                userId: user.id
            }
    });
    
}