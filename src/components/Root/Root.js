import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ProductList from '../ProductList/ProductList';
import ProductDetail from '../ProductDetail/ProductDetail';

function Root() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={ProductList} />
        <Route path="/product/:productHandle" exact component={ProductDetail} />
      </Switch>
    </BrowserRouter>
  );
}

export default Root;
