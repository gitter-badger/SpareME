'use strict';
import React from 'react';
import { StyleSheet, WebView, Button, TouchableOpacity, Icon, View } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFlagButton: false
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
                console.log("adding new text to the API!");
                api.addTextToCategory(jsonData['text'], jsonData['category'],
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
                    let selection = jsonData['content']
                    console.log("selection changed to: " + selection)

                    if (!this.state.showFlagButton) {
                        this.setState({
                            showFlagButton: true
                        })
                    }
                    break;

                case 'selectionEnded':
                    console.log("selection ended");

                    if (this.state.showFlagButton) {
                        this.setState({
                            showFlagButton: false
                        })
                    }

                break;

                default:
                /* Message contains either no known messageType or the message
                is not a JSON object. */
            }
        }

        onFlagButtonPress() {
            console.log("flag button pressed");
            this.postMessage({
                name: 'selectionFlagged'
            });
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
                        onMessage={e => this.onMessage(e.nativeEvent.data)}
                    />
                    <View
                        style={{display: this.state.showFlagButton ? 'flex' : 'none' }}>
                        <TouchableOpacity style={styles.flagButtonWrapper}>
                            <Button title="Flag" onPress={ () =>
                                this.onFlagButtonPress()} />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

const styles = StyleSheet.create({
    flagButtonWrapper: {
        borderWidth:1,
        borderColor:'rgba(0,0,0,0.2)',
        alignItems:'center',
        justifyContent:'center',
        width:100,
        height:100,
        backgroundColor:'#fff',
        borderRadius:100,
    },
    web: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
