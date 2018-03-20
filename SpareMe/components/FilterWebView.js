'use strict';
import React from 'react';
import { StyleSheet, WebView } from 'react-native';

/**
 * Self-executing function to inject into the WebView
 */
const injectedFunction = `(${String(function() {
    // Blur <p> pags onClick
    var paragraphs = document.getElementsByTagName('p');
    for(var i = 0; i < paragraphs.length; i++)
    {
        paragraphs[i].onclick = function () {
            this.style.color = 'transparent';
            this.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
            window.postMessage(paragraphs[i].innerText);
        }
    }
})})();`

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <WebView
                {...this.props}
                injectedJavaScript={injectedFunction}
                style = {styles.web}
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
