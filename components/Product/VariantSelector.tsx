import _ from 'lodash';
import React, { useEffect, useState } from 'react';

function VariantSelector(props) {
  const defaultSelectedOptions = props.variants[0].node.selectedOptions.reduce((options, { name, value }) => {
    return { ...options, [name]: value };
  }, {});

  const [selectedOptions, setSelectedOptions] = useState(defaultSelectedOptions);

  function _onChange(event) {
    const { name, value } = event.target;
    setSelectedOptions({ ...selectedOptions, [name]: value });
  }

  useEffect(() => {
    const selectedVariant = props.variants.find(
      ({ node }) => {
        const _selectedOptions = node.selectedOptions.reduce((options, { name, value }) => {
          return { ...options, [name]: value };
        }, {});

        return _.isEqual(_selectedOptions, selectedOptions);
      }
    );

    props.getVariantId(selectedVariant ? selectedVariant.node.id : null);
  }, [selectedOptions]);

  return props.options.map(
    ({ name, values }) => (
      <div key={name}>
        <span>{name}: </span>
        <select name={name} value={selectedOptions[name]} onChange={_onChange}>
          {values.map(
            (value) => {
              return (
                <option value={value} key={value}>
                  {value}
                </option>
              );
            }
          )}
        </select>
      </div>
    )
  );
}

export default VariantSelector;
