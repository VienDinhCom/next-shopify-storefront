import React, { ReactElement, useState } from 'react';
import Layout from '../Layout/Layout';
import VariantSelector from './VariantSelector';
import { ProductState } from '../../store/products.slice';

interface Props {
  products: ProductState;
}

function Product(props: Props): ReactElement {
  const { product } = props;
  const [values, setValues] = useState({
    variantId: '',
    quantity: 1
  });

  return (
    <Layout>
      {product.loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>{product.item.title}</h1>
          <p>{product.item.description}</p>
          {product.item.images.edges[0] && (
            <img src={product.item.images.edges[0].node.originalSrc} width={200} alt="" />
          )}

          <VariantSelector
            options={product.item.options}
            variants={product.item.variants.edges || []}
            getVariantId={(variantId: string): void => setValues({ ...values, variantId })}
          />

          <label className="Product__option">
            Quantity
            <input
              min="1"
              type="number"
              value={values.quantity}
              onChange={(event: any): void => setValues({ ...values, quantity: parseInt(event.target.value) })}
            />
          </label>

          <br />

          <button onClick={(): void => console.log(values)}>Add to Cart</button>
        </>
      )}
    </Layout>
  );
}

export default Product;
