'use strict';
import React, {Component} from 'react';
import {Dimensions, StyleSheet, View, Platform, StatusBar} from 'react-native';
import * as constants from 'constants';

const dims = Dimensions.get('window');
const { height } = dims; /* device height */

const isIphoneX = () => {
    return height === constants.IPHONE_X_HEIGHT;
}

const statusBarHeight = Platform.OS === 'ios' ? (isIphoneX() ?  height / 25 : 20)
    : /* Android */ StatusBar.currentHeight;

class CustomStatusBar extends Component {
    render() {
        return (
            <MyStatusBar backgroundColor={constants.COLOR_MAIN} barStyle='light-content'/>
        );
    }
}

const MyStatusBar = ({backgroundColor, ...props}) => (
      <View style={[styles.statusBar, {backgroundColor}]}>
            <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </View>
);

const styles = StyleSheet.create({
    statusBar: {
        height: statusBarHeight
    }
});

export default CustomStatusBar;
