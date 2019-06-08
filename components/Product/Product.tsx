import React, { useState } from 'react';
import withLayout from '../../hocs/withLayout';
import { ProductState } from '../../store/product.slice';
import services from '../../services';
import VariantSelector from './VariantSelector';
import QuantityInput from './QuantityInput';

interface Props {
  product: ProductState;
  dispatch: Function;
}

function Product({ product, dispatch }: Props) {
  const { loading, error, data } = product;

  const [values, setValues] = useState({
    variantId: '',
    quantity: 1
  });

  if (loading) {
    return <p>Loading ...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const variants = data.variants.edges.map(({ node }) => ({ ...node }));

  return (
    <>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {data.images.edges[0] && <img src={data.images.edges[0].node.originalSrc} width={200} alt="" />}
      <QuantityInput getQuantity={quantity => setValues({ ...values, quantity })} />
      <VariantSelector
        options={data.options}
        variants={variants}
        getVariantId={variantId => setValues({ ...values, variantId })}
      />
      <button onClick={() => dispatch(services.checkout.addLineItem(values.variantId, values.quantity))}>
        Add to Cart
      </button>
    </>
  );
}

export default withLayout(Product);
