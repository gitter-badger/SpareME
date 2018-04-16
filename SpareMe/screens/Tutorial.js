'use strict';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, NetInfo, TouchableOpacity } from 'react-native';
import Connectivity from '../components/Connectivity'
import CustomStatusBar from '../components/CustomStatusBar'
import * as constants from 'constants'

export default class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstPage: true,
            layout: {
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height
            }
        };
        NetInfo.isConnected.fetch().then(isConnected => {
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
        if (isConnected) {
            this.setState({isConnected: isConnected});
        }
    }

    onScroll = (event) => {
        this.setState({
            firstPage: (event.nativeEvent.contentOffset.x < this.state.layout.width/2)
        });
    }

    onLayout = (event) => {
        this.setState({
            layout:{
                height: event.nativeEvent.layout.height,
                width: event.nativeEvent.layout.width,
            }
        });
    }

    donePressed = () => {
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.fromCreate) {
                this.props.navigation.navigate('Home');
            }
            else {
                this.props.navigation.goBack();
            }
        }
        else {
            this.props.navigation.goBack();
        }
    }

    render() {
        if (!this.state.isConnected) {
            return(
                <Connectivity />
            );
        }
        return (
            <View style={styles.container} onLayout={this.onLayout}>
                <CustomStatusBar />
                <ScrollView
                    ref='scrollView'
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={this.onScroll}
                    scrollEventThrottle={16}
                >
                    <View style={[styles.pageContainer, {height: this.state.layout.height, width: this.state.layout.width}]}>
                        <Text style={styles.progressText}>{"1. Highlight and flag the content that you don't want to see."}</Text>
                    </View>
                    <View style={[styles.pageContainer, {height: this.state.layout.height, width: this.state.layout.width}]}>
                        <Text style={styles.progressText}>2. Choose the category</Text>
                        <TouchableOpacity
                            onPress={this.donePressed}
                        >
                            <Text style={styles.progressText}>Done</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
                <View style={[styles.progressContainer, {width: this.state.layout.width}]}>
                    <Text style={styles.progressText}>Swipe to Continue</Text>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.COLOR_MAIN
    },
    pageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        height: 65,
        alignItems: 'center',
        zIndex: 2,
        position: 'absolute',
        bottom: 10
    },
    progressText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_SMALL
    },
    icon: {
        flex: 1,
        aspectRatio: 1,
        resizeMode: 'contain'
    }
});
