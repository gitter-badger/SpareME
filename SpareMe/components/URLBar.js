'use strict';
import React, { Component } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Platform, View } from 'react-native';
import * as constants from 'constants';
import {MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger} from 'react-native-popup-menu'

class URLBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            canGoBack: false,
            canGoForward: false
        };
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    update(webState) {
        // Don't update state when the window sends a message to React
        if (webState.url.includes(constants.POST_MESSAGE)) {
            return;
        }

        this.refs.textInput.blur();
        this.setState({
            url: webState.url,
            canGoBack: webState.canGoBack,
            canGoForward: webState.canGoForward
        });
    }

    formattedURL() {
        let text = this.state.url.toLowerCase();
        if (text.includes(' ')) {
            return constants.GOOGLE_SEARCH + text.replace(' ', '+');
        }
        else if (!text.includes('.')) {
            return constants.GOOGLE_SEARCH + text;
        }
        else {
            if (!text.startsWith('https://') && !text.startsWith('http://')) {
                text = 'http://' + text;
            }
            return text;
        }
    }

    render() {
        const {backHandler, forwardHandler, refreshHandler, onChangeHandler, menuHandler, url} = this.props;
        return (
            <View style={styles.bar}>
                <TouchableOpacity
                    disabled={!this.state.canGoBack}
                    style={styles.barButton}
                    onPress={ () => {
                        backHandler();
                    }
                }>
                    <Image source={require('./back.png')} style={[styles.arrow, !this.state.canGoBack ? styles.disabled : null]}/>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={!this.state.canGoForward}
                    style={styles.barButton}
                    onPress={ () => {
                        forwardHandler();
                    }
                }>
                    <Image source={require('./forward.png')} style={[styles.arrow, !this.state.canGoForward ? styles.disabled : null]}/>
                </TouchableOpacity>
                <TextInput
                    ref='textInput'
                    style={styles.url}
                    selectTextOnFocus={true}
                    onChangeText={ (text) => {
                        this.setState({
                            url: text
                        });
                    }}
                    onSubmitEditing={ () => {
                        onChangeHandler(this.formattedURL());
                    }}
                    value={this.state.url}
                    editable={true}
                    autoCorrect={false}
                    autoCapitalize='none'
                    returnKeyType='go'
                    underlineColorAndroid='transparent'
                    keyboardType={Platform.OS === 'ios' ? 'web-search' : 'default'}
                />
                <TouchableOpacity
                    style={styles.barButton}
                    onPress={ () => {
                        refreshHandler();
                    }
                }>
                    <Image source={require('./refresh.png')} style={styles.refresh}/>
                </TouchableOpacity>

                <Menu onSelect = {value => menuHandler(value)}>
                  <MenuTrigger>
                    <Image source={require('./menu.png')} style={styles.refresh}/>
                  </MenuTrigger>
                  <MenuOptions>
                      <MenuOption value={1} text='SignIn' />
                      <MenuOption value={2} text='Flag Content' />
                      <MenuOption value={3} text='Settings' />
                  </MenuOptions>
                </Menu>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    arrow: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    bar: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingVertical: 10,
        backgroundColor: constants.COLOR_MAIN,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    barButton: {
        height: 30,
        width: 30,
        backgroundColor: constants.COLOR_MAIN,
        alignItems: 'center',
        justifyContent: 'center'
    },
    disabled: {
        tintColor: constants.COLOR_DISABLED
    },
    refresh: {
        height: 25,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    url: {
        height: 30,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginHorizontal: 5,
        backgroundColor: constants.COLOR_WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        fontSize: 14
    }
});

export default URLBar;
