/**
 * @providesModule ml-api
 */

const BASE_URL = "https://test.spareme.pw/";
const ENDPOINT_ADD = "add";
const ENDPOINT_PREDICT = "predict"
const DEFAULT_CATEGORY = "harmless";

/**
 * Gets categories for a group of Strings
 *
 * @param batch a JSON object whose keys are the Strings to analyze
 * @param idToken the auth token of the current user
 */
export function getCategoriesForBatch(batch, idToken, callback) {
    let url = BASE_URL + ENDPOINT_PREDICT;

    var form = new FormData();
    form.append('id_token', idToken);
    form.append('unlabeled_text', JSON.stringify(batch));

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

/**
 * Tells the API to label the text with the given category for the current user.
 *
 * @param text the actual text that's being labeled
 * @param category the category (label) that's being applied to the text
 * @param idToken the auth token of the current user
 */
export function addTextToCategory(text, category, idToken) {
    let url = BASE_URL + ENDPOINT_ADD;

    var form = new FormData();
    form.append('id_token', idToken);
    form.append('label', category);
    form.append('text', text);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).catch(error => {
        console.log(error);
    });
}

export function getCategories(callback) {
    // TODO get these from the API
    fetch("http://google.com/").then(function(response) {
        callback(['new category', 'harmelss', 'hateful', 'bananas', 'test', 'hokies', 'hello world']);
    }).catch(error => {
        console.log(error);
    });
}
