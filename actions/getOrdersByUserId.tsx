import prisma from "@/libs/prismadb"



export default async function getOrdersByUserId(userId : string){

    try{
        const ordersOfaUser = await prisma.order.findMany({
            include : {
                user : true
            },
            orderBy : {
                createDate : 'desc'
            },
            where :{
                userId : userId
            }
        })


        return ordersOfaUser
    }catch(error:any){
        throw new Error(error)
    }
}