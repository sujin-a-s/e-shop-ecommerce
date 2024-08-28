import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { IconType } from "react-icons";

interface CategoryProps {
    label : string;
    icon : IconType;
    selected? : boolean
}

const ClientCategory = dynamic(() => import('./CategoryClient'), {
  ssr: false,
})

const Category: React.FC<CategoryProps> = (props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientCategory {...props} />
    </Suspense>
  )
}

export default Category;