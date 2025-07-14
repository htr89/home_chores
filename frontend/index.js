console.log('🔥 AppEntry loaded, mounting App…');

import { registerRootComponent } from 'expo';
import { View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import App from './App';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000',
    secondary: '#555',
    background: '#fff',
    surface: '#fff',
    onSurface: '#000',
    onBackground: '#000',
  },
  roundness: 2,
};

if (!View.propTypes) {
  View.propTypes = ViewPropTypes;
}

function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

registerRootComponent(Main);
