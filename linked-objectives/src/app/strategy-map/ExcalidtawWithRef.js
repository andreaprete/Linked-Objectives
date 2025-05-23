import React, { forwardRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

const ExcalidrawWithRef = forwardRef((props, ref) => (
  <Excalidraw ref={ref} {...props} />
));

ExcalidrawWithRef.displayName = "ExcalidrawWithRef";
export default ExcalidrawWithRef;
