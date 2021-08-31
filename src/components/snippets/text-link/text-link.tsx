import React from 'react';
import omit from 'lodash/omit';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { Link, LinkProps } from '@material-ui/core';

interface Props extends Omit<LinkProps, 'href'>, Omit<NextLinkProps, 'passHref'> {
  children: React.ReactNode;
}

export const TextLink: React.FC<Props> = (props) => {
  return (
    <NextLink {...props} passHref>
      <Link underline="hover" {...omit(props, 'href')}>
        {props.children}
      </Link>
    </NextLink>
  );
};
