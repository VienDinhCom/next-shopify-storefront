import NextLink from 'next/link';
import React, { ReactElement } from 'react';

interface Props {
  path: string;
  params: any;
  children: ReactElement;
}

function Link({ path, params, children }: Props): ReactElement {
  let string = '';
  let query = '';

  for (const key in params) {
    string = string + `/${params[key]}`;
    query = query + `&${key}=${params[key]}`;
  }

  return (
    <NextLink as={`${path}${string}`} href={`${path}?${query}`}>
      {children}
    </NextLink>
  );
}

export default Link;
