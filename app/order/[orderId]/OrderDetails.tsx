'use client'

import Heading from "@/app/components/Heading";
import Status from "@/app/components/Status";
import { formatPrice } from "@/utils/formatPrice";
import { Order } from "@prisma/client";
import moment from "moment";
import { useRouter } from "next/navigation";
import { MdAccessTimeFilled, MdDeliveryDining, MdDone } from "react-icons/md";
import OrderITem from "./OrderItem";
import OrderItem from "./OrderItem";

interface OrderDetailsProps {
    order : Order
}

const OrderDetails : React.FC<OrderDetailsProps>= ({order}) => {
    const router = useRouter()
    return ( 
        <div className="max-w-[1150] m-auto flex flex-col gap-2">
            <div>
                <Heading title="Order Details"/>
            </div>
            <div>
                <span className="font-normal bg-slate-100 shadow-md ">Order Id : </span>
                {order.id}
            </div>
            <div>
                <span className="font-normal bg-slate-100 shadow-md  ">Total Amount : </span>
                {formatPrice(order.amount/100)}
            </div>

            <div className="flex gap-2 items-center">
                <div>
                    <span className="font-normal bg-slate-100 shadow-md  ">Payment Status: </span>
                </div>
                <div>
                    {order.status === 'pending'? (
                        <Status 
                            text="pending"
                            icon={MdAccessTimeFilled}
                            bg="bg-slate-200"
                            color="text-slate-700"
                        />
                    ):order.status==='complete'? (
                        <Status 
                            text="completed"
                            icon={MdDone}
                            bg="bg-green-200"
                            color="text-green-700"
                        />
                    ) : <></>}
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <div>
                    <span className="font-normal bg-slate-100 shadow-md  ">Delivery Status : </span>
                </div>
                <div>
                    {order.deliveryStatus === 'pending'? (
                        <Status 
                            text="pending"
                            icon={MdAccessTimeFilled}
                            bg="bg-slate-200"
                            color="text-slate-700"
                        />
                    ):order.deliveryStatus==='dispatched'? (
                        <Status 
                            text="completed"
                            icon={MdDeliveryDining}
                            bg="bg-purple-200"
                            color="text-purple-700"
                        />
                    ) : order.deliveryStatus==='delivered'? (
                        <Status 
                            text="delivered"
                            icon={MdDone}
                            bg="bg-teal-200"
                            color="text-teal-700"
                        />
                    ):<></>}
                </div>
            </div>
            <div>
                 <span className="font-normal bg-slate-100 shadow-md  ">Date : </span>
                 {moment(order.createDate).fromNow()}
            </div>
            <div>
                <h2 className="font-semibold mt-4 mb-2">Products ordered</h2>
                <div className="grid grid-cols-5 text-xs gap-4 items-center mb-2">
                    <div className="col-span-2 justify-self-start">PRODUCT</div>
                    <div className=" justify-self-center">PRICE</div>
                    <div className=" justify-self-center">QTY</div>
                    <div className=" justify-self-end">TOTAL</div>
                </div>
                {order.products && order.products.map((item) =>{
                        return <OrderItem key={item.id} item={item}></OrderItem>
                })}
            </div>
        </div>
     );
}
 
export default OrderDetails;