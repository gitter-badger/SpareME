'use strict';
import React, { Component } from 'react';
import { StyleSheet, WebView, Text, View } from 'react-native';
import CustomStatusBar from './components/CustomStatusBar'
import URLBar from './components/URLBar'
import * as api from './network/ml-api'
import FilterWebView from './components/FilterWebView'

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {url: 'https://www.lipsum.com/'};
    }

    textChangeHandler = (text) => {
        this.setState({url: text});
    }

    navChangeHandler = (webState) => {
        this.urlBar.blur();
        this.setState({url: webState.url});
    }

    onWindowMessage(data) {
        console.log(data);
    }

    render() {
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    onChangeHandler={this.textChangeHandler}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}
                />
                <FilterWebView
                    source={{uri: this.state.url}}
                    // injectedJavaScript={injectedFunction}
                    javaScriptEnabledAndroid={true}
                    onNavigationStateChange={this.navChangeHandler}
                    // onMessage={this.onWindowMessage}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
