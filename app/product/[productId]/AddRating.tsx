'use client'

import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";
import Input from "@/app/components/inputs/Input";

import { SafeUser } from "@/types";
import { Rating } from "@mui/material";
import {Product , Review,Order} from "@prisma/client"
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {  FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";


interface AddRatingProps {
    product: Product & {
        reviews: Review[]
    };
    user : (SafeUser & {
        orders : Order[]
    }) | null
}


const AddRating: React.FC<AddRatingProps> = ({
    product,user
}) => {

    console.log('AddRating Props:', { product, user })

    const [isLoading,setIsLoading] = useState(false)
    const router = useRouter()

    const  {reset , handleSubmit , setValue , register , formState : {errors}} = useForm<FieldValues>({
        defaultValues : {
            comment : "",
            rating : 0
        }
    })



    const setCustomValue = (id : string,value:any) =>{
        setValue(id,value,{
            shouldDirty : true,
            shouldTouch : true,
            shouldValidate : true
        })
    }

    

    if(!user || !product) return null

        // Check if the user has bought and received the product 
    const hasBoughtAndReceived = user?.orders.some((order) => {
        const hasMatchingProduct = order.products.some((item) => {

            return item.id === product.id;
        });
        return hasMatchingProduct && order.status === "complete";
    });
        
        
        

        // Check if the user has already reviewed the product
        const hasReviewed = product.reviews.some(
            (review) => review.userId === user?.id
        );
        console.log('User exists:', !!user)
        console.log('Product exists:', !!product)
        console.log('Has bought and received:', hasBoughtAndReceived)
        console.log('Has reviewed:', hasReviewed)



        user?.orders.forEach(order => {
            console.log("Order Status:", order.status);
            order.products.forEach(item => {
                console.log("Item ID:", item.id, "Matches Product ID:", item.id === product.id);
            });
        });
        // If the user has not bought and received the product or has already reviewed it, do nothing
        if (!hasBoughtAndReceived || hasReviewed) {
            return null
        }
    



    const onSubmit : SubmitHandler<FieldValues> = async(data) => {
        setIsLoading(true)
        if(data.rating === 0){
            setIsLoading(false)
            return toast.error('No rating selected')
        }
        const ratingData = {
            ...data,
            userId: user?.id,
            product : product
        }

        await axios.post('/api/rating',ratingData).then((res)=>{
            toast.success('Rating Submitted')
            router.refresh()
            reset()
        }).catch((err)=>{
            toast.error('Something went wrong')
            console.log(err)
        }).finally(()=>{
            setIsLoading(false)
        })


    }

    

    return ( 
        <div className="flex flex-col gap-2 max-w-[500px]">
            <Heading title="Rate this product"/>
            <Rating onChange={(event,newValue)=>{
                setCustomValue('rating',newValue)
            }}/>
            <Input 
                id='comment'
                label='Comment'
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Button label={isLoading?"Loading":"Rate Product"} onClick={handleSubmit(onSubmit)}/>

        </div>
     );
}
 
export default AddRating;