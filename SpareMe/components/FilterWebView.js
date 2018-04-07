'use strict';
import React from 'react';
import { StyleSheet, WebView, TouchableOpacity, Icon, View, Image, Text } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFlagButton: false,
            showUnflagButton: false
        }
        this.postMessage = this.postMessage.bind(this);
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

                this.setState({
                    showFlagButton: !isHiddenElement
                });

                break;

            case 'selectionEnded':
                console.log("selection ended");
                this.setState({
                    showFlagButton: false
                })

                break;

            case 'elementRevealed':
                console.log('elementRevealed');
                this.setState({
                    showFlagButton: false,
                    showUnflagButton: true
                })

                break;

            default:
                /* Message contains either no known messageType or the message
                is not a JSON object. */
        }
    }

    onFlagButtonPress() {
        this.postMessage({
            name: 'selectionFlagged'
        });

        this.setState({
            showFlagButton: false,
            showUnflagButton: false
        })
    }

    onUnflagButtonPress() {
        this.postMessage({
            name: 'selectionUnflagged'
        });

        this.setState({
            showFlagButton: false,
            showUnflagButton: false
        });
    }

    removeFullscreen = () => {
        this.postMessage({
            name: 'unflagIgnored'
        });
        this.setState({showUnflagButton: false});
    }

    navChangeHandler = (webState) => {
        this.props.navChangeHandler(webState);
        if (!webState.url.includes('react-js-navigation://postMessage')) {
            this.setState({
                showFlagButton: false,
                showUnflagButton: false
            });
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

    render() {
        return (
            <View style={styles.web}>
                <WebView
                    {...this.props}
                    ref='webView'
                    injectedJavaScript={injectedJS}
                    onNavigationStateChange={this.navChangeHandler}
                    onMessage={e => this.onMessage(e.nativeEvent.data)}/>
                {this.state.showUnflagButton ? (<TouchableOpacity style={styles.fullscreen} onPress={this.removeFullscreen} />) : null}
                {this.state.showFlagButton ? (
                    <TouchableOpacity style={styles.flagButton} onPress={() => this.onFlagButtonPress()}>
                        <Image source={require('./invisible.png')} style={styles.image}/>
                        <Text style={styles.flagButtonText}>Flag</Text>
                    </TouchableOpacity>
                ) : (this.state.showUnflagButton ? (
                    <TouchableOpacity style={styles.flagButton} onPress={() => this.onUnflagButtonPress()}>
                        <Image source={require('./visible.png')} style={styles.image}/>
                        <Text style={styles.flagButtonText}>Unflag</Text>
                    </TouchableOpacity>
                ) : null)   }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    flagButton: {
        backgroundColor: constants.COLOR_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        height: 74,
        width: 74,
        borderRadius: 37,
        bottom: 20,
        right: 20,
        zIndex: 3,
        position: 'absolute'
    },
    flagButtonText: {
        color: 'white',
        fontSize: 15
    },
    image: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    web: {
        flex: 1,
        backgroundColor: '#fff'
    },
    fullscreen: {
        height: '100%',
        width: '100%',
        zIndex: 2,
        position: 'absolute'
    }
});
