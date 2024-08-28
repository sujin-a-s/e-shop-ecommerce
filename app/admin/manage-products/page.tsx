import { getCurrentUser } from "@/actions/getCurrentUser";
import getProducts from "@/actions/getProducts";
import Container from "@/app/components/Container";
import NullData from "@/app/components/NullData";
import ManageProductsClient from "./ManageProducts";

const ManageProducts = async () => {
    const products = await getProducts({ category: null });  // Fetch products without filtering by category
    const currentUser = await getCurrentUser();  // Get the current user

    if (!currentUser || currentUser.role != "ADMIN") {
        return <NullData title="Oops! Access denied" />  // Show error if the user is not an admin
    }

    // Render the ManageProductsClient component with fetched products
    return (
        <div className="pt-8">
            <Container>
                <ManageProductsClient products={products} />
            </Container>
        </div>
    );
}

export default ManageProducts;
