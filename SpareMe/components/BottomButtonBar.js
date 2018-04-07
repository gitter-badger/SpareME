'use strict';
import React from 'react';
import { StyleSheet, TouchableOpacity, Icon, View, Image, Text } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'

export default class ButtonButtonBar extends React.Component {
    constructor(props) {
        super(props);
        console.log("webview: " + props.webView);
        this.state = {
            showFlagButton: false,
            showUnflagButton: false,
            categories: ['hateful', 'harmless', 'awesome']
        }

        // TODO do this instead of setting categories above
        // api.getCategories(function(response) {
        //     this.setState({
        //         categories: response
        //     });
        // });
    }

    render() {
        return (
            <View style={styles.buttonBar}>
                { this.state.showFlagButton ?
                    (
                        <TouchableOpacity style={styles.flagButton} onPress={this.props.webView.onFlagButtonPress}>
                        <Image source={require('./invisible.png')} style={styles.image}/>
                        <Text style={styles.flagButtonText}>Flag</Text>
                        </TouchableOpacity>
                    ) :
                    ( this.state.showUnflagButton ?
                        (
                            <TouchableOpacity style={styles.flagButton} onPress={this.props.webView.onUnflagButtonPress}>
                            <Image source={require('./visible.png')} style={styles.image}/>
                            <Text style={styles.flagButtonText}>Unflag</Text>
                            </TouchableOpacity>
                        ) :
                            null)
                }
                { this.state.showCategories &&
                    <View style={styles.categoryWrapper}>
                        {
                            this.renderCategories()
                        }
                    </View>
                }
            </View>
        );
    }

    renderCategories() {
        var index = 0;
        return this.state.categories.map((item) => {
            return (
                <TouchableOpacity key={'category' + index++} style={styles.flagButton} onPress={this.props.webView.onUnflagButtonPress}>
                    <Image source={require('./visible.png')} style={styles.image}/>
                    <Text style={styles.flagButtonText}>{item}</Text>
                </TouchableOpacity>
            );
        });
    }
}

const styles = StyleSheet.create({
    buttonBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        bottom: 15,
        right: 15,
        position: 'absolute'
    },
    categoryWrapper: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    flagButton: {
        backgroundColor: constants.COLOR_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        height: 74,
        width: 74,
        borderRadius: 37,
        margin: 5,
        zIndex: 1
    },
    flagButtonText: {
        color: 'white',
        fontSize: 15
    },
    image: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    }
});
