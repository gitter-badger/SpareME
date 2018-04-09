'use strict';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, NetInfo, Image, TouchableOpacity } from 'react-native';
import CreateAccount from './CreateAccount'
import SignIn from './SignIn'
import * as constants from 'constants'

const dims = Dimensions.get('window');
const { width, height } = dims;

export default class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {firstPage: true};
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

    navigateHome = () => {
        console.log(this)
        this.props.navigation.navigate('Home');
    }

    onScroll = (event) => {
        this.setState({
            firstPage: (event.nativeEvent.contentOffset.x < width/2)
        });
    }

    render() {
        if (!this.state.isConnected) {
            return(
                <View style={styles.container}>
                    <View style={styles.connectionContainer}>
                        <Text style={styles.connectionText}>Unable to connect. Please check your network settings.</Text>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <ScrollView
                    ref='scrollView'
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={this.onScroll}
                    scrollEventThrottle={16}
                >
                    <View style={styles.tabContainer}>
                        <SignIn isATab={true} navigateHome={this.navigateHome} />
                    </View>
                    <View style={styles.tabContainer}>
                        <CreateAccount isATab={true} navigateHome={this.navigateHome} />
                    </View>
                </ScrollView>
                <View style={styles.iconContainer}>
                    <TouchableOpacity
                        style={styles.iconButtom}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./account.png')} style={[styles.icon, this.state.firstPage ? null : styles.disabled]}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButtom}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: width, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./create.png')} style={[styles.icon, this.state.firstPage ? styles.disabled : null]}/>
                    </TouchableOpacity>
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
    tabContainer: {
        height: height,
        width: width
    },
    iconContainer: {
        height: 50,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 2,
        position: 'absolute',
        bottom: 10
    },
    iconButton: {
        height: 35,
        width: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        flex: 1,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    disabled: {
        tintColor: constants.COLOR_DISABLED
    }
});
