console.log('🔥 AppEntry loaded, mounting App…');

import { registerRootComponent } from 'expo';
import { View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import { Provider as PaperProvider } from 'react-native-paper';
import App from './App';

if (!View.propTypes) {
  View.propTypes = ViewPropTypes;
}

function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}

registerRootComponent(Main);
