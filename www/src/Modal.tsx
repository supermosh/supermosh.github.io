import React, { ReactNode } from 'react';

export default ({ children, onClose }: {children: ReactNode, onClose(): void}) => (
  <div className="Modal" onClick={() => { onClose(); }}>
    <div className="box">
      {children}
    </div>
  </div>
);
