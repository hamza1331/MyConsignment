/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import store from './store/index'
import bgMessaging from './bgMessaging';
import React from 'react'
import { Provider } from "react-redux";
const Root = ()=><Provider store={store}><App/></Provider>
AppRegistry.registerComponent(appName, () => Root);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
