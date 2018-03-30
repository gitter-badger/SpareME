'use strict';
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput, NetInfo } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import FilterWebView from '../components/FilterWebView'
import firebase from 'react-native-firebase';
import * as constants from 'constants'

export default class CreateAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        NetInfo.isConnected.fetch().then(isConnected => {
            console.log(isConnected);
            this.setState({isConnected: isConnected});
        });
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.onConnectivityChange);
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.onConnectivityChange);
    }

    onConnectivityChange = isConnected => {
        this.setState({isConnected: isConnected});
    }

    onRegister = () => {
        const { email, password } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          this.props.navigation.goBack();
            // If you need to do anything with the user, do it here
            // The user will be logged in automatically by the
            // `onAuthStateChanged` listener we set up in App.js earlier
        }).catch((error) => {
            const { code, message } = error;
            console.log(error);
            var alertMessage = 'Unable to create account.'
            if (message.includes('email address')) {
                alertMessage = constants.INVALID_EMAIL;
            }
            else if (message.includes('The given password')) {
                alertMessage = constants.INVALID_PASSWORD;
            }
            Alert.alert(
              'Create Account Failed',
              alertMessage,
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              { cancelable: false }
            )
        });
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
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <View style={styles.createView}>
                    <Text style={styles.createText}>
                        Create An Account
                    </Text>
                    <Text style={styles.headerText}>
                        Email:
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Email"
                        underlineColorAndroid={constants.COLOR_WHITE}
                        autoCapitalize='none'
                        autoCorrect={false}
                        selectionColor={constants.COLOR_GRAY}
                        onChangeText={ (text) => {
                            this.setState({
                                email: text
                            });
                        }}
                    />
                    <Text style={styles.headerText}>
                        Password:
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Password"
                        underlineColorAndroid={constants.COLOR_WHITE}
                        autoCapitalize='none'
                        autoCorrect={false}
                        secureTextEntry={true}
                        selectionColor={constants.COLOR_GRAY}
                        onChangeText={ (text) => {
                            this.setState({
                                password: text
                            });
                        }}
                    />

                    <View style={styles.buttonContainer}>
                        <View style={styles.leftButton}>
                            <Button
                                title='Create Account'
                                onPress={this.onRegister}
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                title='Cancel'
                                onPress={() => this.props.navigation.goBack()}
                                color='red'
                            />
                        </View>
                    </View>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    createView: {
        padding: 50,
        flex: 1,
        backgroundColor: constants.COLOR_MAIN,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    leftButton: {
        flex: 1,
        height: 40,
        marginRight: 10
    },
    button: {
        flex: 1,
        height: 40
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
    createText: {
        color: constants.COLOR_WHITE,
        fontSize: 32,
        marginBottom: 20
    },
    headerText: {
        color: constants.COLOR_WHITE,
        fontSize: 24,
        marginBottom: 5
    },
    input: {
        height: 20,
        alignSelf: 'stretch',
        fontSize: 16,
        marginBottom: 10,
        color: constants.COLOR_WHITE
    }
});
