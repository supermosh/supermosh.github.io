import styled from "@emotion/styled";

export const Button = styled.button`
  font: inherit;
  border: 1px solid white;
  background-color: transparent;
  padding: 0.5em 1em;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &:disabled {
    color: white;
    opacity: 0.5;
  }
`;
