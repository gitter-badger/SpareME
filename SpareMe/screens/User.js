'use strict';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import FilterWebView from '../components/FilterWebView'
import firebase from 'react-native-firebase';

export default class User extends Component {
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
            <View style={styles.container}>
                <CustomStatusBar/>
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
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
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
