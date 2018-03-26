'use strict';
import React from 'react';
import { StyleSheet, WebView } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props);
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
        let messageType = data['messageType'];
        let addedClass = data['addedClass'];
        let innerText = data['content'];

        switch(messageType) {
            case 'predict':
                api.getCategoryForString(innerText, this.props.idToken,
                    (category) => {
                        if (category === constants.HATEFUL) {
                            console.log('hiding: ' + innerText);
                            this.postMessage({
                                name: 'hide',
                                className: addedClass
                            });
                        } else {
                            console.log(innerText + ' is in category: ' + category);
                        }
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

    render() {
        return (
            <WebView
                {...this.props}
                ref='webView'
                injectedJavaScript={injectedJS}
                style = {styles.web}
                onMessage={e => this.onMessage(JSON.parse(e.nativeEvent.data))}
            />
        )
    }
}

const styles = StyleSheet.create({
    web: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
