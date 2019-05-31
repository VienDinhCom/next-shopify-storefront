import red from '@material-ui/core/colors/red';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import React, { Component } from 'react';
import { ServerStyleSheets } from '@material-ui/styles';
import flush from 'styled-jsx/server';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

export function withMuiApp(App) {
  return class AppWithMui extends Component {
    public static async getInitialProps(appContext) {
      let initialProps = {};

      if (typeof App.getInitialProps === 'function') {
        initialProps = await App.getInitialProps(appContext);
      }

      return { ...initialProps };
    }

    public componentDidMount() {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles) {
        jssStyles.parentNode.removeChild(jssStyles);
      } // Remove the server-side injected CSS.
    }

    public render() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App {...this.props} />
        </ThemeProvider>
      );
    }
  };
}


export function withMuiDocument(Document) {
  return class DocumentWithMui extends Component {
    public static async getInitialProps(ctx) {
      const sheets = new ServerStyleSheets();
      const originalRenderPage = ctx.renderPage;

      ctx.renderPage = () => {
        return originalRenderPage({
          enhanceApp: App => props => sheets.collect(<App {...props} />),
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
        ),
      };
    }

    public render() {
      return <Document {...this.props} />;
    }
  };
}
