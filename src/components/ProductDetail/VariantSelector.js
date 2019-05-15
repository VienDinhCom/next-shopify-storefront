import React, { Component } from 'react';
import _ from 'lodash';

class VariantSelector extends Component<Object, Object> {
  constructor(props: Object) {
    super(props);

    const state = {};

    this.props.options.forEach(option => {
      state[option.name] = option.values[0];
    });

    this.state = state;
  }

  componentDidMount() {
    this.getSelectedVariant();
  }

  getSelectedVariant = () => {
    const { variants } = this.props;

    const selectedVariant = variants.edges.find(({ node }) => {
      const selectedOptions = {};

      node.selectedOptions.forEach(({ name, value }) => {
        selectedOptions[name] = value;
      });

      return _.isEqual(selectedOptions, this.state);
    });

    if (selectedVariant) {
      this.props.getSelectedVariant(selectedVariant.node.id);
    } else {
      this.props.getSelectedVariant(null);
    }
  };

  handleChange = (name: string, value: string) => {
    this.setState({ [name]: value });
    this.getSelectedVariant();
  };

  render() {
    return this.props.options.map(option => (
      <div key={option.name}>
        <span>{option.name}: </span>
        <select
          name={option.name}
          value={this.state[option.name]}
          onChange={event => this.handleChange(option.name, event.target.value)}
        >
          {option.values.map(value => {
            return (
              <option value={value} key={value}>
                {value}
              </option>
            );
          })}
        </select>
      </div>
    ));
  }
}

export default VariantSelector;
