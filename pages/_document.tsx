import React from 'react';
import Document from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';
import flush from 'styled-jsx/server';

class MyDocument extends Document {
  public static async getInitialProps(ctx: any): object {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = (): any => {
      return originalRenderPage({
        enhanceApp: App => props => sheets.collect(<App {...props} />)
      });
    };

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {sheets.getStyleElement()}
          {flush() || null}
        </>
      )
    };
  }
}

export default MyDocument;
