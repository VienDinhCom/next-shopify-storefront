import React, { ReactElement } from 'react';
import Layout from '../Layout/Layout';

interface Props {
  children: ReactElement;
}

function Home({ children }: Props): ReactElement {
  return (
    <Layout>
      <>Home</>
      {children}
    </Layout>
  );
}

export default Home;
