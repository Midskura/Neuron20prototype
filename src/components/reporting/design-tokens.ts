// Reporting v2 Design Tokens - Updated Global Surface

export const colors = {
  // Primary Colors
  primary: {
    500: '#2563EB', // Primary Blue
  },
  
  // Semantic Colors - Updated
  success: {
    50: '#EAF7EF',
    100: '#DCF5E2',
    500: '#1F8F2E', // Success Green (updated)
    600: '#10A05B',
  },
  
  danger: {
    50: '#FDECEC',
    100: '#FDE5E5',
    500: '#D23B3B', // Danger Red (updated)
  },
  
  warning: {
    50: '#FFF5D6',
    100: '#FEF3C7',
    500: '#E0A100', // Warning Orange (updated)
  },
  
  chart: {
    blue: '#2E68F2', // Updated blue
  },
  
  // Ink (Grays) - Updated
  ink: {
    900: '#0F172A',
    700: '#334155',
    600: '#475569', // Added for body text
    500: '#64748B',
    300: '#CBD5E1',
    100: '#F1F5F9',
    50: '#F8FAFC',
  },
  
  // Surface - Updated
  surface: {
    white: '#FFFFFF',
    card: '#FFFFFF',
    page: '#FFFFFF', // Changed from gray to white
  },
  
  // Border - Updated
  border: {
    light: '#E6E8EB', // Updated border color
    subtle: '#EEF1F4', // For gridlines
    axis: '#D7DBE0', // For axes
  },
};

export const typography = {
  // Page title
  h3: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '28px',
  },
  
  // Section headings
  h4: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '24px',
    color: colors.ink[900],
  },
  
  // Card headers
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    letterSpacing: '0',
    color: colors.ink[700],
  },
  
  // KPI value
  kpi: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '32px',
  },
  
  // Body text
  body: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: colors.ink[600],
  },
  
  // Label styles
  label: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
  },
  
  // Meta/Caption styles
  meta: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
  },
};

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const layout = {
  contentMaxWidth: '1280px',
  borderRadius: {
    card: '12px', // Updated from 16px
    button: '10px',
    chip: '8px',
    input: '10px',
  },
  grid: {
    columns: 12,
    gutter: '24px',
    margin: '24px',
  },
};

export const effects = {
  // No shadows - all removed
  cardShadow: 'none',
  cardElevation: 'none',
};
