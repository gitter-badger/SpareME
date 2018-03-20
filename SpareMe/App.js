'use strict';
import React, { Component } from 'react';
import { StyleSheet, WebView, Text, ActivityIndicator, View } from 'react-native';
import CustomStatusBar from './components/CustomStatusBar'
import URLBar from './components/URLBar'
import * as api from 'ml-api'
import FilterWebView from './components/FilterWebView'

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {url: 'https://google.com/'};
    }

    textChangeHandler = (text) => {
        this.setState({url: text});
    }

    navChangeHandler = (webState) => {
        this.urlBar.update(webState.url);
    }

    onWindowMessage(data) {
        console.log(data);
    }

    refresh = () => {
        this.webView.refresh();
    }

    webErrorHandler = (e) => {
        console.log(e.nativeEvent.code);
        const text = 'https://www.google.com/search?q=' + this.state.url.replace('https://', 'http://').replace('http://', '');
        this.setState({url: text});
    }

    renderError = () => {
        return(
            <View style={styles.activityView}>
                <ActivityIndicator
                    animating={true}
                    color='#84888d'
                    size='large'
                    hidesWhenStopped={true}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    refreshHandler={this.refresh}
                    onChangeHandler={this.textChangeHandler}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}
                />
                <FilterWebView
                    source={{uri: this.state.url}}
                    javaScriptEnabledAndroid={true}
                    onNavigationStateChange={this.navChangeHandler}
                    onError={this.webErrorHandler}
                    renderError={this.renderError}
                    onRef={ref => (this.webView = ref)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    activityView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    }
});
