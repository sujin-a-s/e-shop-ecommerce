import { getCurrentUser } from "@/actions/getCurrentUser";
import Container from "@/app/components/Container";
import NullData from "@/app/components/NullData";
import getOrdersByUserId from "@/actions/getOrdersByUserId";
import OrdersClient from "./OrdersClient";

const Orders = async () => {

   
    const currentUser = await getCurrentUser();  // Get the current user

    if (!currentUser ) {
        return <NullData title="Oops! Access denied" />  // Show error if the user is not an admin
    }

    const orders = await getOrdersByUserId(currentUser.id)

    if(!orders){
        return <NullData title="No orderrs yet..."/>
    }

    return (
        <div className="pt-8">
            <Container>
                <OrdersClient orders={orders} />
            </Container>
        </div>
    );
}

export default Orders;
