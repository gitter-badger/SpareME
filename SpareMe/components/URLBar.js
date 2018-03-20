'use strict';
import React, { Component } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, View } from 'react-native';

class URLBar extends Component {

    constructor(props) {
        super(props);
        this.typing = false;
        this.state = {url: props.url};
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    blur() {
        this.typing = false;
        this.refs.textInput.blur();
    }

    formattedURL() {
        let text = this.state.url.toLowerCase();
        const domainExts = ['com', 'org', 'edu'];

        if (text.includes(' ')) {
            return 'https://www.google.com/search?q=' + text.replace(' ', '+');
        }
        else {
            var i;
            for (var i = 0; i < domainExts.length; ++i) {
                if (text.includes('.' + domainExts[i])) {
                    if (!text.startsWith('https://')) {
                        text = 'https://' + text;
                    }
                    return text;
                }
            }
            return 'https://www.google.com/search?q=' + text;
        }
    }

    render() {
        const {refreshHandler, onChangeHandler, url} = this.props;
        return (
            <View style={styles.bar}>
                <TouchableOpacity
                    style={styles.refresh}
                    onPress={ () => {
                            refreshHandler();
                    }
                }>
                    <Image source={require('./refresh.png')} style={styles.image}/>
                </TouchableOpacity>
                <TextInput
                    ref='textInput'
                    style={styles.url}
                    selectTextOnFocus={true}
                    onFocus={ (event) => {
                        this.typing = true;
                    }}
                    onBlur={ () => {
                        this.typing = false;
                    }}
                    onChangeText={ (text) => {
                        this.setState({
                            url: text
                        });
                    }}
                    onSubmitEditing={ () => {
                        this.typing = false;
                        onChangeHandler(this.formattedURL());
                    }}
                    value={this.typing ? this.state.url : url}
                    editable={true}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    returnKeyType={'go'}
                    underlineColorAndroid='transparent'
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#6adbb5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    refresh: {
        height: 30,
        width: 30,
        marginRight: 10,
        backgroundColor: '#6adbb5',
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        height: 25,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    url: {
        height: 30,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#fffcf9',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        fontSize: 14
    }
});

export default URLBar;
