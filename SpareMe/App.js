'use strict';
import React, { Component } from 'react';
import { StyleSheet, WebView, Text, View } from 'react-native';
import CustomStatusBar from './components/CustomStatusBar'
import URLBar from './components/URLBar'

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {url: 'https://facebook.github.io/react-native/docs/getting-started.html'};
    }

    textChangeHandler = (text) => {
        this.setState({url: text});
    }

    navChangeHandler = (webState) => {
        this.urlBar.blur();
        this.setState({url: webState.url});
    }

    render() {
        let jsCode = `
        var paragraphs = document.getElementsByTagName('p');
        for(var i = 0; i < paragraphs.length; i++)
        {
          paragraphs[i].onclick = function () {
              	this.style.color = 'transparent'
                this.style.textShadow = '0 0 5px rgba(0,0,0,0.5)'
          }
        }
        `;
        return (
            <View style={styles.container}>
                <CustomStatusBar/>
                <URLBar
                    onChangeHandler={this.textChangeHandler}
                    url={this.state.url}
                    onRef={ref => (this.urlBar = ref)}
                />
                <WebView
                    source={{uri: this.state.url}}
                    injectedJavaScript={jsCode}
                    style={styles.web}
                    javaScriptEnabledAndroid={true}
                    onNavigationStateChange={this.navChangeHandler}
                    // onMessage={(event)=> console.log(event.nativeEvent.data)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
},
web: {
  flex: 1,
  backgroundColor: '#fff'
}
});
