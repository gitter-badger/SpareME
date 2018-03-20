const ADD = "add";
const BASE_URL = "http://ec2-18-188-74-206.us-east-2.compute.amazonaws.com:5000/";
const DEFAULT_CATEGORY = "harmless";
const PREDICT = "predict?text=";

/**
 * Returns the String category for the passed-in tokens from the API.
 *
 * @param stringArray an array of Strings to send to the API for evaluation.
 */
export function getCategoryForWords(stringArray) {
    let url = BASE_URL + PREDICT;

    stringArray.forEach(function(element) {
        url += (element + '%');
    })

    fetch(url).then(function(response) {
        return response._bodyText;
    });
}

/**
 * Returns the String category for an element's inner (plain) text.
 * Note: for more accurate results, try to use the most deeply-nested
 * element possible (don't call this with `HTML` or `body`).
 */
export function getCategoryForHtmlElement(element) {
    let phrase = element.innerText;

    if (phrase) {
        let url = BASE_URL + PREDICT + phrase.split(' ').join('%');

        fetch(url).then(function(response) {
            return response._bodyText;
        });
    }

    return DEFAULT_CATEGORY;
}


export function addTextToCategory(text, category) {
    let url = BASE_URL + ADD;

    var form = new FormData();
    form.append('text', text);
    form.append('category', category);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        return response._bodyText;
    });
}
