'use strict';
import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation'
import Home from './screens/Home'
import SignIn from './screens/SignIn'
import CreateAccount from './screens/CreateAccount'
import Settings from './screens/Settings'
import Tabs from './screens/Tabs'
import SplashScreen from 'react-native-splash-screen';


export default class App extends Component {
  componentDidMount() {
    SplashScreen.hide();
  }
    render() {
        return <RootStack />;
    }
}

const RootStack = StackNavigator(
    {
        Home: {
            screen: Home,
        },
        SignIn: {
            screen: SignIn,
        },
        CreateAccount: {
            screen: CreateAccount,
        },
        Settings: {
            screen: Settings,
        },
        Tabs: {
            screen: Tabs
        }
    },
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    }
);
