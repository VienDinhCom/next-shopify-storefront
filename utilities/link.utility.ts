import Router from 'next/router'

interface LinkParams {
  path: string;
  params?: object;
}

function link(args: LinkParams) {
  let params = '';
  let query = '';

  for (const key in args.params) {
    params = params + `/${args.params[key]}`;
    query = query + `&${key}=${args.params[key]}`;
  }

  const href = `${args.path}?${query}`;
  const as = `${args.path}${params}`;

  Router.push(href, as);
}

export default link;
