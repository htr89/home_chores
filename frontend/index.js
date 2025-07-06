console.log('🔥 AppEntry loaded, mounting App…');

import { registerRootComponent } from 'expo';
import { View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import App from './App';

if (!View.propTypes) {
  View.propTypes = ViewPropTypes;
}

registerRootComponent(App);
