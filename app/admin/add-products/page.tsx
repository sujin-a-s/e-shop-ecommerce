import { getCurrentUser } from "@/actions/getCurrentUser";
import Container from "@/app/components/Container";
import FormWrap from "@/app/components/FormWrap";
import { NextResponse } from "next/server";
import AddProductsForm from "./AddProductFrom";
import NullData from "@/app/components/NullData";


const AddProdcuts = async() => {
    const currentUser = await getCurrentUser()

    if(!currentUser || currentUser.role != 'ADMIN'){
        return <NullData title="Oops access denied"/>
    }
    return ( 
        <div className="p-8">
            <Container>
                <FormWrap>
                    <AddProductsForm />
                </FormWrap>
            </Container>
        </div>
     );
}
 
export default AddProdcuts;