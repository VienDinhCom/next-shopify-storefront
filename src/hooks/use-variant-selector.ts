import { useState, useMemo } from "react";


interface Product {
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      selectedOptions: {
        name: string;
        value: string;
      }[];
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
}

type OptionValue = {
  value: string;
  selected: boolean;
  disabled: boolean;
};

type Option = {
  name: string;
  values: OptionValue[];
};

type Options = Option[];

export function useVariantSelector(product: Product) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const options = useMemo(() => {
    const computedOptions: Options = [];
    let availableVariants = product.variants.nodes;

    for (let i = 0; i < product.options.length; i++) {
      const productOption = product.options[i];
      const selectedValue = selections[productOption.name];

      // Calculate available values for the current option based on previous selections
      const availableValues = new Set<string>();
      for (const variant of availableVariants) {
        const variantOption = variant.selectedOptions.find(
          (o) => o.name === productOption.name
        );
        if (variantOption) {
          availableValues.add(variantOption.value);
        }
      }

      const isPreviousSelected =
        i === 0 || !!selections[product.options[i - 1].name];

      computedOptions.push({
        name: productOption.name,
        values: productOption.values.map((value) => {
          const isSelected = selectedValue === value;
          const isAvailable = availableValues.has(value);
          
          return {
            value,
            selected: isSelected,
            // Disabled if:
            // 1. Previous option not selected (enforce sequential)
            // 2. Value not available in current filtered variants
            disabled: !isPreviousSelected || !isAvailable,
          };
        }),
      });

      // Prepare variants for the next option
      if (selectedValue) {
        availableVariants = availableVariants.filter((variant) =>
          variant.selectedOptions.some(
            (o) => o.name === productOption.name && o.value === selectedValue
          )
        );
      } else {
        // If current option not selected, subsequent options have no available variants
        // (This keeps strict sequential logic)
        availableVariants = [];
      }
    }

    return computedOptions;
  }, [product, selections]);

  const variantId = useMemo(() => {
    // Check if all options are selected
    if (Object.keys(selections).length !== product.options.length) {
      return null;
    }

    // Find the variant reasoning:
    // We can rely on basic finding because the options derivation handles the "existence" check logic
    // But we need to verify the specific combination exists and is available.
    
    // Convert selections object to array matching variant structure for easier comparison could be one way,
    // but simpler to just search.
    const matchedVariant = product.variants.nodes.find((variant) => {
      // 1. Must match all selections
      const matchesAll = variant.selectedOptions.every((opt) => {
        return selections[opt.name] === opt.value;
      });
      if (!matchesAll) return false;

      // 2. Must check equality of option counts to avoid partial matches (though unlikely with proper structure)
      // (The helper type ensures variants have selectedOptions)
      return true;
    });

    return matchedVariant && matchedVariant.availableForSale
      ? matchedVariant.id
      : null;
  }, [product, selections]);

  function selectOption(name: string, value: string) {
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      
      // Clear dependent options (those that come after the modified option)
      const optionIndex = product.options.findIndex((o) => o.name === name);
      if (optionIndex !== -1) {
        for (let i = optionIndex + 1; i < product.options.length; i++) {
          delete next[product.options[i].name];
        }
      }
      
      return next;
    });
  }

  return {
    variantId,
    options,
    selectOption,
  };
}