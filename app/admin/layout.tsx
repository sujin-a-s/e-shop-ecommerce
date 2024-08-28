import AdminNav from "../components/admin/AdminNav";


export const  metadata = {
    title : "E-Shop Admin",
    description : "E-Shop Admin Dashboard"
}

// a lyout page which means it will be there as long as the user is in one of the variants of admin page
const AdminLayout = ({children} : {children : React.ReactNode}) => {
    return ( 
        <div>
            <AdminNav />
            {children}
        </div>
     );
}
 
export default AdminLayout;