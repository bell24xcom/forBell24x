import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from '../client/src/theme';
import { CssBaseline } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

// Import global styles
import '../client/src/styles/globals.css';

const customViewports = {
  mobileSmall: {
    name: 'Small Mobile',
    styles: {
      width: '360px',
      height: '640px',
    },
  },
  mobileLarge: {
    name: 'Large Mobile',
    styles: {
      width: '414px',
      height: '896px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1440px',
      height: '900px',
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
  viewport: {
    viewports: {
      ...INITIAL_VIEWPORTS,
      ...customViewports,
    },
  },
  layout: 'fullscreen',
  options: {
    storySort: {
      order: [
        'Introduction',
        'Documentation',
        'Components',
        ['Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'],
      ],
    },
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
      ],
    },
  },
};

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      light: theme,
    },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  (Story) => (
    <EmotionThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    </EmotionThemeProvider>
  ),
];

// Global parameters
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
      showName: true,
    },
  },
};
