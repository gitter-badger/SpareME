'use strict';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, NetInfo } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import FilterWebView from '../components/FilterWebView'
import firebase from 'react-native-firebase';
import * as constants from 'constants'

export default class Settings extends Component {
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

    onDelete = () => {

      if (firebase.auth().currentUser == null) {
        this.props.navigation.navigate('SignIn');
      } else {
        firebase.auth().currentUser.delete().then(function() {
        // User deleted
        }).catch(function(error) {
        // An error happened.
        });
        this.props.navigation.goBack();
      }
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
                <View style={styles.loginView}>
                    <Text style={{fontSize: 30}}>
                        Settings
                    </Text>
                    <View style={styles.buttonContainer}>
                        <View style={styles.button}>
                            <Button
                                title='Delete Account'
                                onPress={this.onDelete}
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
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    button: {
        width: '40%',
        height: 40,
        padding: 10
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
    }
});
