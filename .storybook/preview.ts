import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f0f0f',
        },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => React.createElement(
      ThemeProvider,
      { attribute: "class", defaultTheme: "light", enableSystem: true },
      React.createElement(
        'div',
        { className: "min-h-screen bg-background text-foreground p-4" },
        React.createElement(Story)
      )
    ),
  ],
};

export default preview;