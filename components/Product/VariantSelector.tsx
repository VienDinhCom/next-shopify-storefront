import React, { ReactElement, useState, useEffect } from 'react';
import _ from 'lodash';

function VariantSelector(props: any): ReactElement {
  const defaultSelectedOptions = props.variants[0].node.selectedOptions.reduce(
    (options: object, { name, value }: object): any => {
      return { ...options, [name]: value };
    },
    {}
  );

  const [selectedOptions, setSelectedOptions] = useState(defaultSelectedOptions);

  function _onChange(event: any): void {
    const { name, value } = event.target;
    setSelectedOptions({ ...selectedOptions, [name]: value });
  }

  useEffect((): void => {
    const selectedVariant = props.variants.find(
      ({ node }: any): boolean => {
        const _selectedOptions = node.selectedOptions.reduce((options: object, { name, value }: object): any => {
          return { ...options, [name]: value };
        }, {});

        return _.isEqual(_selectedOptions, selectedOptions);
      }
    );

    props.getVariantId(selectedVariant ? selectedVariant.node.id : null);
  }, [selectedOptions]);

  return props.options.map(
    ({ name, values }: any): ReactElement => (
      <div key={name}>
        <span>{name}: </span>
        <select name={name} value={selectedOptions[name]} onChange={_onChange}>
          {values.map(
            (value: any): ReactElement => {
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
