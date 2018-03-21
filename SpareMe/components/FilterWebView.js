'use strict';
import React from 'react';
import { StyleSheet, WebView } from 'react-native';
import * as api from 'ml-api'

/**
 * Self-executing function to inject into the WebView
 */
const injectedFunction = `(${String(function() {
    const INJECTED_CLASSNAME = "SpareMeElement";
    var injectedClassCounter = 0;

    // Handle messages from React
    document.addEventListener("message", function(data) {
        let action = JSON.parse(data.data);
        let name = action['name'];
        let className = action['className'];

        if (name === 'hide') {
            let elementToHide = document.getElementsByClassName(className)[0];
            elementToHide.style.color = 'transparent';
            elementToHide.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
        }
    });

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
            // Add unique class so we can find this element later
            let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
            injectedClassCounter += 1;
            paragraphs[i].classList.add(addedClass);

            // Send innerText to React
            window.postMessage(JSON.stringify({
                messageType: 'predict',
                content : String(paragraphs[i].innerText),
                addedClass: addedClass
            }));
    }
})})();` // JavaScript :)

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
                api.getCategoryForString(innerText,
                    (category) => {
                        if (category === 'hateful') { // TODO use a constants class
                            console.log('hiding: ' + innerText);
                            this.postMessage({
                                name: 'hide',
                                className: addedClass
                            });
                        } else {
                            console.log(innerText + ' is harmless');
                        }
                    })
                break;

            default:
                /* Message contains either no known messageType or the message
                is not a JSON object. */
        }
    }

    apiCallback(category) {
        console.log(category);
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
