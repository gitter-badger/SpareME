/**
 * @providesModule ml-api
 */

const ADD = "add";
const BASE_URL = "http://spareme.pw:5000/";
const DEFAULT_CATEGORY = "harmless";
const PREDICT = "predict?text=";
const PREDICT_BATCH = "predictBatch?"
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
    let url = BASE_URL + PREDICT + encodeURIComponent(str) + ID_TOKEN + encodeURIComponent(idToken);

    fetch(url).then(function(response) {
        callback(response._bodyText);
    }).catch(error => {
        //console.log(error);
    });
}

/**
 * Gets categories for a group of Strings
 *
 * @param group a JSON object whose keys are the Strings to analyze
 */
export function getCategoriesForBatch(batch, idToken, callback) {
    fetch(createBatchQuery(batch, idToken)).then(function(response) {
        callback(response._bodyText);
    });
}

export function createBatchQuery(batch, idToken) {
    let url = BASE_URL + PREDICT_BATCH;
    var query_args = [];

    for (var key in batch) {
        if (batch.hasOwnProperty(key)) {
            query_args.push(encodeURIComponent(key) + "=" + encodeURIComponent(batch[key]))
        }
    }

    url += query_args.join("&") + ID_TOKEN + encodeURIComponent(idToken);
    console.log("fetching batch from: " + url)
    return url
}

/**
 * Returns the String category for an element's inner (plain) text.
 * Note: for more accurate results, try to use the most deeply-nested
 * element possible (don't call this with `HTML` or `body`).
 */
export function getCategoryForHtmlElement(element, idToken, callback) {
    let phrase = element.innerText;

    if (phrase) {
        let url = BASE_URL + PREDICT + encodeURIComponent(phrase);

        url += ID_TOKEN + encodeURIComponent(idToken);

        fetch(url).then(function(response) {
            callback(response._bodyText);
        }).catch(error => {
            //console.log(error);
        });
    }
}

export function addTextToCategory(text, category, idToken) {
    let url = BASE_URL + ADD;

    var form = new FormData();
    form.append('text', encodeURIComponent(text));
    form.append('category', encodeURIComponent(category));
    form.appent('id_token', encodeURIComponent(idToken));

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        callback(response._bodyText);
    }).catch(error => {
        //console.log(error);
    });
}
