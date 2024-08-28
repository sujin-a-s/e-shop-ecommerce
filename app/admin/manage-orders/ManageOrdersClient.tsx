'use client'

import { Order, User } from "@prisma/client";
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { formatPrice } from "@/utils/formatPrice";
import Heading from "@/app/components/Heading";
import { MdAccessTimeFilled, MdDeliveryDining, MdDone, MdRemoveRedEye } from "react-icons/md";
import Status from "@/app/components/Status";
import ActionBtn from "@/app/components/Action";
import { useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import moment from "moment";

interface ManageOrdersClientProps {
    orders: ExtendedOrder[]  // Expect an array of products as a prop
}


type ExtendedOrder = Order & {
    user : User
}
const ManageOrdersClient: React.FC<ManageOrdersClientProps> = ({ orders }) => {
    const router = useRouter();  // Hook to navigate and refresh the page
    let rows: any = [];
    if (orders) {
        // Map each product to a row format for the data grid
        rows = orders.map((order) => {
            return {
                id: order.id,
                customer : order.user.name,
                amount: formatPrice(order.amount/100),
                paymentStatus: order.status,
                date : moment(order.createDate).fromNow(),
                deliveryStatus: order.deliveryStatus,
                
            }
        });
    }

    // Define the columns for the data grid
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 200 },
        { field: 'customer', headerName: 'Customer Name', width: 130 },
        {
            field: "amount",
            headerName: "Amount(USD)",
            width: 130,
            renderCell: (params) => {
                return (
                    <div className="font-bold text-slate-800">{params.row.amount}</div>
                )
            }
        },
        {
            field: 'paymentStatus',
            headerName: 'Payment Status',
            width: 130,
            renderCell: (params) => {
                // Show status based on stock availability
                return (
                    <div>
                        {params.row.paymentStatus === 'pending' ? (
                            <Status 
                                text="pending" 
                                icon={MdAccessTimeFilled} 
                                bg="bg-slate-0" 
                                color="text-state-700" 
                            />
                        ) : params.row.paymentStatus === 'complete' ? (
                            <Status 
                                text="completed" 
                                icon={MdDone} 
                                bg="bg-teal-0" 
                                color="text-teal-700" 
                            />
                        ): (
                            <></>
                        )}
                    </div>
                );
            }
        },
        {
            field: 'deliveryStatus',
            headerName: 'Delivery Status',
            width: 130,
            renderCell: (params) => {
                // Show status based on delievr 
                return (
                    <div>
                        {params.row.deliveryStatus === 'pending' ? (
                            <Status 
                                text="pending" 
                                icon={MdAccessTimeFilled} 
                                bg="bg-slate-0" 
                                color="text-state-700" 
                            />
                        ) : params.row.deliveryStatus === 'dispatched' ? (
                            <Status 
                                text="dispatched" 
                                icon={MdDeliveryDining} 
                                bg="bg-purple-0" 
                                color="text-purple-700" 
                            />
                        ) : params.row.deliveryStatus === 'delivered' ? (
                            <Status 
                                text="delivered" 
                                icon={MdDone} 
                                bg="bg-green-0" 
                                color="text-green-700" 
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                );
            }
        },
        { field: 'date', headerName: 'Date', width: 130 },
        {
            field: 'action',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => {
                // Define action buttons for each product row
                return (
                    <div className="mt-3 flex justify-between gap-4 w-full">
                        {/* Toggle stock status */}
                        <ActionBtn icon={MdDeliveryDining} onClick={() => {
                            handleDispatch(params.row.id)
                        }} />
                        {/* Delete product */}
                        <ActionBtn icon={MdDone} onClick={() => {
                            handleDeliver(params.row.id)
                        }} />
                        {/* View product details */}
                        <ActionBtn icon={MdRemoveRedEye} onClick={() => {
                            router.push(`/order/${params.row.id}`)
                        }} />
                    </div>
                )
            }
        },
    ];

    // Function to toggle stock status of a product
    const handleDispatch = useCallback((id: string) => {
        axios.put("/api/order", {
            id,
            deliveryStatus : 'dispatched'  // Flip the stock status
        }).then((res) => {
            toast.success("Order Dispatched");
            router.refresh();  // Refresh the page to reflect changes
        }).catch((err) => {
            toast.error("Oops! Something went wrong");
            console.log(err);  // Log error if the request fails
        })
    }, []);

    const handleDeliver = useCallback((id: string) => {
        axios.put("/api/order", {
            id,
            deliveryStatus : 'delivered'  // Flip the stock status
        }).then((res) => {
            toast.success("Order delivered");
            router.refresh();  // Refresh the page to reflect changes
        }).catch((err) => {
            toast.error("Oops! Something went wrong");
            console.log(err);  // Log error if the request fails
        })
    }, []);


    // Render the data grid within the page layout
    return (
        <div className="max-w-[1150px] m-auto text-xl">
            <div className="mb-4 mt-8">
                <Heading title="Manage Orders" center />
            </div>
            <div className="h-[600px] w-full">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </div>
        </div>
    );
}

export default ManageOrdersClient;
