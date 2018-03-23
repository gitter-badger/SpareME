'use strict';
import React, {Component} from 'react';
import {StyleSheet, View, Platform, StatusBar} from 'react-native';
import * as constants from 'constants';

const MyStatusBar = ({backgroundColor, ...props}) => (
      <View style={[styles.statusBar, {backgroundColor}]}>
            <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </View>
);

class CustomStatusBar extends Component {
    render() {
        return (
            <MyStatusBar backgroundColor={constants.COLOR_MAIN} barStyle='light-content'/>
        );
    }
}

const statusBarHeight = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const styles = StyleSheet.create({
    statusBar: {
        height: statusBarHeight
    }
});

export default CustomStatusBar;
