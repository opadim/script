// cannoli = awesomex10
document.addEventListener('DOMContentLoaded', function () {
    (function () {
        var a1b2c3 = new URLSearchParams(window.location.search);

        function d4e5f6(g7h8i9) {
            return g7h8i9.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');
        }

        function replaceCnlid(url) {
            var urlObj = new URL(url, document.location.href);
            var params = new URLSearchParams(urlObj.search);
            
            if (params.has('tid')) {
                var tidValue = params.get('tid');
                if (tidValue.includes('[cnlid]') || tidValue.includes('%5Bcnlid%5D')) {
                    params.set('tid', tidValue.replace(/(\[cnlid\]|%5Bcnlid%5D)/g, function(match) {
                        return d4e5f6(decodeURIComponent(match));
                    }));
                }
            }

            urlObj.search = params.toString();
            return urlObj.toString();
        }

        var p6q7r8 = a1b2c3.get('gclid') || a1b2c3.get('gbraid') || a1b2c3.get('wbraid') || a1b2c3.get('msclkid') || a1b2c3.get('fbclid');

        if (a1b2c3.toString()) {
            var s9t0u1 = document.getElementsByTagName('a');
            for (var v2w3x4 = 0; v2w3x4 < s9t0u1.length; v2w3x4++) {
                var y5z6a7 = s9t0u1[v2w3x4];
                var b8c9d0 = y5z6a7.hash;
                var e1f2g3 = y5z6a7.href.split('#')[0];

                e1f2g3 = replaceCnlid(e1f2g3);

                if (p6q7r8) {
                    e1f2g3 = e1f2g3.replace(/(\[cnlid\]|%5Bcnlid%5D)/g, encodeURIComponent(p6q7r8));
                }

                var n0o1p2 = a1b2c3.toString();
                if (e1f2g3.indexOf('?') === -1) {
                    e1f2g3 += '?' + n0o1p2;
                } else {
                    e1f2g3 += '&' + n0o1p2;
                }
                y5z6a7.href = e1f2g3 + b8c9d0;
            }
        }
    })();
});
