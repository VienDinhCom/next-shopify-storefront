import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ProductState } from '../../store/product.slice';
import * as services from '../../services';
import Layout from '../Layout/Layout';
import VariantSelector from './VariantSelector';


interface Props {
  product: ProductState;
  dispatch: Function;
}

function Product(props: Props) {
  const { product } = props;
  const [values, setValues] = useState({
    variantId: '',
    quantity: 1,
  });

  return (
    <Layout>
      {product.loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>{product.item.title}</h1>
          <p>{product.item.description}</p>
          {product.item.images.edges[0] && <img src={product.item.images.edges[0].node.originalSrc} width={200} alt="" />}

          <VariantSelector
            options={product.item.options}
            variants={product.item.variants.edges || []}
            getVariantId={(variantId) => setValues({ ...values, variantId })}
          />

          <label className="Product__option">
            Quantity
            <input
              min="1"
              type="number"
              value={values.quantity}
              onChange={(event) => setValues({ ...values, quantity: parseInt(event.target.value) })}
            />
          </label>

          <br />

          <button onClick={() => props.dispatch(services.checkout.addLineItem(values.variantId, values.quantity))}>
            Add to Cart
          </button>
        </>
      )}
    </Layout>
  );
}

export default connect()(Product);
