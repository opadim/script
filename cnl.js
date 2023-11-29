(function () {
    const a1b2 = new URLSearchParams(window.location.search);

    function c3d4(e5f6) {
        return e5f6.replace(/ /g, '_s_').replace(/-/g, '_d_');
    }

    if (a1b2.has('tid')) {
        var g7h8 = a1b2.get('tid');
        var i9j1 = c3d4(g7h8);
        a1b2.set('tid', i9j1);
    }
    
    var k2l3 = a1b2.get('gclid') || a1b2.get('msclkid') || a1b2.get('fbclid');

    if (a1b2.toString()) {
        var m4n5 = document.getElementsByTagName('a');
        for (var o6p7 = 0; o6p7 < m4n5.length; o6p7++) {
            var q8r9 = m4n5[o6p7];
            var s0t1 = q8r9.hash;
            var u2v3 = q8r9.href.split('#')[0];
            var w4x5 = new URL(u2v3).searchParams;

            var y6z7 = k2l3;

            if (w4x5.has('tid') && k2l3) {
                y6z7 = c3d4(k2l3);
                console.log(`Replacement value is: ${y6z7}`);
            }

            if (y6z7 && u2v3.includes('[cnlid]')) {
                u2v3 = u2v3.replace('[cnlid]', y6z7);
                console.log(`urlWithoutHash is: ${u2v3}`);
            }

            var a8b9 = a1b2.toString();
            if (u2v3.indexOf('?') === -1) {
                u2v3 += '?' + a8b9;
            } else {
                u2v3 += '&' + a8b9;
            }
            q8r9.href = u2v3 + s0t1;
        }
    }
})();
