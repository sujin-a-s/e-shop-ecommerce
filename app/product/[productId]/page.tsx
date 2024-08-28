import Container from '@/app/components/Container';
import ProductDetails from './ProductDetails';
import ListRating from './ListRating';
import { products } from '@/utils/products';
import getProductById from '@/actions/getProductsById';
import NullData from '@/app/components/NullData';
import AddRating from './AddRating';
import { getCurrentUser } from '@/actions/getCurrentUser';

interface IPrams {
  productId?: string;
}

const Product = async({ params }: { params: IPrams }) => {
  
  const product = await getProductById(params)
  const user = await getCurrentUser()

  if(!product){
    return <NullData title="Product with the given id doesnt exist"/>
  }

  return (
    <div className="p-8">
      <Container>
        {/* Product Detail: Image, content in the Right side */}
        <ProductDetails product={product} />

        {/* Add Rating and list review*/}
        <div className="flex flex-col gap4 mt-20">
          <AddRating product={product} user={user} />
          <ListRating product={product} />
        </div>
      </Container>
    </div>
  );
};

export default Product;