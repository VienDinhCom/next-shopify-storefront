import React from 'react';
import { useRouter } from 'next/router';
import { MediaCard } from '@shopify/polaris';
import { MoneyV2 } from '@app/services/shopify.service';

type Props = {
  handle: string;
  title: string;
  description: string;
  price: MoneyV2;
  image: { src: string; altText: string };
};

const ProductItem: React.FC<Props> = ({ handle, title, description, image, price }: Props) => {
  const router = useRouter();

  return (
    <MediaCard
      title={title}
      description={description}
      primaryAction={{
        content: 'View',
        onAction: () => router.push(`/products/${handle}`),
      }}
      secondaryAction={{
        content: `${price.amount} ${price.currencyCode}`,
      }}
    >
      <img
        src={image.src}
        alt={image.altText}
        width="100%"
        height="100%"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </MediaCard>
  );
};

export { ProductItem };
