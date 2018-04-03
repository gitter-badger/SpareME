/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    // Injected classnames
    const INJECTED_CLASSNAME = "SpareMeElement";
    const HIDDEN_CLASSNAME = "SpareMeHidden";
    const REVEALED_CLASSNAME = "SpareMeRevealed";

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
        let className = action['className'];

        if (name === 'hide') {
            hideElement(document.getElementsByClassName(className)[0]);
        }
    }

    function hideElement(element) {
        element.classList.add(HIDDEN_CLASSNAME);
        element.style.filter = 'blur(10px)';
        element.addEventListener('click', onHiddenElementClick(element));
    }

    function onHiddenElementClick(element) {
        return function(event) {
            console.log("called onHiddenElementClick");

            if (isHidden(element)) {
                /* Element must be revealed before allowing
                its normal onclick to fire */
                event.preventDefault();

                // Reveal the element
                element.classList.remove(HIDDEN_CLASSNAME);
                element.classList.add(REVEALED_CLASSNAME);
                element.style.filter = 'blur(0px)';
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

        // Dismiss already-hidden elements
        if (selectedHTMLElement.classList.contains(HIDDEN_CLASSNAME) ||
            selectedHTMLElement.classList.contains(REVEALED_CLASSNAME)) {
            console.log("selected hidden element");
            return;
        }

        window.postMessage(JSON.stringify({
            messageType: 'selectionChanged',
            content : window.getSelection().toString()
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

            // element.addEventListener('click', onPageElementClick(element));
        }
    }

    function onPageElementClick(element) {
        return function(event) {
            console.log("called onPageElementClick");
            console.log("element is hidden: " + isHidden(element))
            if (!isHidden(element) && !isRevealed(element)) {
                event.stopPropagation();

                // TODO remove. for testing only
                element.style.color = 'red';

                // Alert React that an element was selected
                window.postMessage(JSON.stringify({
                    messageType: 'hide',
                    text : String(element.tagName === 'img' ? element.alt : element.innerText)
                }));

                hideElement(element);
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
