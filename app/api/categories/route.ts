import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve user categories
 *     description: Get all categories for the authenticated user, optionally filtered by type
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [expense, income]
 *         description: Filter categories by type
 *         required: false
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Category unique identifier
 *                   name:
 *                     type: string
 *                     description: Category name
 *                   type:
 *                     type: string
 *                     enum: [expense, income]
 *                     description: Category type
 *                   userId:
 *                     type: string
 *                     description: Owner's user ID
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */



export async function GET(request : Request){
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }

    const{searchParams} = new URL(request.url);
    const paramType = searchParams.get("type");

    const validator = z.enum(["expense","income"]).nullable();
    const queryParams = validator.safeParse(paramType);

    if(!queryParams.success){
        return Response.json(queryParams.error,{
            status:400,
        });
    }

    const type = queryParams.data;
    const categories = await prisma.category.findMany({
        where: {
            userId: user.id,
            ...(type && {type}),//include type in the filters if it's defined
        },
        orderBy:{
            name:"asc",
        }
    })
    return Response.json(categories);
}