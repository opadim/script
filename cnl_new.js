document.addEventListener('DOMContentLoaded', function () {
    (function () {
        var currentPageBaseURL = window.location.origin + window.location.pathname; // Get the current page base URL without parameters
        var urlParams = new URLSearchParams(window.location.search);

        function encodeValue(value) {
            return value.replace(/ /g, '_s_').replace(/-/g, '_d_');
        }

        if (urlParams.has('tid')) {
            var tidValue = urlParams.get('tid');
            var encodedTidValue = encodeValue(tidValue);
            urlParams.set('tid', encodedTidValue);
        }

        var cnlidValue = "NoClickID"; // Default to "NoClickID"
        if (urlParams.has('gclid') && urlParams.get('gclid') ||
            urlParams.has('wbraid') && urlParams.get('wbraid') ||
            urlParams.has('msclkid') && urlParams.get('msclkid') ||
            urlParams.has('fbclid') && urlParams.get('fbclid')) {
            cnlidValue = urlParams.get('gclid') || urlParams.get('gclid') || urlParams.get('msclkid') || urlParams.get('fbclid');
        } else if (urlParams.has('gclid') || urlParams.has('wbraid') || urlParams.has('msclkid') || urlParams.has('fbclid')) {
            cnlidValue = "EmptyClickID";
        }

        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var hash = link.hash;
            var urlWithoutHash = link.href.split('#')[0];
            var linkParams = new URL(urlWithoutHash).searchParams;

            var replacementValue = cnlidValue;

            if (linkParams.has('tid') && cnlidValue) {
                replacementValue = encodeValue(cnlidValue);
            }

            // Always perform the replacement
            urlWithoutHash = urlWithoutHash.replace('[cnlid]', replacementValue).replace('%5Bcnlid%5D', replacementValue);

            // Only append paramString if the link is not an anchor link or it navigates away from the current page
            var paramString = urlParams.toString();
            if (urlWithoutHash.indexOf(currentPageBaseURL) === -1 || !hash) { // Check if the link is not just an anchor or if it navigates away
                if (urlWithoutHash.indexOf('?') === -1 && paramString) {
                    urlWithoutHash += '?' + paramString;
                } else if (paramString) {
                    urlWithoutHash += '&' + paramString;
                }
            }
            link.href = urlWithoutHash + hash;
        }
    })();
});
