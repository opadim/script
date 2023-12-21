// cannoli = awesomex10
document.addEventListener('DOMContentLoaded', function () {
    (function () {
        var a1b2c3 = new URLSearchParams(window.location.search);

        function d4e5f6(g7h8i9) {
            return g7h8i9.replace(/ /g, '_s_').replace(/-/g, '_d_');
        }

        if (a1b2c3.has('tid')) {
            var j0k1l2 = a1b2c3.get('tid');
            var m3n4o5 = d4e5f6(j0k1l2);
            a1b2c3.set('tid', m3n4o5);
        }

        var p6q7r8 = a1b2c3.get('gclid') || a1b2c3.get('msclkid') || a1b2c3.get('fbclid');

        if (a1b2c3.toString()) {
            var s9t0u1 = document.getElementsByTagName('a');
            for (var v2w3x4 = 0; v2w3x4 < s9t0u1.length; v2w3x4++) {
                var y5z6a7 = s9t0u1[v2w3x4];
                var b8c9d0 = y5z6a7.hash;
                var e1f2g3 = y5z6a7.href.split('#')[0];
                var h4i5j6 = new URL(e1f2g3, document.location.href).searchParams;

                var k7l8m9 = p6q7r8;

                if (h4i5j6.has('tid') && p6q7r8) {
                    k7l8m9 = d4e5f6(p6q7r8);
                }

                if (k7l8m9) {
                    e1f2g3 = e1f2g3.replace('[cnlid]', k7l8m9).replace('%5Bcnlid%5D', k7l8m9);
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
