import React, { ReactElement } from 'react';
import Link from 'next/link';
import Layout from '../Layout';

interface Props {
  children: ReactElement;
}

function Home({ children }: Props): ReactElement {
  return (
    <Layout>
      <>Home</>
    </Layout>
  );
}

export default Home;
