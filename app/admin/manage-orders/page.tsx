import { getCurrentUser } from "@/actions/getCurrentUser";
import Container from "@/app/components/Container";
import NullData from "@/app/components/NullData";
import ManageOrdersClient from "./ManageOrdersClient";
import getOrders from "@/actions/getOrders";

const ManageOrders = async () => {

    const orders = await getOrders();  // Fetch products without filtering by category
    const currentUser = await getCurrentUser();  // Get the current user

    if (!currentUser || currentUser.role != "ADMIN") {
        return <NullData title="Oops! Access denied" />  // Show error if the user is not an admin
    }

    // Render the ManageOrdersClient component with fetched products
    return (
        <div className="pt-8">
            <Container>
                <ManageOrdersClient orders={orders} />
            </Container>
        </div>
    );
}

export default ManageOrders;
