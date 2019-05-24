import React from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from '../store';

interface Props {
  count: number;
  dispatch: Function;
}

const Index = ({ count, dispatch }: Props) => (
  <>
    <div>{count}</div>
    <button type="button" onClick={() => dispatch(increment(1))}>
      +
    </button>
    <button type="button" onClick={() => dispatch(decrement(1))}>
      -
    </button>
  </>
);

export default connect((state: number) => ({
  count: state
}))(Index);
