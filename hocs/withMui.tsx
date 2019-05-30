import React, { Component, ReactElement } from 'react';
import { NextComponentClass } from 'next';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#19857b'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#fff'
    }
  }
});

function withMui(App: NextComponentClass): NextComponentClass {
  return class AppWithMui extends Component<object> {
    public static async getInitialProps(appContext: NextAppContext): Promise<object> {
      let initialProps = {};

      if (typeof App.getInitialProps === 'function') {
        initialProps = await App.getInitialProps(appContext);
      }

      return { ...initialProps };
    }

    public componentDidMount(): void {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles) jssStyles.parentNode.removeChild(jssStyles); // Remove the server-side injected CSS.
    }

    public render(): ReactElement {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App {...this.props} />
        </ThemeProvider>
      );
    }
  };
}

export default withMui;
