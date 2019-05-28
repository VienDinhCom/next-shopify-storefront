import React, { ReactElement } from 'react';
import Layout from '../Layout';
import { ProductState } from '../../store/products';

interface Props {
  products: ProductState;
}

function Product(props: Props): ReactElement {
  return (
    <Layout>
      <h1>Product: {props.product.item.title}</h1>
    </Layout>
  );
}

export default Product;
