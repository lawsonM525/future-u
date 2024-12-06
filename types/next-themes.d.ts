declare module 'next-themes' {
  import * as React from 'react';

  export type ThemeProviderProps = {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    // Add other props as necessary
  };

  export class ThemeProvider extends React.Component<ThemeProviderProps> {}
}
