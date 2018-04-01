'use strict';
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import * as constants from 'constants';
import firebase from 'react-native-firebase';

class Menu extends Component {
    render() {
        const {menuHandler} = this.props;
        const user = firebase.auth().currentUser;
        console.log(user);
        const val1 = user == null ? constants.SIGN_IN : constants.SIGN_OUT;
        const val2 = user == null ? constants.CREATE_ACCOUNT : constants.SETTINGS;
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => menuHandler(val1)}
                >
                    <Text style={styles.menuText}>{user == null ? 'Sign In' : 'Sign Out'}</Text>
                    {user == null ? null : <Text style={styles.menuText}>{'(' + user._user.email + ')'}</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => menuHandler(val2)}
                >
                    <Text style={styles.menuText}>{user == null ? 'Create Account' : 'Settings'}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 5,
        paddingVertical: 2.5,
        justifyContent: 'space-between',
        alignItems: 'stretch'
    },
    menuButton: {
        flex: 1,
        marginVertical: 2.5,
        backgroundColor: constants.COLOR_SECONDARY,
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuText: {
        color: constants.COLOR_WHITE,
        fontSize: 24,
        margin: 5
    }
});

export default Menu;
