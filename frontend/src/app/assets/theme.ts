import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0707e2',
      contrastText: 'white',
    },
  },
  typography: {
    fontFamily: 'Jost, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents automatic uppercase
        },
      },
    },
  },
});

export default theme;
