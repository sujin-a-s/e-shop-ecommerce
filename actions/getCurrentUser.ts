import prisma from "@/libs/prismadb"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth"






export async function getCurrentUser(){
    try{
        const session = await getServerSession(authOptions)

        if(!session?.user?.email){
            return null
        }

        const currentUser = await prisma.user.findUnique({
            where : {
                email : session?.user?.email
            },
            include : {
                orders : true
            }
        })

        if(!currentUser){
            return null
        }

        return {
            ...currentUser,
            createdAt : currentUser.createdAt.toISOString(),
            updatedAt : currentUser.updatedAt.toISOString(),
            emailVerified : currentUser.emailVerified?.toString()  || null
        }
    }catch(error : any){
        return null
    }
}