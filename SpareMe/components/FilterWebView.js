'use strict';
import React from 'react';
import { StyleSheet, WebView, TouchableOpacity, Icon, View, Image, Text } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'
import BottomButtonBar from './BottomButtonBar.js'

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props);
        this.postMessage = this.postMessage.bind(this);
        this.onFlagCategoryButtonPress = this.onFlagCategoryButtonPress.bind(this);
        this.onUnflagButtonPress = this.onUnflagButtonPress.bind(this);
        this.removeFullscreen = this.removeFullscreen.bind(this);

        this.state = {
            showFullscreenOpacity: false
        }
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    /**
    * Sends a message from React Native to the WebView
    */
    postMessage(action) {
        this.refs.webView.postMessage(JSON.stringify(action));
    }

    /**
    * Handles data passed from the WebView to React
    */
    onMessage(data) {
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (error) {
            console.log("Eror parsing JSON data from string '" + data + "''");
            return;
        }

        let messageType = jsonData['messageType'];

        console.log("got message type: " + messageType);

        switch(messageType) {
            case 'addTextToAPI':
                console.log("adding newly-flagged text to the API. category: " + jsonData['category'] + " text: " + jsonData['text']);
                let category = jsonData['category'];
                api.addTextToCategory(jsonData['text'], category ? category: 'hateful', // TODO let the user pick the category
                this.props.idToken);
                break;

            case 'predict':
                let predictionBatch = jsonData['content'];

                api.getCategoriesForBatch(predictionBatch, this.props.idToken,
                    (response) => {
                        try {
                            console.log('got response: ' + response);
                            let responseJSON = JSON.parse(response)
                            for (var key in responseJSON) {
                                if (!responseJSON.hasOwnProperty(key)) continue;

                                let category = responseJSON[key];
                                if (category === constants.HATEFUL) {
                                    console.log('hiding: ' + key);
                                    this.postMessage({
                                        name: 'hide',
                                        className: key
                                    });
                                } else {
                                    console.log(key + ' is in category: ' + category);
                                }
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    })
                    break;

            case 'selectionChanged':
                let selection = jsonData['content'];
                let isHiddenElement = jsonData['isHiddenElement'];
                console.log("selection changed to: " + selection);
                this.refs.buttonBar.setState({
                    showFlagButton: !isHiddenElement
                });

                break;

            case 'selectionEnded':
                console.log("selection ended");
                this.refs.buttonBar.setState({
                    showFlagButton: false
                })

                break;

            case 'elementRevealed':
                console.log('elementRevealed');
                this.refs.buttonBar.setState({
                    showFlagButton: false,
                    showUnflagButton: true
                });

                this.setState({
                    showFullscreenOpacity: true
                })


                break;

            default:
                /* Message contains either no known messageType or the message
                is not a JSON object. */
        }
    }

    refresh() {
        this.refs.webView.reload();
    }

    goBack() {
        this.refs.webView.goBack();
    }

    goForward() {
        this.refs.webView.goForward();
    }

    onFlagCategoryButtonPress(category) {
        this.postMessage({
            name: 'selectionFlagged',
            category: category
        });

        this.refs.buttonBar.setState({
            showCategories: false
        });
    }

    onUnflagButtonPress() {
        this.postMessage({
            name: 'selectionUnflagged'
        });

        this.refs.buttonBar.setState({
            showFlagButton: false,
            showUnflagButton: false
        });

        this.setState({
            showFullscreenOpacity: false
        });
    }

    removeFullscreen() {
        console.log('called removefullscreen;');
        console.log(this);
        this.postMessage({
            name: 'unflagIgnored'
        });
        this.refs.buttonBar.setState({showUnflagButton: false});
        this.setState({showFullscreenOpacity: false});
    }

    navChangeHandler = (webState) => {
        this.props.navChangeHandler(webState);
        if (!webState.url.includes('react-js-navigation://postMessage')) {
            this.refs.buttonBar.setState({
                showFlagButton: false,
                showUnflagButton: false
            });

            this.setState({
                showFullscreenOpacity: false
            })
        }
    }

    render() {
        return (
            <View style={styles.web}>
                <WebView
                    {...this.props}
                    ref='webView'
                    injectedJavaScript={injectedJS}
                    onNavigationStateChange={this.navChangeHandler}
                    onMessage={e => this.onMessage(e.nativeEvent.data)}/>
                    { this.state.showFullscreenOpacity ?
                        (<TouchableOpacity style={styles.fullscreen} onPress={this.removeFullscreen} />) : null
                    }

                <BottomButtonBar ref="buttonBar" webView={this} style={{zIndex: 2}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    web: {
        flex: 1,
        backgroundColor: '#fff'
    },
    fullscreen: {
        height: '100%',
        width: '100%',
        position: 'absolute'
    }
});
