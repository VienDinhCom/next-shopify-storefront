import React from 'react';
import title from 'title';
import Image from 'next/image';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { styled } from '@material-ui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import Typography from '@material-ui/core/Typography';
import { IntlService } from '@app/services/intl.service';

const Wrapper = styled('div')(({ theme }) => ({
  padding: '16px',
}));

export interface ProductSingleProps {
  title: string;
  description: string;
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
  variants: {
    id: string;
    title: string;
    image?: string | null;
    price: {
      amount: number;
      currencyCode: string;
    };
  }[];
}

export const ProductSingle: React.FC<ProductSingleProps> = (props) => {
  return (
    <Card>
      <Grid container>
        <Grid item xs={12} sm={5}>
          <Swiper>
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

            <FormControl fullWidth size="small">
              <InputLabel id="product-variants-label">Variants</InputLabel>
              <Select
                labelId="product-variants-label"
                // value={age}
                label="Variants"
                // onChange={handleChange}
              >
                {props.variants.map((variant) => (
                  <MenuItem key={variant.id} value={10}>
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
