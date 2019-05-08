import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ProductList from '../ProductList/ProductList';

function Root() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={ProductList} />
      </Switch>
    </BrowserRouter>
  );
}

export default Root;
