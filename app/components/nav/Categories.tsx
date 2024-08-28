import dynamic from 'next/dynamic'
import { Suspense } from 'react'


const CategoriesClient = dynamic(() => import('./CategoriesClient'), {
  ssr: false,
})

const Categories = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesClient />
    </Suspense>
  )
}

export default Categories;