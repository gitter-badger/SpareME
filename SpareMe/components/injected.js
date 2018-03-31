/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    const INJECTED_CLASSNAME = "SpareMeElement";
    const HTTP_BATCH_SIZE = 25
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

    function hideElement(element) {
        element.classList.add('SpareMeHidden');
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
                element.classList.remove('SpareMeHidden');
                element.classList.add('SpareMeRevealed');
                element.style.filter = 'blur(0px)';
            }
        }
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

            element.addEventListener('click', onPageElementClick(element));
        }
    }

    function onPageElementClick(element) {
        return function(event) {
            console.log("called onPageElementClick");
            console.log("element is hidden: " + isHidden(element))
            if (!isHidden(element)) {
                event.stopPropagation();
                element.style.color = 'red';
            }
        }
    }

    function isHidden(element) {
        return element.classList.contains('SpareMeHidden');
    }

    function isRevealed(element) {
        return element.classList.contains('SpareMeRevealed');
    }

})})();` // JavaScript :)
