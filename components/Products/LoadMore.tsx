import React from 'react';
import Button from '@material-ui/core/Button';

// props.dispatch(
//   services.products.getNextPage({
//     ...props.query,
//     cursor
//   })
// );

// function LoadMore(params:type) {
//   return(<td colSpan={3} align="center">
//     {props.products.nextPage.error && <p>Error: {props.products.nextPage.error}</p>}
//     <button disabled={!props.products.data.pageInfo.hasNextPage} onClick={_getNextPage}>
//       {props.products.nextPage.loading ? 'Loading' : props.products.nextPage.error ? 'Try Again' : 'Load More'}
//     </button>
//   </td>)
// }

function LoadMore() {
  return <h1>Loadmore</h1>;
}

export default LoadMore;
