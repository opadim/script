// cannoli = awesomex20240903
document.addEventListener('DOMContentLoaded', function () {
    (function () {
        var urlParams = new URLSearchParams(window.location.search);
        function encodeSpecialChars(str) {
            return str.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');
        }
        var trackingId = urlParams.get('gclid') || urlParams.get('gbraid') || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid') || 'desconhecido';
        
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var hash = link.hash;
            var href = link.href.split('#')[0];
            var url = new URL(href, document.location.href);
            var linkParams = url.searchParams;
            
            linkParams.forEach(function(value, key) {
                if (value.includes('[cnlid]') || value.includes('%5Bcnlid%5D')) {
                    var newValue = value.replace(/\[cnlid\]/g, trackingId).replace(/%5Bcnlid%5D/g, trackingId);
                    if (key.toLowerCase() === 'tid') {
                        newValue = encodeSpecialChars(newValue);
                    }
                    linkParams.set(key, newValue);
                } else if (key.toLowerCase() === 'tid') {
                    linkParams.set(key, encodeSpecialChars(value));
                }
            });
            
            if (urlParams.toString()) {
                urlParams.forEach(function(value, key) {
                    if (!linkParams.has(key)) {
                        if (key.toLowerCase() === 'tid') {
                            linkParams.set(key, encodeSpecialChars(value));
                        } else {
                            linkParams.set(key, value);
                        }
                    }
                });
            }
            
            link.href = url.toString() + hash;
        }
    })();
});
