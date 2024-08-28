
'use client'

import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useCallback } from "react";
import { IconType } from "react-icons";

interface CategoryProps {
    label : string;
    icon : IconType;
    selected? : boolean
}


const Category
 : React.FC<CategoryProps>= ({label,icon:Icon,selected}) => {

    const router = useRouter()
    const params = useSearchParams()




    const handleClick = useCallback(()=>{
        if(label === 'All'){
            return router.push('/')
        }else{
            let currentQuery = {}

            if(params){
                currentQuery = queryString.parse(params.toString())
            }

            const updateQuery : any  = {
                ...currentQuery,
                category : label
            }

            const url = queryString.stringifyUrl(
                {
                    url : '/',
                    query: updateQuery
                },
                {
                    skipNull: true
                }
            )

            router.push(url)
        }
    },[label,params,router])

    return ( 
        <div onClick={handleClick} className={`flex border p-2 items-center justify-center text-center gap-1 border-b-2 hover:text-slate-800 transition curson-pointer ${selected?'border-b-slate-800 text-slate-800':'border-transparent text-slate-500'}`}>
            <Icon size={20}/>
            <div className="font-medium text-sm">{label}</div>
        </div>
     );
}
 
export default Category
;



// Initial State:
// URL: '/'
// Params: null

// User Clicks "Clothes":
// label = "Clothes"

// Parsing URL (if any params already exist):
// Let's say the user had previously selected "Red".
// currentQuery = {
//     color: "Red"
// }

// Updating the Query:
// New Query:
// updateQuery = {
//     color: "Red",
//     category: "Clothes"
// }

// Stringifying the Query:
// New URL String:
// /?color=Red&category=Clothes

// Redirecting:
// User is sent to the new URL with the updated filters.

// Summary: 
// This function handles user clicks on categories. It updates the URL parameters with the selected category and any existing filters (like color). 
// The user is then redirected to the new URL, where the filtered product list is displayed.