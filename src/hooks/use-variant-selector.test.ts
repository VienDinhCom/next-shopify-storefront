import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVariantSelector } from "./use-variant-selector";

// Mock Product Data
const mockProduct = {
  options: [
    { name: "Color", values: ["Red", "Blue"] },
    { name: "Size", values: ["S", "M", "L"] },
  ],
  variants: {
    nodes: [
      {
        id: "var-1",
        availableForSale: true,
        selectedOptions: [
          { name: "Color", value: "Red" },
          { name: "Size", value: "S" },
        ],
      },
      {
        id: "var-2", // Red M - OOS
        availableForSale: false,
        selectedOptions: [
          { name: "Color", value: "Red" },
          { name: "Size", value: "M" },
        ],
      },
      // Red L doesn't exist
      {
        id: "var-3",
        availableForSale: true,
        selectedOptions: [
          { name: "Color", value: "Blue" },
          { name: "Size", value: "L" },
        ],
      },
    ],
  },
};

// Simple product with 1 option
const simpleProduct = {
    options: [{ name: "Material", values: ["Cotton", "Wool"] }],
    variants: {
        nodes: [
            {
                id: "v1",
                availableForSale: true,
                selectedOptions: [{ name: "Material", value: "Cotton" }]
            },
            {
                id: "v2",
                availableForSale: true,
                selectedOptions: [{ name: "Material", value: "Wool" }]
            }
        ]
    }
}

describe("useVariantSelector", () => {
  it("should initialize options correctly", () => {
    const { result } = renderHook(() => useVariantSelector(mockProduct));

    const options = result.current.options;
    expect(options).toHaveLength(2);

    expect(options[0].name).toBe("Color");
    expect(options[0].values).toHaveLength(2);
    // First option values should not be disabled initially ???
    // Looking at logic: disabled: optionIndex === 0 ? false : true
    // So option 0 is enabled, others disabled.
    expect(options[0].values[0].disabled).toBe(false); 
    expect(options[0].values[0].selected).toBe(false);

    expect(options[1].name).toBe("Size");
    // Dependent options should be disabled initially
    expect(options[1].values[0].disabled).toBe(true);
  });

  it("should select an option and enable next options based on availability", () => {
    const { result } = renderHook(() => useVariantSelector(mockProduct));

    act(() => {
      result.current.selectOption("Color", "Red");
    });

    const options = result.current.options;
    
    // Check Color is selected
    const redValue = options[0].values.find((v) => v.value === "Red");
    expect(redValue?.selected).toBe(true);

    // Check available sizes for Red
    // Red S is avai (var-1) -> Size S should be enabled
    // Red M is OOS (var-2) -> In this hook logic, does it filter OOS variants?
    // Let's check getAvailableValues logic usually it filters based on `variants` passed in.
    // The hook seems to use `product.variants.nodes.filter(...)` but doesn't explicitly check `availableForSale` inside `getAvailableValues`. 
    // Wait, getAvailableValues just checks if the combination exists in the variants list.
    // `matchedVariant` check at the end uses `availableForSale`.
    // Let's re-read `getAvailableValues`:
    // It filters `variants.nodes`. If the node exists, it returns the value.
    // DOES NOT seems to check `availableForSale` in `getAvailableValues`.
    
    // So if Red M exists (even if OOS), Size M should be enabled if the logic allows OOS to be selectable but resulting in null ID? 
    // OR maybe it should filter out OOS.
    // Re-reading code: `getAvailableValues` does NOT use `availableForSale`.
    
    // Size S should be enabled (exists)
    const sizeS = options[1].values.find((v) => v.value === "S");
    expect(sizeS?.disabled).toBe(false);

    // Size M (Red M exists) -> Should be enabled
    const sizeM = options[1].values.find((v) => v.value === "M");
    expect(sizeM?.disabled).toBe(false);

    // Size L (Red L does NOT exist) -> Should be disabled
    const sizeL = options[1].values.find((v) => v.value === "L");
    expect(sizeL?.disabled).toBe(true);
  });

  it("should determine variantId when all options selected", () => {
    const { result } = renderHook(() => useVariantSelector(mockProduct));

    act(() => {
      result.current.selectOption("Color", "Red");
    });
    
    act(() => {
        result.current.selectOption("Size", "S");
    })

    expect(result.current.variantId).toBe("var-1");
  });

  it("should not set variantId if selected variant is not available for sale", () => {
      const { result } = renderHook(() => useVariantSelector(mockProduct));

      act(() => {
          result.current.selectOption("Color", "Red");
      });
      
      act(() => {
          result.current.selectOption("Size", "M"); // var-2 is OOS
      });

      // matchedVariant logic: `variant.availableForSale && isEqual(...)`
      // So if not available, result is null/undefined -> newVariantId is null.
      expect(result.current.variantId).toBe(null);
  });

  it("should reset child options when parent option changes", () => {
    const { result } = renderHook(() => useVariantSelector(mockProduct));

    // Select Red -> S -> var-1
    act(() => {
        result.current.selectOption("Color", "Red");
    });
    act(() => {
        result.current.selectOption("Size", "S");
    });
    expect(result.current.variantId).toBe("var-1");

    // Change to Blue
    act(() => {
        result.current.selectOption("Color", "Blue");
    });

    const options = result.current.options;
    // Size should be reset
    const sizeS = options[1].values.find(v => v.value === "S");
    expect(sizeS?.selected).toBe(false); // Should be deselected
    
    expect(result.current.variantId).toBe(null);

    // Blue L is valid
    // Blue options: Only L exists in mock data?
    // Let's check logic availability again.
    // Blue -> S (doesn't exist), M (doesn't exist), L (exists).
    
    const sizeL = options[1].values.find(v => v.value === "L");
    expect(sizeL?.disabled).toBe(false);
  });
  
  it("should work single option product", () => {
      const { result } = renderHook(() => useVariantSelector(simpleProduct));
      
      expect(result.current.options[0].values[0].disabled).toBe(false);
      
      act(() => {
          result.current.selectOption("Material", "Cotton");
      });
      
      expect(result.current.variantId).toBe("v1");
  });
});