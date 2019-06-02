// props.dispatch(
    //   services.products.getNextPage({
    //     ...props.query,
    //     cursor
    //   })
    // );

function LoadMore(params:type) {
  return(<td colSpan={3} align="center">
    {props.products.nextPage.error && <p>Error: {props.products.nextPage.error}</p>}
    <button disabled={!props.products.data.pageInfo.hasNextPage} onClick={_getNextPage}>
      {props.products.nextPage.loading ? 'Loading' : props.products.nextPage.error ? 'Try Again' : 'Load More'}
    </button>
  </td>)
}
