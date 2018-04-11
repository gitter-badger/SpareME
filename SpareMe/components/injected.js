/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    // Injected classnames
    const INJECTED_CLASSNAME = 'SpareMeElement';
    const HIDDEN_CLASSNAME = 'SpareMeHidden';
    const REVEALED_CLASSNAME = 'SpareMeRevealed';

    // The default API category
    const DEFAULT_CATEGORY = 'harmless';

    var injectedClassCounter = 0;

    const HTTP_BATCH_SIZE = 25

    inject();

    function inject() {
        // Open two-way message channel between React and the WebView
        createMessageSender();
        document.addEventListener('message', onReactMessage);
        document.addEventListener('selectionchange', onSelection, false);

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
                var element = document.getElementsByClassName(className)[0];

                // Only hide elements once :D
                if (!isHidden(element) && !isRevealed(element)) {
                    hideElement(element);
                }
                break;

            case 'selectionFlagged':
                let category = action['category'];
                let selection = window.getSelection();

                window.postMessage(JSON.stringify({
                    messageType: 'addTextToAPI',
                    text : selection.toString(),
                    category: category
                }));

                // Hide all elements in the selection range
                var selectionRange = selection.getRangeAt(0);


                if (selectionRange.commonAncestorContainer.getElementsByClassName) {
                    // Multiple elements selected
                    var elementsInRangeParent = selectionRange.commonAncestorContainer
                        .getElementsByClassName(INJECTED_CLASSNAME);

                    console.log(elementsInRangeParent);

                    for (var i = 0, element; element = elementsInRangeParent[i]; i++) {
                        if (selection.containsNode(element, true)) {
                            hideElement(element);
                        }
                    }
                } else { /* Single element selected */
                    let selectedHTMLElement = window.getSelection().anchorNode.parentElement;

                    if (selectedHTMLElement) {
                        hideElement(selectedHTMLElement);
                    }
                }

                break;

            case 'selectionUnflagged':
                var element = window.revealedElement;
                element.classList.remove(REVEALED_CLASSNAME);

                // Alert React that the user unflagged an element
                window.postMessage(JSON.stringify({
                    messageType: 'addTextToAPI',
                    text : String(element.tagName === 'img' ?
                        element.alt :
                        element.innerText),
                        category: DEFAULT_CATEGORY
                }));
                break;

            case 'unflagIgnored':
                var element = window.revealedElement;
                hideElement(element);
                break;

            default:
                // Unknown message type
                break;
        }
    }

    function hideElement(element) {
        element.classList.add(HIDDEN_CLASSNAME);

        // Cascade class down to all children
        for (var i = 0; i < element.children.length; i++) {
            element.children.item(i).classList.add(HIDDEN_CLASSNAME);
        }

        element.style.filter = 'blur(10px)';
        element.style.webkitUserSelect = 'none';
        element.addEventListener('click', onHiddenElementClick(element));
        configureLongPressActions(element)
    }

    function revealElement(element) {
        element.classList.remove(HIDDEN_CLASSNAME);
        element.classList.add(REVEALED_CLASSNAME);
        element.style.webkitUserSelect = 'auto';
        element.style.filter = 'blur(0px)';
        window.revealedElement = element;
    }

    function configureLongPressActions(node) {
        var longpress = false;
        var presstimer = null;

        var cancel = function(e) {
            if (presstimer !== null) {
                clearTimeout(presstimer);
                presstimer = null;
            }
        };

        var start = function(e) {
            longpress = false;
            presstimer = setTimeout(function() {
                revealElement(node)
                longpress = true;
            }, 500);
        };

        node.addEventListener('touchstart', start);
        node.addEventListener('touchend', cancel);
        node.addEventListener('touchleave', cancel);
        node.addEventListener('touchcancel', cancel);
    }

    function onHiddenElementClick(element) {
        return function(event) {
            if (isHidden(element)) {
                /* Element must be revealed before allowing
                its normal onclick to fire */
                event.preventDefault();

                window.postMessage(JSON.stringify({
                    messageType: 'elementRevealed'
                }));

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

        if (textSelection == '') {
            window.postMessage(JSON.stringify({
                messageType: 'selectionEnded'
            }));
            return;
        }

        let selectedHTMLElement = textSelection.anchorNode.parentElement;
        var isHiddenElement = selectedHTMLElement.classList.contains(HIDDEN_CLASSNAME);

        window.postMessage(JSON.stringify({
            messageType: 'selectionChanged',
            content : window.getSelection().toString(),
            isHiddenElement: isHiddenElement
        }));
    }

    function analyzePage() {
        var elements = document.body.querySelectorAll('p, a, li, h1, h2, h3, h4, span, div');
        var predictionGroup = {};
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i]

            // Discard divs and spans that wrap other HTML elements
            if (element.tagName === 'SPAN' || element.tagName === 'DIV') {
                if (element.childElementCount != 0) {
                    continue;
                } else {
                    console.log('Found non-empty div/span');
                }
            }

            // Add unique class so we can find this element later
            let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
            injectedClassCounter += 1;
            element.classList.add(addedClass);

            // Add non-unique class for easy grouping without regex
            element.classList.add(INJECTED_CLASSNAME)

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
