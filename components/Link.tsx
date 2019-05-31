import NextLink from 'next/link';
import React, { ReactElement } from 'react';

interface Props {
  path: string;
  params;
  children;
}

function Link({ path, params, children }: Props): ReactElement {
  let str = '';
  let query = '';

  for (const key in params) {
    str = str + `/${params[key]}`;
    query = query + `&${key}=${params[key]}`;
  }

  return (
    <NextLink as={`${path}${str}`} href={`${path}?${query}`}>
      <a>{children}</a>
    </NextLink>
  );
}

export default Link;
