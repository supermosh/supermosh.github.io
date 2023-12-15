import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import type { InputProps } from "../studio/types";

const Input = styled.input``;

export const NumberInput = ({
  value,
  onChange,
  ...props
}: InputProps<number> &
  Omit<
    Parameters<typeof Input>[0],
    "type" | "value" | "onChange" | "onBlur"
  >) => {
  const [nativeValue, setNativeValue] = useState(`${value}`);

  useEffect(() => {
    setNativeValue(`${value}`);
  }, [value]);

  return (
    <input
      type="number"
      value={nativeValue}
      onChange={(evt) => {
        setNativeValue(evt.target.value);
        if (!isNaN(evt.target.valueAsNumber))
          onChange(evt.target.valueAsNumber);
      }}
      onBlur={(evt) => {
        evt.target.reportValidity();
      }}
      {...props}
    />
  );
};
