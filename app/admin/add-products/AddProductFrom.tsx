'use client'

import { useState, useEffect, useCallback } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import axios from "axios";
import { useRouter } from "next/navigation";

import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";
import CategoryInput from "@/app/components/inputs/CategoryInput";
import CustomCheckBox from "@/app/components/inputs/CustomCheckBox";
import Input from "@/app/components/inputs/Input";
import SelectColour from "@/app/components/inputs/SelectColour";
import TextArea from "@/app/components/inputs/TextArea";
import { categories } from "@/utils/categories";
import { colors } from "@/utils/colors";
import firebaseApp from "@/libs/firebase";

export type ImageType = {
    color: string;
    colorCode: string;
    image: File | null;
}

export type UploadedImageType = {
    color: string;
    colorCode: string;
    image: string;
}

const AddProductsForm = () => {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<ImageType[] | null>(null);
    const [isProductCreated, setIsProductCreated] = useState(false);

    // Hooks
    const router = useRouter();
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            description: '',
            brand: '',
            category: '',
            inStock: false,
            images: [],
            price: ""
        }
    });

    const category = watch("category"); // Watch for category changes

    // useEffect Hooks
    useEffect(() => {
        setCustomValue('images', images);
    }, [images]);

    useEffect(() => {
        if (isProductCreated) {
            reset();
            setImages(null);
            setIsProductCreated(false);
        }
    }, [isProductCreated, reset]);

    // Helper Functions
    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true
        });
    };

    const addImageToState = useCallback((value: ImageType) => {
        setImages((prev) => {
            if (!prev) return [value];
            return [...prev, value];
        });
    }, []);

    const removeImageFromState = useCallback((value: ImageType) => {
        setImages((prev) => {
            if (prev) {
                return prev.filter(item => item.color !== value.color);
            }
            return prev;
        });
    }, []);

    const handleImageUploads = async (data: FieldValues, uploadedImages: UploadedImageType[]) => {
        toast("Creating product, please wait...");
    
        try {
            const uploadPromises = data.images
                .filter((item: ImageType) => item.image !== null) // Filter out items where image is null
                .map((item: ImageType) => {
                    return new Promise<void>((resolve, reject) => {
                        if (item.image) {
                            const fileName = new Date().getTime() + '-' + item.image.name;
                            const storage = getStorage(firebaseApp);
                            const storageRef = ref(storage, `products/${fileName}`);
                            const uploadTask = uploadBytesResumable(storageRef, item.image);
    
                            uploadTask.on(
                                'state_changed',
                                (snapshot) => {
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    console.log('Upload is ' + progress + '% done');
                                },
                                (error) => {
                                    console.log("Error uploading image", error);
                                    reject(error);
                                },
                                () => {
                                    getDownloadURL(uploadTask.snapshot.ref)
                                        .then((downloadURL) => {
                                            uploadedImages.push({
                                                ...item,
                                                image: downloadURL
                                            });
                                            console.log('File available at', downloadURL);
                                            resolve();
                                        })
                                        .catch((error) => {
                                            console.log("Error getting the download URL", error);
                                            reject(error);
                                        });
                                }
                            );
                        }
                    });
                });
    
            await Promise.all(uploadPromises);
        } catch (error) {
            setIsLoading(false);
            console.log("Error handling image uploads", error);
            return toast.error('Error handling image uploads');
        }
    };
    

    // Form Submission Handler
    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log("Product Data", data);
        setIsLoading(true);
        let uploadedImages: UploadedImageType[] = [];

        if (!data.category) {
            setIsLoading(false);
            return toast.error("Category is not selected");
        }

        if (!data.images || data.images.length === 0) {
            setIsLoading(false);
            return toast.error("No selected image");
        }

        await handleImageUploads(data, uploadedImages);

        const productData = {
            ...data,
            images: uploadedImages,
            price: parseFloat(data.price)
        };

        axios.post('/api/product', productData).then(() => {
            toast.success('Product created');
            setIsProductCreated(true);
            router.refresh();
        }).catch(() => {
            toast.error("Something went wrong when saving product to DB");
        }).finally(() => {
            setIsLoading(false);
        });
    };

    // Render Component
    return (
        <>
            <Heading title="Add a Product" center />
            
            <Input
                id="name"
                label="Name"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="price"
                label="Price"
                disabled={isLoading}
                register={register}
                errors={errors}
                type="number"
                required
            />
            <Input
                id="brand"
                label="Brand"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <TextArea
                id="description"
                label="Description"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <CustomCheckBox
                id="inStock"
                register={register}
                label="This product is in stock"
            />

            <div className="w-full font-medium">
                <div className="mb-2 font-semibold">Select a category</div>
                <div className="grid grid-cols-2 md:grid-cols-3 max-h-[50vh] overflow-y-auto gap-3">
                    {categories.map((item) => {
                        if (item.label === "All") return null;

                        return (
                            <div key={item.label} className="col-span">
                                <CategoryInput
                                    onClick={(category) => setCustomValue('category', category)}
                                    selected={category === item.label}
                                    label={item.label}
                                    icon={item.icon}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="w-full flex flex-col flex-wrap gap-4 mt-6">
                    <div>
                        <div className="font-bold">Select the available product colors and upload their images</div>
                        <div className="text-sm">You must upload an image for each color selected otherwise your color selection will be ignored</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {colors.map((item, index) => (
                            <SelectColour
                                key={index}
                                item={item}
                                removeImageFromState={removeImageFromState}
                                addImageToState={addImageToState}
                                isProductCreated={isProductCreated}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <Button label={isLoading ? "Loading..." : "Add Product"} onClick={handleSubmit(onSubmit)} />
        </>
    );
}

export default AddProductsForm;
