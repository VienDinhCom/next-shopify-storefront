import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/collections/:id', (req, res) => {
      const actualPage = '/collections';
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get('/products/:id', (req, res) => {
      const actualPage = '/products';
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, () => {
      console.log('> Ready on http://localhost:3000'); // eslint-disable-line
    });
  })
  .catch(ex => {
    console.error(ex.stack); // eslint-disable-line
    process.exit(1);
  });
