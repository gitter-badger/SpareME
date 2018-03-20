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
<<<<<<< HEAD
        this.state = {url: 'https://google.com/'};
=======
        this.state = {url: 'https://www.google.com/'};
>>>>>>> Fix refresh button based on recent merge
    }

    textChangeHandler = (text) => {
        this.setState({url: text});
    }

    navChangeHandler = (webState) => {
        this.urlBar.update(webState);
    }

    onWindowMessage(data) {
        console.log(data);
    }

    backHandler = () => {
        this.webView.goBack();
    }

    forwardHandler = () => {
        this.webView.goForward();
    }

    refresh = () => {
        this.webView.refresh();
    }

<<<<<<< HEAD
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

=======
>>>>>>> Fix refresh button based on recent merge
    render() {
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    backHandler={this.backHandler}
                    forwardHandler={this.forwardHandler}
                    refreshHandler={this.refresh}
                    onChangeHandler={this.textChangeHandler}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}
                />
                <FilterWebView
                    source={{uri: this.state.url}}
                    javaScriptEnabledAndroid={true}
                    onNavigationStateChange={this.navChangeHandler}
<<<<<<< HEAD
                    onError={this.webErrorHandler}
                    renderError={this.renderError}
=======
>>>>>>> Fix refresh button based on recent merge
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
