import React, { useCallback } from 'react';
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
  const onClick = useCallback(() => router.push(`/products/${handle}`), [router, handle]);

  return (
    <MediaCard
      size="small"
      title={title}
      description={description}
      primaryAction={{
        content: 'View',
        onAction: onClick,
      }}
      secondaryAction={{
        content: new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currencyCode }).format(
          price.amount
        ),
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
        onClick={onClick}
      />
    </MediaCard>
  );
};

export { ProductItem };
