'use strict';
import React from 'react';
import { StyleSheet, WebView } from 'react-native';
import * as api from 'ml-api'

/**
 * Self-executing function to inject into the WebView
 */
const injectedFunction = `(${String(function() {
    // Steal back any site's postMessage overrides 😏
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function(message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
    }
    patchedPostMessage.toString = function() {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
    }
    window.postMessage = patchedPostMessage;

    // Blur <p> pags and notify React Native onClick
    var paragraphs = document.getElementsByTagName('p');
    for (var i = 0; i < paragraphs.length; i++) {
        paragraphs[i].onclick = function () {
            window.postMessage(this);
            this.style.color = 'transparent';
            this.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
        }
    }
})})();`

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
        this.WebView.postMessage(JSON.stringify(action));
    }

    /**
     * Handles data passed from the webpage back to this WebView
     */
    onMessage(data) {
        console.log(api.getCategoryForHtmlElement(data))
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
                injectedJavaScript={injectedFunction}
                style = {styles.web}
                onMessage={e => this.onMessage(e.nativeEvent.data)}
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
