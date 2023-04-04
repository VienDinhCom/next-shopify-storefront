import type { AsyncReturnType } from 'type-fest';
import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps, GetStaticProps, PreviewData } from 'next';

export interface DataProps<Fn extends (...args: any[]) => Promise<unknown>> {
  data: AsyncReturnType<Fn>;
}

export function fetchServerSideProps<
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
  Fn extends GetServerSideProps<{ data: any }, Params, Preview> = GetServerSideProps<{ data: any }>
>(getServerSideProps: Fn) {
  return getServerSideProps;
}

export function fetchStaticProps<
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
  Fn extends GetStaticProps<{ data: any }, Params, Preview> = GetStaticProps<{ data: any }>
>(getStaticProps: Fn) {
  return getStaticProps;
}

export type PageProps<Fn extends (...args: any[]) => Promise<{ props: { data: any } }>> = AsyncReturnType<Fn>['props'];
