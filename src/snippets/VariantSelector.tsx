import { DataProps, useState } from '@app/utilities/deps';
import { uniqBy, isEqual } from 'lodash';
import type { fetchProductSingleSection } from '@app/sections/ProuctSingleSection';

interface Props {
  variants: DataProps<typeof fetchProductSingleSection>['data']['variants'];
}

export function VariantSelector(props: Props) {
  const [selectedOptions, setSelectedOptions] = useState({});

  const options: Record<string, { value: string; avalable: boolean; selected: boolean }[]> = {};

  props.variants.nodes.forEach((node) => {
    node.selectedOptions.forEach(({ name, value }) => {
      if (options[name]) {
        options[name] = uniqBy([...options[name], { value, avalable: true, selected: false }], 'value');
      } else {
        options[name] = [];
      }
    });
  });

  const selectedVariant = props.variants.nodes.find((variant) => {
    const options = variant.selectedOptions.reduce(
      (previous, current) => ({ ...previous, [current.name]: current.value }),
      {}
    );

    return isEqual(selectedOptions, options);
  });

  console.log('options', options);
  console.log('selectedOptions', selectedOptions);
  console.log('selectedVariant', selectedVariant);

  return (
    <div>
      {Object.keys(options).map((key) => (
        <div key={key}>
          <div>{key}</div>
          {options[key].map(({ value, avalable }) => (
            <button
              className="m-3 border"
              key={value}
              onClick={() => {
                setSelectedOptions({ ...selectedOptions, [key]: value });
              }}
            >
              {value}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
