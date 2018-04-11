'use strict';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, NetInfo, Image, TouchableOpacity } from 'react-native';
import CreateAccount from './CreateAccount'
import SignIn from './SignIn'
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

    navigateHome = () => {
        this.props.navigation.navigate('Home');
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
            <View style={styles.container} onLayout={this.onLayout}>
                <ScrollView
                    ref='scrollView'
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={this.onScroll}
                    scrollEventThrottle={16}
                >
                    <View style={{height: this.state.layout.height, width: this.state.layout.width}}>
                        <SignIn isATab={true} navigateHome={this.navigateHome} />
                    </View>
                    <View style={{height: this.state.layout.height, width: this.state.layout.width}}>
                        <CreateAccount isATab={true} navigateHome={this.navigateHome} />
                    </View>
                </ScrollView>
                <View style={[styles.iconContainer, {width: this.state.layout.width}]}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./account.png')} style={[styles.icon, this.state.firstPage ? null : styles.disabled]}/>
                        <Text style={styles.iconText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: this.state.layout.width, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./create.png')} style={[styles.icon, this.state.firstPage ? styles.disabled : null]}/>
                        <Text style={styles.iconText}>Create Account</Text>
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
        fontSize: constants.TEXT_LARGE
    },
    iconContainer: {
        height: 65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 2,
        position: 'absolute',
        bottom: 10
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_SMALL
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
