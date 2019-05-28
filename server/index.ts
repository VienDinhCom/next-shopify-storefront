import express from 'express';
import next from 'next';
import 'isomorphic-unfetch';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

(async (): Promise<void> => {
  try {
    await app.prepare();

    const server = express();

    server.get(
      '/collections/:id',
      (req: any, res: any): void => {
        const actualPage = '/collections';
        const queryParams = { id: req.params.id };
        app.render(req, res, actualPage, queryParams);
      }
    );

    server.get(
      '/product/:handle',
      (req: any, res: any): void => {
        const actualPage = '/product';
        const queryParams = { handle: req.params.handle };
        app.render(req, res, actualPage, queryParams);
      }
    );

    server.get('*', (req: any, res: any): any => handle(req, res));

    server.listen(
      3000,
      (): void => {
        console.log('> Ready on http://localhost:3000'); // eslint-disable-line
      }
    );
  } catch (error) {
    console.error(error.stack); // eslint-disable-line
    process.exit(1);
  }
})();
