import Document from 'next/document';
import withMuiDoc from '../hocs/withMuiDoc';

class MyDocument extends Document {}

export default withMuiDoc(MyDocument);
