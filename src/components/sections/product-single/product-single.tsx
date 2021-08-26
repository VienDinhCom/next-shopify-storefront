import React, { useState } from 'react';
import title from 'title';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { styled } from '@material-ui/system';
import { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Typography from '@material-ui/core/Typography';
import { IntlService } from '@app/services/intl.service';

const Wrapper = styled('div')(({ theme }) => ({
  padding: '16px',
}));

interface Variant {
  id: string;
  title: string;
  image?: string;
  price: {
    amount: number;
    currencyCode: string;
  };
}

export interface ProductSingleProps {
  title: string;
  description: string;
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
  variants: Variant[];
}

interface ProductSingleState {
  variant: Variant;
}

export const ProductSingle: React.FC<ProductSingleProps> = (props) => {
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [state, setState] = useImmer<ProductSingleState>({
    variant: props.variants[0],
  });

  function onSlideChange(swiper: SwiperClass) {
    const activeImage = props.images[swiper.activeIndex];
    const variant = props.variants.find((variant) => variant.image === activeImage.id);

    setState((draft) => {
      if (variant) {
        draft.variant = variant;
      }
    });
  }

  function onVariantChange(
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: string;
      event: Event | React.SyntheticEvent<Element, Event>;
    }>
  ) {
    const variant = props.variants.find(({ id }) => id === event.target.value);
    const slideIndex = props.images.findIndex((image) => image.id === variant?.image);

    if (slideIndex !== -1) {
      swiper?.slideTo(slideIndex);
    }

    setState((draft) => {
      draft.variant = variant!;
    });
  }

  return (
    <Card>
      <Grid container>
        <Grid item xs={12} sm={5}>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
              onSlideChange(swiper);
            }}
            onSlideChange={onSlideChange}
          >
            {props.images.map(({ id, src, alt }) => (
              <SwiperSlide key={id}>
                <Image src={src} alt={alt} width="768" height="1024" layout="responsive" />
              </SwiperSlide>
            ))}
          </Swiper>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Wrapper>
            <Typography gutterBottom variant="h5" component="h1">
              {title(props.title)}
            </Typography>

            <Typography sx={{ marginBottom: '16px' }} gutterBottom variant="body2" component="div">
              <b>Price</b>: <span css={{ color: '#d32f2f' }}>{IntlService.formatCurrency(state.variant.price)}</span>
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel id="product-variants-label">Variants</InputLabel>
              <Select
                label="Variants"
                labelId="product-variants-label"
                value={state.variant.id}
                onChange={onVariantChange}
              >
                {props.variants.map((variant) => (
                  <MenuItem key={variant.id} value={variant.id}>
                    {variant.title} - {IntlService.formatCurrency(variant.price)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Wrapper>
        </Grid>
      </Grid>
    </Card>
  );
};
