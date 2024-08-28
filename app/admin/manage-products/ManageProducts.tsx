'use client'

import { Product } from "@prisma/client";
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { formatPrice } from "@/utils/formatPrice";
import Heading from "@/app/components/Heading";
import { MdCached, MdDelete, MdDone, MdRemoveRedEye } from "react-icons/md";
import Status from "@/app/components/Status";
import ActionBtn from "@/app/components/Action";
import { useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteObject, getStorage, ref } from "firebase/storage";
import firebaseApp from "@/libs/firebase";

interface ManageProductsClientProps {
    products: Product[]  // Expect an array of products as a prop
}

const ManageProductsClient: React.FC<ManageProductsClientProps> = ({ products }) => {
    const router = useRouter();  // Hook to navigate and refresh the page
    const storage = getStorage(firebaseApp);  // Initialize Firebase storage

    let rows: any = [];
    if (products) {
        // Map each product to a row format for the data grid
        rows = products.map((product) => {
            return {
                id: product.id,
                name: product.name,
                price: formatPrice(product.price),
                category: product.category,
                brand: product.brand,
                inStock: product.inStock,
                images: product.images
            }
        });
    }

    // Define the columns for the data grid
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 200 },
        { field: 'name', headerName: 'Name', width: 200 },
        {
            field: "price",
            headerName: "Price(USD)",
            width: 100,
            renderCell: (params) => {
                return (
                    <div className="font-bold text-slate-800">{params.row.price}</div>
                )
            }
        },
        { field: 'category', headerName: 'Category', width: 100 },
        { field: 'brand', headerName: 'Brand', width: 100 },
        {
            field: 'inStock',
            headerName: 'InStock',
            width: 120,
            renderCell: (params) => {
                // Show status based on stock availability
                return (
                    <div>{params.row.inStock == true ? (
                        <Status text="In Stock" icon={MdDone} bg="bg-teal-0" color="text-teal-700" />
                    ) : (
                        <Status text="Out of Stock" icon={MdDone} bg="bg-rose-0" color="text-rose-700" />
                    )}</div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => {
                // Define action buttons for each product row
                return (
                    <div className="mt-3 flex justify-between gap-4 w-full">
                        {/* Toggle stock status */}
                        <ActionBtn icon={MdCached} onClick={() => {
                            handleToggleStock(params.row.id, params.row.inStock)
                        }} />
                        {/* Delete product */}
                        <ActionBtn icon={MdDelete} onClick={() => {
                            productDelete(params.row.id, params.row.images)
                        }} />
                        {/* View product details */}
                        <ActionBtn icon={MdRemoveRedEye} onClick={() => {
                            router.push(`/product/${params.row.id}`)
                        }} />
                    </div>
                )
            }
        },
    ];

    // Function to toggle stock status of a product
    const handleToggleStock = useCallback((id: string, inStock: boolean) => {
        axios.put("/api/product", {
            id,
            inStock: !inStock  // Flip the stock status
        }).then((res) => {
            toast.success("Product status changed");
            router.refresh();  // Refresh the page to reflect changes
        }).catch((err) => {
            toast.error("Oops! Something went wrong");
            console.log(err);  // Log error if the request fails
        })
    }, [router]);

    // Function to delete a product
    const productDelete = useCallback(async (id: string, images: any[]) => {
        toast("Deleting product, Please wait!");  // Notify user of deletion process

        // Function to delete images from Firebase storage
        const handleImageDeletion = async () => {
            try {
                for (const item of images) {
                    if (item.image) {
                        const imageRef = ref(storage, item.image);  // Reference to the image in Firebase storage
                        await deleteObject(imageRef);  // Delete image
                        console.log("Image deleted", item.image);
                    }
                }
            } catch (error) {
                console.log("Error deleting images in Firebase", error);  // Log error if image deletion fails
            }
        }

        await handleImageDeletion();  // Call the image deletion function

        // Delete the product from the database
        axios.delete(`/api/product/${id}`)
            .then((res) => {
                toast.success("Product deleted successfully");
                router.refresh();  // Refresh the page after deletion
            })
            .catch((err) => {
                toast.error("Oops! Something went wrong");
                console.log(err);  // Log error if the request fails
            })
    }, [router, storage]);

    // Render the data grid within the page layout
    return (
        <div className="max-w-[1150px] m-auto text-xl">
            <div className="mb-4 mt-8">
                <Heading title="Manage Products" center />
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

export default ManageProductsClient;
