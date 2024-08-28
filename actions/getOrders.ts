import prisma from "@/libs/prismadb";

// Fetch all orders, including the user who placed the order
export default async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true  // Include user information with each order
            },
            orderBy: {
                createDate: 'desc'  // Order results by creation date, descending
            }
        });

        return orders;  // Return the fetched orders
    } catch (error: any) {
        throw new Error(error);  // Throw error if something goes wrong
    }
}
