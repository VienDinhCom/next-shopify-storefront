import Document from 'next/document';
import cookieParser from 'cookie-parser';

import { withMuiDocument } from '../hocs/withMui';

function next() {
  /* noop */
}

export async function middleware({ req, res }) {
  await cookieParser()(req, res, next);
}

class MyDocument extends Document {}

export default withMuiDocument(MyDocument);
