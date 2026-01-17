import type { PageProps } from "@maxvien/next";

import { fetchServerSideProps } from "@maxvien/next";
import { NextSeo } from "next-seo";

import { StoreLayout } from "@site/layouts/store-layout";
import { fetchProductListSection, ProductListSection } from "@site/sections/product-list-section";

export const getStaticProps = fetchServerSideProps(async () => {
  return {
    props: {
      data: {
        productListSection: await fetchProductListSection(),
      },
    },
    revalidate: 60,
  };
});

export default function Page(props: PageProps<typeof getStaticProps>) {
  return (
    <StoreLayout>
      <NextSeo title="Products" description="All Products from Next Shopify Storefront" />
      <ProductListSection data={props.data.productListSection} />
    </StoreLayout>
  );
}
