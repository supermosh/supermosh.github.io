import { InputHTMLAttributes, useEffect, useState } from "react";

import { InputProps } from "./types";

export const NumberInput = ({
  value,
  onChange,
  ...nativeProps
}: InputProps<number> &
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "min" | "max" | "disabled" | "step" | "onBlur" | "onFocus"
  >) => {
  const [valueStr, setValueStr] = useState(`${value}`);

  useEffect(() => {
    if (`${value}` === valueStr) return;
    if (isNaN(parseFloat(valueStr))) return;
    setValueStr(`${value}`);
  }, [value, valueStr]);

  return (
    <input
      type="number"
      value={valueStr}
      onChange={(evt) => {
        setValueStr(evt.target.value);
        const value = parseInt(evt.target.value);
        if (isNaN(value)) return;
        onChange(value);
      }}
      {...nativeProps}
    />
  );
};
