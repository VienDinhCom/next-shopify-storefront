import _ from 'lodash';
import React, { useEffect, useState } from 'react';

interface Props {
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants?: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
  }[];
  getVariantId?: (variantId: string) => void;
}

function VariantSelector({ options, variants, getVariantId }: Props) {
  const defaultSelectedOptions = variants[0].selectedOptions.reduce((options, { name, value }) => {
    return { ...options, [name]: value };
  }, {});

  const [selectedOptions, setSelectedOptions] = useState(defaultSelectedOptions);

  function _onChange(event) {
    const { name, value } = event.target;
    setSelectedOptions({ ...selectedOptions, [name]: value });
  }

  useEffect(() => {
    const selectedVariant = variants.find(variant => {
      const _selectedOptions = variant.selectedOptions.reduce((options, { name, value }) => {
        return { ...options, [name]: value };
      }, {});

      return _.isEqual(_selectedOptions, selectedOptions);
    });

    getVariantId(selectedVariant ? selectedVariant.id : null);
  }, [selectedOptions]);

  return (
    <>
      {options.map(({ name, values }) => (
        <div key={name}>
          <span>{name}: </span>
          <select name={name} value={selectedOptions[name]} onChange={_onChange}>
            {values.map(value => {
              return (
                <option value={value} key={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>
      ))}
    </>
  );
}

export default VariantSelector;
