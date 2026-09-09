/**
 * @format
 */

import { registerGlobals } from '@livekit/react-native';
import { AppRegistry } from 'react-native';
import App from './App';

registerGlobals();
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
