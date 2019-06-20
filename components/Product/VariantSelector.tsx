import _ from 'lodash';
import Select from '@material-ui/core/Select';
import React, { useEffect, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((them: Theme) => ({
  formLabel: {
    fontSize: '1em'
  },
  formControl: {
    minWidth: 200
  }
}));

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
  className?: string;
}

function VariantSelector({ options, variants, getVariantId, className }: Props) {
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

  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <div className={className}>
      {options.map(({ name, values }) => (
        <div key={name}>
          <InputLabel className={classes.formLabel} htmlFor={`product-option-${name}`}>
            {name}
          </InputLabel>
          <FormControl className={classes.formControl}>
            <Select
              native
              value={selectedOptions[name]}
              onChange={_onChange}
              inputProps={{
                name: { name },
                id: `product-option-${name}`
              }}
            >
              {values.map(value => {
                return (
                  <option value={value} key={value}>
                    {value}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </div>
      ))}
    </div>
  );
}

export default VariantSelector;
