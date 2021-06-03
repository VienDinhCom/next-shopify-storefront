import { useQuery } from 'react-query';
import { GetServerSideProps } from 'next';
import { shopifyService, GetShopQuery } from '@app/services/shopify.service';

interface Props {
  initialData: GetShopQuery;
}

function getShop() {
  return shopifyService.getShop();
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      initialData: await getShop(),
    },
  };
};

export default function Page({ initialData }: Props) {
  const { data, isError, isFetching, isSuccess } = useQuery(['getShop'], getShop, {
    initialData,
  });

  if (isSuccess) return <h1>{data.shop.name}</h1>;

  if (isFetching) return 'Loading...';

  if (isError) return 'Error...';
}
