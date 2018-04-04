/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    // Injected classnames
    const INJECTED_CLASSNAME = "SpareMeElement";
    const HIDDEN_CLASSNAME = "SpareMeHidden";
    const REVEALED_CLASSNAME = "SpareMeRevealed";

    // The default API category
    const DEFAULT_CATEGORY = 'harmless';

    var injectedClassCounter = 0;

    const HTTP_BATCH_SIZE = 25

    inject();

    function inject() {
        // Open two-way message channel between React and the WebView
        createMessageSender();
        document.addEventListener('message', onReactMessage);
        document.addEventListener("selectionchange", onSelection, false);

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

        switch (name) {
            case 'hide':
                let className = action['className'];
                hideElement(document.getElementsByClassName(className)[0]);
                break;

            case 'selectionFlagged':
                let selectedHTMLElement = window.getSelection().anchorNode.parentElement;

                if (selectedHTMLElement) {
                    // Hide the selected element on the page
                    hideElement(selectedHTMLElement);

                    // Alert React that the user hid an element
                    window.postMessage(JSON.stringify({
                        messageType: 'addTextToAPI',
                        text : String(selectedHTMLElement.tagName === 'img' ?
                            selectedHTMLElement.alt :
                            selectedHTMLElement.innerText)
                    }));
                }
                break;

            case 'selectionUnflagged':
                selectedHTMLElement = window.getSelection().anchorNode.parentElement;

                if (selectedHTMLElement) {
                    // Hide the selected element on the page
                    revealElement(selectedHTMLElement);
                    selectedHTMLElement.classList.remove(REVEALED_CLASSNAME);

                    // Alert React that the user hid an element
                    window.postMessage(JSON.stringify({
                        messageType: 'addTextToAPI',
                        text : String(selectedHTMLElement.tagName === 'img' ?
                            selectedHTMLElement.alt :
                            selectedHTMLElement.innerText),
                            category: DEFAULT_CATEGORY
                    }));
                }
                break;

            default:
                // Unknown message type
                break;
        }
    }

    function hideElement(element) {
        element.classList.add(HIDDEN_CLASSNAME);
        element.style.filter = 'blur(10px)';
        element.addEventListener('click', onHiddenElementClick(element));
    }

    function revealElement(element) {
        element.classList.remove(HIDDEN_CLASSNAME);
        element.classList.add(REVEALED_CLASSNAME);
        element.style.filter = 'blur(0px)';
    }

    function onHiddenElementClick(element) {
        return function(event) {
            if (isHidden(element)) {
                /* Element must be revealed before allowing
                its normal onclick to fire */
                event.preventDefault();

                // Reveal the element
                revealElement(element);
            }
        }
    }

    /**
     * Sends un-hidden text selections to React.
     */
    function onSelection() {
        let textSelection = window.getSelection();

        if (textSelection == "") {
            console.log("selectionEnded")
            window.postMessage(JSON.stringify({
                messageType: 'selectionEnded'
            }));
            return;
        }

        let selectedHTMLElement = textSelection.anchorNode.parentElement

        var isHiddenElement = selectedHTMLElement.classList.contains(HIDDEN_CLASSNAME) ||
            selectedHTMLElement.classList.contains(REVEALED_CLASSNAME)

        window.postMessage(JSON.stringify({
            messageType: 'selectionChanged',
            content : window.getSelection().toString(),
            isHiddenElement: isHiddenElement
        }));

    }

    function analyzePage() {
        var elements = document.body.querySelectorAll('p, a, li');
        var predictionGroup = {}
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i]

            // Add unique class so we can find this element later
            let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
            injectedClassCounter += 1;
            element.classList.add(addedClass);

            // Map the added class name to the element's innerText
            predictionGroup[addedClass] = String(element.tagName === 'img' ? element.alt : element.innerText)

            // Send elements in groups of HTTP_BATCH_SIZE to React
            if (injectedClassCounter % HTTP_BATCH_SIZE == 0 || i == elements.length - 1) {
                window.postMessage(JSON.stringify({
                    messageType: 'predict',
                    content : predictionGroup
                }));

                predictionGroup = {}
            }
        }
    }

    function isHidden(element) {
        return element.classList.contains(HIDDEN_CLASSNAME);
    }

    function isRevealed(element) {
        return element.classList.contains(REVEALED_CLASSNAME);
    }

})})();` // JavaScript :)
