'use strict';
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput, NetInfo } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import FilterWebView from '../components/FilterWebView'
import Connectivity from '../components/Connectivity'
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
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete the account?',
          [
            {text: 'Delete', onPress: () => {
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
            }},
            {text: 'Cancel', onPress: () => console.log('cancelled')}
          ],
          { cancelable: false }
        )
    }

    render() {
        if (!this.state.isConnected) {
            return(
                <Connectivity />
            );
        }
        return (
            <View style={styles.container}>
                <View style={styles.settingsView}>
                    <Text style={styles.settingsText}>
                        Settings
                    </Text>
                    <View style={styles.buttonContainer}>
                        <View style={styles.leftButton}>
                            <Button
                                title='Delete Account'
                                onPress={this.onDelete}
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                title='Cancel'
                                color={'red'}
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
    settingsView: {
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
        fontSize: constants.TEXT_LARGE
    },
    settingsText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_HEADER,
        marginBottom: 20
    }
});
