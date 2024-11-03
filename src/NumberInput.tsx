import { useState } from "react";

import { InputProps } from "./types";

export const NumberInput = ({ value, onChange }: InputProps<number>) => {
  const [valueStr, setValueStr] = useState(`${value}`);

  return (
    <input
      type="number"
      value={valueStr}
      onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
        setValueStr(evt.target.value);
        const value = parseInt(evt.target.value);
        if (isNaN(value)) return;
        onChange(value);
      }}
    />
  );
};
