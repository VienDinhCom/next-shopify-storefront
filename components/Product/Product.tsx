import React, { ReactElement } from 'react';
import Layout from '../Layout';
import { ProductState } from '../../store/products';

interface Props {
  products: ProductState;
}

function Product(props: Props): ReactElement {
  // console.log(props);
  return (
    <Layout>
      <h1>Product</h1>
    </Layout>
  );
}

export default Product;
