// src/theme.js
import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          background: { default: '#f6f7f9', paper: '#ffffff' },
          text: { primary: '#1e1e1e', secondary: '#6b6b6b', disabled: '#9a9a9a' },
          divider: 'rgba(0,0,0,0.06)',
        }
      : {
          background: { default: '#0d0e12', paper: '#16181d' },
          text: { primary: '#f2f2f2', secondary: '#a1a1a6', disabled: '#6b6b70' },
          divider: 'rgba(255,255,255,0.08)',
        }),
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: { fontWeight: 600, letterSpacing: '-0.02em' },
    body1: { letterSpacing: '-0.005em' },
    body2: { letterSpacing: '-0.005em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
    },
  },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode));

/* Helpers de sombra premium por modo */
export const premiumShadow = (mode) =>
  mode === 'light'
    ? '0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)'
    : '0 20px 35px -8px rgba(0,0,0,0.4), 0 8px 18px -6px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)';

export const premiumShadowHover = (mode) =>
  mode === 'light'
    ? '0 30px 50px -12px rgba(0,0,0,0.08), 0 12px 24px -8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)'
    : '0 30px 50px -12px rgba(0,0,0,0.55), 0 12px 24px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)';