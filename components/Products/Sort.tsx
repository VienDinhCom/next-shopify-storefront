const sortOpts = [
  {
    name: 'Best Selling',
    sortKey: 'best_selling',
    reverse: false,
  },
  {
    name: 'Newest',
    sortKey: 'created_at',
    reverse: true,
  },
  {
    name: 'Oldest',
    sortKey: 'created_at',
    reverse: false,
  },
  {
    name: 'Price (Low > High)',
    sortKey: 'price',
    reverse: false,
  },
  {
    name: 'Price (High > Low)',
    sortKey: 'price',
    reverse: true,
  },
  {
    name: 'Title (A - Z)',
    sortKey: 'title',
    reverse: false,
  },
  {
    name: 'Title (Z - A)',
    sortKey: 'title',
    reverse: true,
  },
];

function pushQueryString(queryStr) {
  const { router } = Router;
  router.push(`${router.pathname}?${queryStr}`);
}

// function _sort(event) {
//   const sortIndex = event.target.value;
//   const { sortKey, reverse } = sortOpts[sortIndex];
//   const queryStr = queryString.stringify({ ...props.query, sortKey, reverse, sortIndex });

//   pushQueryString(queryStr);
// }

export default function Sort() {
  return(
    <select onChange={_sort} name="sortIndex" value={props.query.sortIndex || 0}>
      {sortOpts.map(
        ({ name }, index) => (
          <option key={name} value={index}>
            {name}
          </option>
        )
      )}
    </select>
  )
}
