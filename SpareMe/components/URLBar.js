'use strict';
import React, { Component } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Platform, View } from 'react-native';
import * as constants from 'constants';
import firebase from 'react-native-firebase';

class URLBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            canGoBack: false,
            canGoForward: false,
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

    onLayout = (e) => {
        this.bottomBarY = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
    }

    getBottomYPosition() {
        return this.bottomBarY;
    }

    render() {
        const {backHandler, forwardHandler, refreshHandler, onChangeHandler, onMenuPressed, url} = this.props;
          return (
              <View style={[styles.bar, {marginLeft: -BAR_HORIZONTAL_PADDING}]} onLayout={this.onLayout}>
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
                      style={[styles.barButton, {marginRight: -BAR_HORIZONTAL_PADDING}]}
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
                      style={[styles.barButton, {marginLeft: -BAR_HORIZONTAL_PADDING}]}
                      onPress={ () => {
                          refreshHandler();
                      }
                  }>
                      <Image source={require('./refresh.png')} style={styles.refresh}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={[styles.barButton, {marginRight: -BAR_HORIZONTAL_PADDING}]}
                      onPress={onMenuPressed}
                  >
                      <Image source={require('./menu.png')} style={styles.refresh}/>
                  </TouchableOpacity>
              </View>
          );
    }
}

const BAR_HORIZONTAL_PADDING = 5;

const styles = StyleSheet.create({
    arrow: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    bar: {
        flexDirection: 'row',
        paddingHorizontal: BAR_HORIZONTAL_PADDING,
        paddingVertical: 10,
        backgroundColor: constants.COLOR_MAIN,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    barButton: {
        marginVertical: -15,
        height: 55,
        width: 35,
        backgroundColor: constants.COLOR_MAIN,
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 35,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginHorizontal: 5,
        backgroundColor: constants.COLOR_WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        fontSize: constants.TEXT_SMALL
    }
});

export default URLBar;
