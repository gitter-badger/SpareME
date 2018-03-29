'use strict';
import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation'
import Home from './screens/Home'
import User from './screens/User'
import CreateAccount from './screens/CreateAccount'
import Settings from './screens/Settings'

export default class App extends Component {
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
            screen: User,
        },
        CreateAccount: {
            screen: CreateAccount,
        },
        Settings: {
            screen: Settings,
        },
    },
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    }
);
