import Document from 'next/document';
import { withMuiDocument } from '../hocs/withMui';

class MyDocument extends Document {}

export default withMuiDocument(MyDocument);
