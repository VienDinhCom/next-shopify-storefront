import { DataProps, useState } from '@app/utilities/deps';
import { isEqual } from 'lodash';
import type { fetchProductSingleSection } from '@app/sections/ProuctSingleSection';

interface Props {
  variants: DataProps<typeof fetchProductSingleSection>['data']['variants'];
}

export function VariantSelector(props: Props) {
  const options = (() => {
    const options: Record<string, Record<string, { selected: boolean; available: boolean }>> = {};

    props.variants.nodes.forEach(({ selectedOptions }) =>
      selectedOptions.forEach(({ name, value }) => {
        if (options[name]) {
          options[name][value] = { available: false, selected: false };
        } else {
          options[name] = {};
        }
      })
    );

    return options;
  })();

  const [selectedOptions, setSelectedOptions] = useState({});

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
      {Object.keys(options).map((name) => {
        return (
          <div key={name}>
            <h3>{name}</h3>

            {Object.keys(options[name]).map((value) => {
              return (
                <button
                  key={value}
                  className="m-3 border"
                  onClick={() => {
                    setSelectedOptions({ ...selectedOptions, [name]: value });
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
