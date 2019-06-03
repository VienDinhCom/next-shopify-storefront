import React from 'react';
import Container from '@material-ui/core/Container';
import AppBar from './AppBar'

interface Props {
  children;
}

function Layout({ children }: Props) {
  return (
    <>
      <AppBar></AppBar>
      <br/>
      <br/>
      <br/>
      <br/>
      <Container>{children}</Container>
    </>
  );
}

export default Layout;
