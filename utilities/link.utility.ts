import Router from 'next/router'

interface LinkParams {
  path: string;
  params?: object;
}

function link({ path, params }: LinkParams) {
  let str = '';
  let query = '';

  for (const key in params) {
    str = str + `/${params[key]}`;
    query = query + `&${key}=${params[key]}`;
  }

  const href = `${path}?${query}`;
  const as = `${path}${str}`;

  Router.push(href, as);
}

export default link;
