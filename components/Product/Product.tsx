import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ProductState } from '../../store/product.slice';
import services from '../../services';
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
    quantity: 1
  });

  const variants = product.data.variants.edges.map(({ node }) => {
    return {
      id: node.id,
      title: node.title,
      selectedOptions: node.selectedOptions.map(option => ({ name: option.name, value: option.value }))
    };
  });

  console.log(variants);

  return (
    <Layout>
      {product.loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>{product.data.title}</h1>
          <p>{product.data.description}</p>
          {product.data.images.edges[0] && (
            <img src={product.data.images.edges[0].node.originalSrc} width={200} alt="" />
          )}

          {/* <VariantSelector
            // options={product.data.options}
            variants={variants}
            getVariantId={(variantId) => setValues({ ...values, variantId })}
          /> */}

          <label className="Product__option">
            Quantity
            <input
              min="1"
              type="number"
              value={values.quantity}
              onChange={event => setValues({ ...values, quantity: parseInt(event.target.value) })}
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
