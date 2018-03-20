'use strict';
import React, { Component } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, View } from 'react-native';

class URLBar extends Component {

    constructor(props) {
        super(props);
        this.state = {url: props.url};
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    update(url) {
        this.refs.textInput.blur();
        this.setState({url: url});
    }

    formattedURL() {
        let text = this.state.url.toLowerCase();
        if (text.includes(' ')) {
            return 'https://www.google.com/search?q=' + text.replace(' ', '+');
        }
        else if (!text.includes('.')) {
            return 'https://www.google.com/search?q=' + text;
        }
        else {
            if (!text.startsWith('https://') && !text.startsWith('http://')) {
                text = 'http://' + text;
            }
            return text;
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
                    onChangeText={ (text) => {
                        this.setState({
                            url: text
                        });
                    }}
                    onSubmitEditing={ () => {
                        onChangeHandler(this.formattedURL());
                    }}
                    value={this.state.url}
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
