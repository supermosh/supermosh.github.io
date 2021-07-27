import React, { ReactNode } from 'react';

export default ({ children, onClose }: {children: ReactNode, onClose(): void}) => (
  <div className="Modal" onClick={() => { onClose(); }}>
    <div className="box" onClick={(evt) => evt.stopPropagation()}>
      {children}
    </div>
  </div>
);
