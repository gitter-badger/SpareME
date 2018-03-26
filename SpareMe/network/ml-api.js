/**
 * @providesModule ml-api
 */

const ADD = "add";
const BASE_URL = "http://ec2-18-188-74-206.us-east-2.compute.amazonaws.com:5000/";
const DEFAULT_CATEGORY = "harmless";
const PREDICT = "predict?text=";
const ID_TOKEN = "&id_token="

/**
 * Returns the String category for the passed-in tokens from the API.
 *
 * @param stringArray an array of Strings to send to the API for evaluation.
 */
export function getCategoryForWords(stringArray, idToken) {
    let url = BASE_URL + PREDICT;

    stringArray.forEach(function(element) {
        url += (element + '%');
    })

    url += ID_TOKEN + idToken;

    fetch(url).then(function(response) {
        return response._bodyText;
    });
}

export function getCategoryForString(str, idToken, callback) {
    let url = BASE_URL + PREDICT + str.split(' ').join('%') + ID_TOKEN + idToken;

    fetch(url).then(function(response) {
        callback(response._bodyText);
    });
}

/**
 * Returns the String category for an element's inner (plain) text.
 * Note: for more accurate results, try to use the most deeply-nested
 * element possible (don't call this with `HTML` or `body`).
 */
export function getCategoryForHtmlElement(element, idToken, callback) {
    let phrase = element.innerText;

    if (phrase) {
        let url = BASE_URL + PREDICT + phrase.split(' ').join('%');

        url += ID_TOKEN + idToken;

        fetch(url).then(function(response) {
            callback(response._bodyText);
        });
    }
}

export function addTextToCategory(text, category, idToken) {
    let url = BASE_URL + ADD;

    var form = new FormData();
    form.append('text', text);
    form.append('category', category);
    form.appent('id_token', idToken);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        callback(response._bodyText);
    });
}
