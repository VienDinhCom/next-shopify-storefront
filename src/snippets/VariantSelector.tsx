import { useState } from '@app/utilities/deps';

interface Props {
  variants: {
    id: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
  }[];

  options: {
    name: string;
    values: string[];
  }[];
}

type Options = {
  name: string;
  values: {
    value: string;
    selected: boolean;
    disabled: boolean;
  }[];
}[];

function transformOptions(options: Props['options']): Options {
  return options.map(({ name, values }, optionIndex) => {
    return {
      name,
      values: values.map((value) => {
        return {
          value,
          selected: false,
          disabled: optionIndex === 0 ? false : true,
        };
      }),
    };
  });
}

function isAvailable(variants: Props['variants'], draftOptions: Options) {
  const selectedOptions = draftOptions
    .map(({ name, values }) => ({ name, value: values.find(({ selected }) => selected)?.value }))
    .filter(({ value }) => value !== undefined);

  const availabileVariantOptions = variants.filter((variant) => {
    const conditions = selectedOptions.map(
      (selectedOption) =>
        !!variant.selectedOptions.find(
          ({ name, value }) => name === selectedOption.name && value === selectedOption.value
        )
    );

    return !conditions.includes(false);
  });

  return !!availabileVariantOptions.length;
}

export function VariantSelector(props: Props) {
  const [options, setOptions] = useState(transformOptions(props.options));

  return (
    <div>
      {options.map(({ name, values }) => (
        <div key={name}>
          <h3>{name}</h3>

          {values.map(({ value, selected, disabled }) => {
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
                          if (isAvailable(props.variants, draftOptions)) {
                            draftValue.disabled = false;
                          }
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
