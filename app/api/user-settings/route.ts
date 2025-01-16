import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


//swagger
/**
 * @swagger
 * /api/user-settings:
 *   get:
 *     summary: Get user settings
 *     description: Retrieve or create user settings for the authenticated user
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 currency:
 *                   type: string
 *                   default: USD
 *               example:
 *                 id: "123"
 *                 userId: "user_123"
 *                 currency: "USD"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update user settings
 *     description: Update settings for the authenticated user
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *             required:
 *               - currency
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


export async function GET(request:Request) {
    const user = await currentUser();

    if(!user){
        redirect("/sign-in")
    }

    let userSettings =await prisma.userSetting.findUnique({
        where: {
            userId: user.id,
        }
    })

    if(!userSettings){
        userSettings = await prisma.userSetting.create({
            data:{
                userId:user.id,
                currency:"USD",
            },
        });
    }
    //Revalidate the home page that uses the user currency
    revalidatePath("/")
    return Response.json(userSettings);
}