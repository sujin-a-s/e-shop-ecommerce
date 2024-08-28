'use client'

import { ImageType } from "@/app/admin/add-products/AddProductFrom";
import {useState , useEffect} from "react"
import {useCallback} from "react"
import SelectImage from "./SelectImage";
import Button from "../Button";

interface SelectColorProps {
    item : ImageType;
    addImageToState : (value : ImageType) => void
    removeImageFromState : (value : ImageType) => void
    isProductCreated : boolean
}


const SelectColour : React.FC<SelectColorProps>= ({
    item,addImageToState,removeImageFromState,isProductCreated
}) => {

    const [isSelected ,setIsSelected] = useState(false)
    const [file,setFile] = useState<File | null>(null)

    useEffect(()=>{
        if(isProductCreated){
            setIsSelected(false)
            setFile(null)
        }
    },[isProductCreated])

    const handleFileChange = useCallback((value : File) => {
        setFile(value)
        addImageToState({...item , image: value})
    },[])

    const handleCheck = useCallback((e : React.ChangeEvent<HTMLInputElement>)=>{
        setIsSelected(e.target.checked)

        if(!e.target.checked){
            setFile(null)
            removeImageFromState(item)
        }
    },[])

    return ( 
        <div className="w-full overflow-y-auto border-[1.2px] border-slate-200 items-center p-2">
            <div className="flex gap-2 h-[60px] items-center ">
                <input id={item.color} type="checkbox" checked={isSelected} onChange={handleCheck} className="cursor-pointer"/>
                <label htmlFor={item.color} className="font-medium cursor-pointer">
                    {item.color}
                </label>
            </div>

            <>
            {isSelected && !file && (
                <div className=" text-center">
                    <SelectImage item={item} handleFileChange={handleFileChange}/>
                </div>
            )}
            {file && (
                <div className="flex flex-row gap-2 text-sm col-span-2 items-center justify-between">
                    <p>{file.name}</p>
                    <div className="w-70px">
                        <Button small outline label="Cancel" onClick={()=>{
                            setFile(null)
                            removeImageFromState(item)
                        }}/>
                    </div>
                </div>
            )}
            </>
        </div>
     );
}
 
export default SelectColour;