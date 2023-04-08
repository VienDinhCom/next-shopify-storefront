import { DataProps, useState } from '@app/utilities/deps';
import type { fetchProductSingleSection } from '@app/sections/ProuctSingleSection';
import { uniq, uniqBy, find } from 'lodash';

interface Props {
  variants: DataProps<typeof fetchProductSingleSection>['data']['variants'];
  options: DataProps<typeof fetchProductSingleSection>['data']['options'];
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

function getOptions(options: Props['options']): Options {
  return options.map(({ name, values }, optionIndex) => {
    return {
      name,
      values: values.map((value) => {
        return {
          value,
          selected: false,
          disabled: optionIndex === 0 ? false : true,
          availabile: false,
        };
      }),
    };
  });
}

function getOptionsFromVariants(variants: Props['variants']['nodes']): Options {
  const options: Record<string, Options[0]['values']> = {};

  variants.forEach(({ selectedOptions }) => {
    selectedOptions.forEach(({ name, value }) => {
      if (options[name]) {
        options[name].push({ value, selected: false, availabile: true, disabled: true });
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
  const [options, setOptions] = useState(getOptions(props.options));

  const selectedOptions = options
    .map(({ name, values }) => {
      return {
        name,
        value: values.find(({ selected }) => selected)?.value,
      };
    })
    .filter(({ value }) => value !== undefined);

  const variantOptions = (() => {
    const variants = props.variants.nodes.filter((variant) => {
      const hello = selectedOptions.map(({ name, value }) => !!find(variant.selectedOptions, { name, value }));
      return !hello.includes(false);
    });

    const ok: Record<string, string[]> = {};

    variants.forEach(({ selectedOptions }) => {
      selectedOptions.forEach(({ name, value }) => {
        if (ok[name]) {
          ok[name] = uniq([...ok[name], value]);
        } else {
          ok[name] = [value];
        }
      });
    });

    return ok;
  })();

  console.log('\n\n\n\n');
  console.log(JSON.stringify(selectedOptions, null, 2));
  console.log(JSON.stringify(variantOptions, null, 2));

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
                style={{
                  color: selected ? 'red' : 'black',
                }}
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
                          draftValue.disabled = true;
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
