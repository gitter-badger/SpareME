'use strict';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomStatusBar from './CustomStatusBar'
import Loading from './Loading'
import * as constants from 'constants'

export default class Connectivity extends Component {
    render() {
        return(
            <View style={styles.container}>
                <CustomStatusBar/>
                <View style={styles.connectionContainer}>
                    <Text style={styles.connectionText}>Unable to connect. Please check your network settings.</Text>
                </View>
                <Loading hideBar={true} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    connectionContainer: {
        flex: 2,
        backgroundColor: constants.COLOR_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    connectionText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_LARGE
    }
});
