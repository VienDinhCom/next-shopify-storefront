import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import withLayout from '../../hocs/withLayout';
import { ProductState } from '../../store/product.slice';
import services from '../../services';
import VariantSelector from './VariantSelector';
import QuantityInput from './QuantityInput';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((them: Theme) => ({
  title: {
    margin: 0
  },
  formControl: {
    marginBottom: 20,
    minWidth: 200
  }
}));

interface Props {
  product: ProductState;
  dispatch: Function;
}

function Product({ product, dispatch }: Props) {
  const { loading, error, data } = product;
  const theme = useTheme();
  const classes = useStyles(theme);

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
  const images = data.images.edges;
  const imageSrc = images.length
    ? images[0].node.transformedSrc
    : 'http://www.netum.vn/public/default/img/icon/default-product-image.png';
  const altText = images.length ? images[0].node.altText : '';

  return (
    <>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={5} md={3}>
          <img src={imageSrc} width="100%" alt={altText} />
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          <h1 className={classes.title}>{data.title}</h1>
          <p>{data.description}</p>
          <QuantityInput className={classes.formControl} getQuantity={quantity => setValues({ ...values, quantity })} />
          <VariantSelector
            className={classes.formControl}
            options={data.options}
            variants={variants}
            getVariantId={variantId => setValues({ ...values, variantId })}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(services.checkout.addLineItem(values.variantId, values.quantity))}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default withLayout(Product);
