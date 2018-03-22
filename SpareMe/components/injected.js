/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    const INJECTED_CLASSNAME = "SpareMeElement";
    var injectedClassCounter = 0;

    inject();

    function inject() {
        // Open two-way message channel between React and the WebView
        createMessageSender();
        document.addEventListener('message', onReactMessage);

        // Send tags to React for processing
        analyzePage();
    }

    /**
     * Sends messages from the WebView to React
     */
    function createMessageSender() {
        // Steal back any site's postMessage overrides 😏
        var originalPostMessage = window.postMessage;
        var patchedPostMessage = function(message, targetOrigin, transfer) {
            originalPostMessage(message, targetOrigin, transfer);
        }
        patchedPostMessage.toString = function() {
            return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
        }
        window.postMessage = patchedPostMessage;
    }

    /**
     * Handles messages from React
     */
    function onReactMessage(data) {
        let action = JSON.parse(data.data);
        let name = action['name'];
        let className = action['className'];

        if (name === 'hide') {
            hideElement(document.getElementsByClassName(className)[0]);
        }
    }

    function hideElement(elementToHide) {
        elementToHide.style.filter = 'blur(10px)';
        elementToHide.style.color = 'transparent';
        elementToHide.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
    }

    function analyzePage() {
        var element;
        var iterator = document.createNodeIterator(
            document.body,
            NodeFilter.SHOW_ELEMENT,

            { acceptNode: function(node) {
                let hidable  = ['p', 'a', 'li', 'img', 'div'];
                let tag = node.tagName.toLowerCase();
                console.log(tag);
                if (hidable.indexOf(tag) > -1) {
                    if (tag === 'div') {
                        if (node.hasChildNodes()) {
                            console.log('rejecting ' + tag)
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                    console.log('accepting ' + tag)
                    return NodeFilter.FILTER_ACCEPT
                } else {
                    console.log('tag "' + tag + '" not in hideable')
                }
            }
        });
        // var elements = Array.from(document.body.querySelectorAll('*'));
        // for (let element of elements) {

        console.log('looking at nodes');
        while (element = iterator.nextNode()) {
            console.log(element)
                console.log('looking at element ' + element)
                // Add unique class so we can find this element later
                let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
                injectedClassCounter += 1;
                element.classList.add(addedClass);

                // Send innerText to React
                window.postMessage(JSON.stringify({
                    messageType: 'predict',
                    //content : String(element.innerText),
                    content : String(element.tagName === 'img' ? element.alt : element.innerText),
                    addedClass: addedClass
                }));
            }

        // }
    }




    /**
     * Get HTML elements that contain text and aren't wrapper/container elements
     */
    // function getHideableElements() {
    //     return Array.from(document.body.querySelectorAll('*')).filter((elem) => {
    //         return elem in HIDEABLE_ELEMENTS || elem.children.length === 0;
    //     });
    // }

})})();` // JavaScript :)
