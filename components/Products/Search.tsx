// let timeoutID;

// function _search(event) {
  //   const query = event.target.value;
  //   const queryStr = queryString.stringify({ ...props.query, query });

  //   clearTimeout(timeoutID);
  //   timeoutID = setTimeout(() => pushQueryString(queryStr), 1000);
  // }

function Search(params:type) {
  return(<input type="text" name="query" defaultValue={props.query.query} onChange={_search} />)
}
