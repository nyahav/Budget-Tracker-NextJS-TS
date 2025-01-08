"use server"
import { prisma } from "@/lib/prisma";
import { CreateCategorySchema, CreateCategorySchemaType, DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Inside _actions/categories.ts
export async function CreateCategory(form: CreateCategorySchemaType) {
    const parseBody = CreateCategorySchema.safeParse(form);
    if (!parseBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
        return;
    }

    const { name, icon, type } = parseBody.data;

    try {
        
        const category = await prisma.category.create({
            data: {
                userId: user.id,
                name,
                icon,
                type,
            },
        });

        
        if (!category) {
            throw new Error("Category creation failed");
        }

        return category; 
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create category");
    }
}


export async function DeleteCategory(form: DeleteCategorySchemaType){
    const parseBody = DeleteCategorySchema.safeParse(form);
    if (!parseBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
        return;
    }
    return await prisma.category.delete({
        where:{
            name_userId_type:{
                userId:user.id,
                name:parseBody.data.name,
                type:parseBody.data.type,
            }
        }
    })
}