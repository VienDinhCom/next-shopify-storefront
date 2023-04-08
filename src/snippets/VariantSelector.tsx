import { DataProps, useState } from '@app/utilities/deps';
import type { fetchProductSingleSection } from '@app/sections/ProuctSingleSection';
import { uniqBy } from 'lodash';

interface Props {
  variants: DataProps<typeof fetchProductSingleSection>['data']['variants'];
}

type Options = {
  name: string;
  values: {
    value: string;
    selected: boolean;
    disabled: boolean;
    availabile: boolean;
  }[];
}[];

function getOptions(variants: Props['variants']): Options {
  const options: Record<string, Options[0]['values']> = {};

  variants.nodes.forEach(({ selectedOptions }) => {
    selectedOptions.forEach(({ name, value }) => {
      if (options[name]) {
        options[name].push({ value, selected: false, availabile: false, disabled: true });
      } else {
        options[name] = [];
      }
    });
  });

  return Object.entries(options).map(([name, values], index) => {
    return {
      name,
      values:
        index === 0 ? uniqBy(values, 'value').map((value) => ({ ...value, disabled: false })) : uniqBy(values, 'value'),
    };
  });
}

export function VariantSelector(props: Props) {
  const [options, setOptions] = useState(getOptions(props.variants));

  // We have two sources
  // Orginal source
  // Selected source
  // We can render the original source but using the selected source to disable inavailable items

  return (
    <div>
      {options.map(({ name, values }) => (
        <div key={name}>
          <h3>{name}</h3>

          {values.map(({ value, selected, availabile, disabled }) => {
            return (
              <button
                key={value}
                disabled={disabled}
                className="m-3 border"
                style={{ color: selected ? 'red' : 'blue' }}
                onClick={() => {
                  setOptions((draftOptions) => {
                    const currentOptionIndex = draftOptions.findIndex((draftOption) => draftOption.name === name);

                    draftOptions.forEach((draftOption, optionIndex) => {
                      draftOption.values.forEach((draftValue) => {
                        // Select current value
                        if (optionIndex === currentOptionIndex) {
                          draftValue.selected = false;

                          if (draftValue.value === value) {
                            draftValue.selected = true;
                          }
                        }

                        // Clear dependent options
                        if (optionIndex > currentOptionIndex) {
                          draftValue.selected = false;
                        }

                        // Enable next option
                        if (optionIndex === currentOptionIndex + 1) {
                          draftValue.disabled = false;
                        }
                      });
                    });
                  });
                }}
              >
                {value}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
