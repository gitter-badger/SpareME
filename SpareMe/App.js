'use strict';
import React, { Component } from 'react';
import { StyleSheet, WebView, Text, ActivityIndicator, View, Button, TextInput } from 'react-native';
import CustomStatusBar from './components/CustomStatusBar'
import URLBar from './components/URLBar'
import * as api from 'ml-api'
import * as constants from 'constants'
import FilterWebView from './components/FilterWebView'
import { StackNavigator } from 'react-navigation'

class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {url: 'https://www.google.com/'};
    }

    textChangeHandler = (text) => {
        this.setState({url: text});
    }

    navChangeHandler = (webState) => {
        this.urlBar.update(webState);
    }

    onWindowMessage(data) {
        console.log(data);
    }

    backHandler = () => {
        this.webView.goBack();
    }

    forwardHandler = () => {
        this.webView.goForward();
    }

    refresh = () => {
        this.webView.refresh();
    }

    webErrorHandler = (e) => {
        console.log(e.nativeEvent.code);
        const text = constants.GOOGLE_SEARCH + this.state.url.replace('https://', 'http://').replace('http://', '');
        this.setState({url: text});
    }

    renderError = () => {
        return(
            <View style={styles.activityView}>
                <ActivityIndicator
                    animating={true}
                    color='#84888d'
                    size='large'
                    hidesWhenStopped={true}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    backHandler={this.backHandler}
                    forwardHandler={this.forwardHandler}
                    refreshHandler={this.refresh}
                    onChangeHandler={this.textChangeHandler}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}/>
                <FilterWebView
                    source={{uri: this.state.url}}
                    javaScriptEnabledAndroid={true}
                    onNavigationStateChange={this.navChangeHandler}
                    onError={this.webErrorHandler}
                    renderError={this.renderError}
                    onRef={ref => (this.webView = ref)}/>
                <Button
                    title="Log In"
                    onPress={() => this.props.navigation.navigate('SignIn')}/>
            </View>
        );
    }
}

class SignInScreen extends Component {
    render() {
        return (
            <View style={styles.loginView}>
                <Text style={{fontSize: 30}}>
                    Sign In
                </Text>
                <Text style={{fontSize: 20, paddingTop: 20}}>
                    Username:
                </Text>
                <TextInput
                    style= {{width: 150}}
                    placeholder="Enter Username"
                />
                <Text style={{fontSize: 20}}>
                    Password:
                </Text>
                <TextInput
                    style= {{width: 150}}
                    placeholder="Enter Password"
                />

                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button
                            title='Sign In'
                            onPress={() => this.props.navigation.goBack()}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            title='Cancel'
                            backgroundColor={'red'}
                            onPress={() => this.props.navigation.goBack()}
                        />
                    </View>
                </View>
                
            </View>
            
        );
    }
}

const RootStack = StackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        SignIn: {
            screen: SignInScreen,
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

export default class App extends Component {
    render() {
        return <RootStack />;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    activityView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    loginView: {
        padding: 50,
        flex: 1
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        width: '40%',
        height: 40
    }
});
