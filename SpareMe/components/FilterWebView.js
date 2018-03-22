'use strict';
import React from 'react';
import { StyleSheet, WebView } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'

/**
 * Self-executing function to inject into the WebView
 */
const injectedFunction = `(${String(function() {
    const INJECTED_CLASSNAME = "SpareMeElement";
    const HTML_TEXT_ELEMENTS  = ['p', 'a', 'li', 'img'];
    var injectedClassCounter = 0;

    // Handle messages from React
    document.addEventListener("message", function(data) {
        let action = JSON.parse(data.data);
        let name = action['name'];
        let className = action['className'];

        if (name === 'hide') {
            let elementToHide = document.getElementsByClassName(className)[0];
            elementToHide.style.filter = 'blur(10px)';
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

    // Send tags to React
    for (let htmlElementName of HTML_TEXT_ELEMENTS) {
        var elements = document.getElementsByTagName(htmlElementName);
        for (var i = 0; i < elements.length; i++) {
            // Add unique class so we can find this element later
            let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
            injectedClassCounter += 1;
            elements[i].classList.add(addedClass);

            // Send innerText to React
            window.postMessage(JSON.stringify({
                messageType: 'predict',
                content : String(htmlElementName === 'img' ?  elements[i].alt : elements[i].innerText),
                addedClass: addedClass
            }));
        }
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
