import { DataProps } from '@app/utilities/deps';
import { uniqBy } from 'lodash';
import type { fetchProductSingleSection } from '@app/sections/ProuctSingleSection';

interface Props {
  variants: DataProps<typeof fetchProductSingleSection>['data']['variants'];
}

export function VariantSelector(props: Props) {
  const options: Record<string, { value: string; avalable: boolean }[]> = {};

  props.variants.nodes.forEach((node) => {
    node.selectedOptions.forEach(({ name, value }) => {
      if (options[name]) {
        options[name] = uniqBy([...options[name], { value, avalable: true }], 'value');
      } else {
        options[name] = [];
      }
    });
  });

  console.log('options', options);

  return (
    <div>
      {Object.keys(options).map((key) => (
        <div key={key}>
          <div>{key}</div>
          {options[key].map(({ value, avalable }) => (
            <button className="m-3 border" key={value}>
              {value}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
