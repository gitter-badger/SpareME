'use strict';
import React, { Component } from 'react';
import { StyleSheet, WebView, Text, ActivityIndicator, View, Button, TextInput } from 'react-native';
import CustomStatusBar from './components/CustomStatusBar'
import URLBar from './components/URLBar'
import * as api from 'ml-api'
import * as constants from 'constants'
import FilterWebView from './components/FilterWebView'
import { StackNavigator } from 'react-navigation'
import firebase from 'react-native-firebase';

// Components to show on login/logout
// import LoggedIn from './LoggedIn';
// import LoggedOut from './LoggedOut';

class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: 'https://www.google.com/',
            loading: true,
        };
    }

    /**
    * When the App component mounts, we listen for any authentication
    * state changes in Firebase.
    * Once subscribed, the 'user' parameter will either be null
    * (logged out) or an Object (logged in)
    */
    componentDidMount() {
        var self = this;
        this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log(user.email + ' user authenticated');
                user.getIdToken(/* forceRefresh */ true)
                .then(function(result) {
                    console.log('got idToken: ' + result);
                    self.setState({idToken: result});
                })
                .catch(function(error) {
                    console.log('authentication error: ' + error);
                });
            }
            self.setState({
                loading: false,
                user,
            });
        });
    }

    /**
     * Don't forget to stop listening for authentication state changes
     * when the component unmounts.
     */
    componentWillUnmount() {
      this.authSubscription();
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
        // The application is initialising
        if (this.state.loading) return null;
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
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}/>
                <FilterWebView
                    source={{uri: this.state.url}}
                    idToken={this.state.idToken}
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
    onLogin = () => {
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            // If you need to do anything with the user, do it here
            // The user will be logged in automatically by the
            // `onAuthStateChanged` listener we set up in App.js earlier
        }).catch((error) => {
            const { code, message } = error;
            // For details of error codes, see the docs
            // The message contains the default Firebase string
            // representation of the error
        });
    }

    onRegister = () => {
        const { email, password } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
            // If you need to do anything with the user, do it here
            // The user will be logged in automatically by the
            // `onAuthStateChanged` listener we set up in App.js earlier
        }).catch((error) => {
            const { code, message } = error;
            // For details of error codes, see the docs
            // The message contains the default Firebase string
            // representation of the error
        });
    }

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
                    placeholder="Enter Email"
                    onChangeText={ (text) => {
                        this.setState({
                            email: text
                        });
                    }}
                />
                <Text style={{fontSize: 20}}>
                    Password:
                </Text>
                <TextInput
                    style= {{width: 150}}
                    placeholder="Enter Password"
                    onChangeText={ (text) => {
                        this.setState({
                            password: text
                        });
                    }}
                />

                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button
                            title='Sign In'
                            onPress={this.onLogin}
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
