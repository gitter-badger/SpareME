'use strict';
import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View, Button, NetInfo, Text, TouchableOpacity } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import URLBar from '../components/URLBar'
import Menu from '../components/Menu'
import * as api from 'ml-api'
import * as constants from 'constants'
import FilterWebView from '../components/FilterWebView'
import firebase from 'react-native-firebase';


export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: 'https://www.google.com/',
            loading: true,
            menu: false
        };
        NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({isConnected: isConnected});
        });
    }

    /**
    * When the App component mounts, we listen for any authentication
    * state changes in Firebase.
    * Once subscribed, the 'user' parameter will either be null
    * (logged out) or an Object (logged in)
    */
    componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.onConnectivityChange);
        var self = this;
        this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
            console.log(user);
            if (user) {
                console.log(user.email + ' user authenticated');
                user.getIdToken(/* forceRefresh */ true)
                .then(function(result) {
                    console.log('got idToken: ' + result);
                    self.setState({
                        idToken: result,
                        user: user,
                        loading: false
                    });
                })
                .catch(function(error) {
                    console.log('authentication error: ' + error);
                });
            }
            else {
                self.setState({
                    loading: false,
                    user: null,
                });
                this.props.navigation.navigate('Tabs');
            }
        });
    }

    /**
     * Don't forget to stop listening for authentication state changes
     * when the component unmounts.
     */
    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.onConnectivityChange);
        this.authSubscription();
    }

    onConnectivityChange = isConnected => {
        if (isConnected) {
            this.setState({isConnected: isConnected});
        }
    }

    textChangeHandler = (text) => {
        NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({
                isConnected: isConnected,
                url: text
            });
        });
    }

    navChangeHandler = (webState) => {
        this.urlBar.update(webState);
        NetInfo.isConnected.fetch().then(isConnected => {
            if (!isConnected) {
                this.setState({
                    isConnected: isConnected,
                    url: webState.url,
                });
            }
        });
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
        const text = constants.GOOGLE_SEARCH + this.state.url.replace('https://', 'http://').replace('http://', '');
        this.setState({url: text});
    }

    menuHandler = (value) => {
        switch(value) {
          case constants.SIGN_IN: //Sign In
            this.props.navigation.navigate('SignIn');
            break;
          case constants.SIGN_OUT: //Sign Out
            console.log('User Logged Out');
            firebase.auth().signOut();
            break;
          case constants.CREATE_ACCOUNT: // Create Account
          this.props.navigation.navigate('CreateAccount');
            break;
          case constants.SETTINGS: // Settings
          this.props.navigation.navigate('Settings');
            break;
          default:
            break;
        }
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

    addFullscreen = () => {
        this.setState({
           menu: true,
           bottomBarY: this.urlBar.getBottomYPosition()
        });

    }

    removeFullscreen = () => {
        this.setState({menu: false});
    }

    render() {
        if (!this.state.isConnected) {
            return(
                <View style={styles.container}>
                    <CustomStatusBar/>
                    <View style={styles.connectionContainer}>
                        <Text style={styles.connectionText}>Unable to connect. Please check your network settings.</Text>
                    </View>
                </View>
            );
        }
        // The application is initialising
        if (this.state.loading) {
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
        // The user is an Object, so they're logged in
        // if (this.state.user) return <LoggedIn />;
        // The user is null, so they're logged out
        // return <LoggedOut />;
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    backHandler={this.backHandler}
                    forwardHandler={this.forwardHandler}
                    refreshHandler={this.refresh}
                    onChangeHandler={this.textChangeHandler}
                    onMenuPressed={this.addFullscreen}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}/>
                <FilterWebView
                    source={{uri: this.state.url}}
                    idToken={this.state.idToken}
                    javaScriptEnabledAndroid={true}
                    navChangeHandler={this.navChangeHandler}
                    onError={this.webErrorHandler}
                    renderError={this.renderError}
                    onRef={ref => (this.webView = ref)}/>
                {this.state.menu ? (<TouchableOpacity style={styles.fullscreen} onPress={this.removeFullscreen} />) : null}
                {this.state.menu ? (
                    <View style={[styles.menu, {top: this.state.bottomBarY}]}>
                        <Menu menuHandler={this.menuHandler} />
                    </View>) : null}
            </View>
        );
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
    connectionContainer: {
        flex: 1,
        backgroundColor: constants.COLOR_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    connectionText: {
        color: constants.COLOR_WHITE,
        fontSize: 24
    },
    fullscreen: {
        height: '100%',
        width: '100%',
        zIndex: 5,
        position: 'absolute',
        backgroundColor: '#77777777'
    },
    menu: {
        width: '75%',
        // height: '50%',
        right: 0,
        zIndex: 10,
        position: 'absolute'
    }
});
