import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextRequest, NextResponse } from "next/server";

// Main POST request handler
export async function POST(request: NextRequest) {
  try {
    // 1. Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No user, no service" }, { status: 401 });
    }

    // 2. Extract data from the request
    const { comment, rating, product, userId } = await request.json();

    // // 3. Fetch the product from the database
    const reviewProduct = await getProductFromDB(product.id);
    if (!reviewProduct) {
      return NextResponse.json({ error: "Product doesn't exist, homie" }, { status: 404 });
    }

    // 4. Check if the user already reviewed this product
    const hasReviewed = await userAlreadyReviewed(user.id, product.id);
    if (hasReviewed) {
      return NextResponse.json({ error: "You already talked about this product, cuz" }, { status: 400 });
    }

    // 5. Check if the user bought and received the product
    const hasBoughtAndReceived = await userBoughtAndGotProduct(user.id, product.id);
    if (!hasBoughtAndReceived) {
      return NextResponse.json({ error: "You gotta buy and receive it before you talk shit" }, { status: 400 });
    }

    // 6. Create a new review in the database
    const review = await prisma.review.create({
      data: {
        userId,
        productId : product?.id,
        comment,
        rating
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Function to get product from the database
async function getProductFromDB(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Can't find that product, homie");
  }
}

// Function to check if the user already reviewed the product
async function userAlreadyReviewed(userId: string, productId: string) {
  try {
    const review = await prisma.review.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });
    return !!review; // true if review exists, false otherwise
  } catch (error) {
    console.error("Error checking existing reviews:", error);
    throw new Error("Error checking existing reviews");
  }
}

// Function to check if the user bought and received the product
async function userBoughtAndGotProduct(userId: string, productId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        userId: userId,
        products: {
          some: {
            id: productId
          }
        },
        deliveryStatus: 'delivered'
      }
    });
    return !!order; // true if order exists, false otherwise
  } catch (error) {
    console.error("Error checking order status:", error);
    throw new Error("Error checking order status");
  }
}
