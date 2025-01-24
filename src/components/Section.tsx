import "./Section.css";

import { ReactNode } from "react";

export const Section = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => (
  <div className="Section">
    <h1>{name}</h1>
    <div>{children}</div>
  </div>
);
