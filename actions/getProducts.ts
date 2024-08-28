import prisma from "@/libs/prismadb";

export interface IProductParams {
    category?: string | null;
    searchTerm?: string | null;
}

// Fetch products based on optional category and search term filters
export default async function getProducts(params: IProductParams) {
    try {
        const { category, searchTerm } = params;
        console.log('Search Term:', searchTerm);  // Add this line to debug
        let searchString = searchTerm || '';  // Default to empty string if no search term provided

        let query: any = {};

        if (category) {
            query.category = category;  // Filter by category if provided
        }

        const products = await prisma.product.findMany({
            where: {
                ...query,
                OR: [
                    {
                        name: {
                            contains: searchString,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: searchString,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            include: {
                reviews: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        createdDate: 'desc'
                    }
                }
            }
        });
        console.log(products)
        return products;  // Return the fetched products
    } catch (error: any) {
        throw new Error(error);  // Throw error if something goes wrong
    }
}
