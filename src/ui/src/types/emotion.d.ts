// emotion.d.ts
import '@emotion/react';
import type { SerializedStyles } from '@emotion/utils';

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    css?: SerializedStyles;
  }
}
