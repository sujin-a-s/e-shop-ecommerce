import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextRequest, NextResponse } from "next/server";



export  async function DELETE(request : NextRequest, {params}: {params: {id : string}}){
    const currentUser = await getCurrentUser()

    if(!currentUser) return NextResponse.error()

    if(currentUser.role !== "ADMIN"){
        return NextResponse.error()
    }

    console.log("reached the deteelr oute")

    const product = await prisma.product.delete({
        where : {
            id : params.id
        }
    })

    return NextResponse.json(product)
}