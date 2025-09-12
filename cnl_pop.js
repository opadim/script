!function () {
    const a = {
        urlParams: ["gclid", "msclkid", "fbclid"],
        storageKey: "url_params",
        storageExpiryKey: "url_params_expiry",
        storageDuration: 2592e6
    }, e = [/googlebot\//i, /bingbot/i, /facebookexternalhit\//i, /pageburst/i];

    class t {
        constructor() {
            this.isCrawlerVisitor = this.isCrawler(),
            this.sessionId = "desconhecido",
            this.storedParams = {},
            this.initialize();
        }

        isCrawler() {
            const t = navigator.userAgent.toLowerCase();
            return e.some(e => e.test(t));
        }

        initialize() {
            let e;
            if (!this.isCrawlerVisitor) {
                e = this.getStoredParameters();
                if (e) {
                    this.storedParams = e.params;
                    this.sessionId = this.getSessionIdFromParams(e.params);
                }
                this.processUrlParameters();
            }
        }

        getSessionIdFromParams(e) {
            for (const t of a.urlParams) if (e[t]) return e[t];
            return "desconhecido";
        }

        encodeSpecialChars(e) {
            return e.replace(/ /g, "_s_").replace(/-/g, "_d_").replace(/\//g, "");
        }

        encodeForUrl(value) {
            try {
                return encodeURIComponent(decodeURIComponent(value));
            } catch (e) {
                return encodeURIComponent(value);
            }
        }

        encodeParameterValue(paramName, value) {
            return paramName.toLowerCase() === "tid" ? this.encodeSpecialChars(value) : value;
        }

        processUrlParameters() {
            const params = new URLSearchParams(window.location.search);
            let found = false;
            params.forEach((val, key) => {
                this.storedParams[key] = val;
                if (a.urlParams.includes(key)) {
                    this.sessionId = val;
                    found = true;
                }
            });
            if (found) this.storeParameters(this.storedParams);
        }

        storeParameters(params) {
            const data = { params, timestamp: Date.now() };
            try {
                localStorage.setItem(a.storageKey, JSON.stringify(data));
                localStorage.setItem(a.storageExpiryKey, (Date.now() + a.storageDuration).toString());
            } catch (e) {}
        }

        getStoredParameters() {
            try {
                const data = localStorage.getItem(a.storageKey);
                const expiry = localStorage.getItem(a.storageExpiryKey);
                if (data && expiry) {
                    if (Date.now() > parseInt(expiry)) {
                        localStorage.removeItem(a.storageKey);
                        localStorage.removeItem(a.storageExpiryKey);
                        return null;
                    }
                    return JSON.parse(data);
                }
                return null;
            } catch (e) {
                return null;
            }
        }

        processPageLinks() {
            if (!this.isCrawlerVisitor) {
                const anchors = document.getElementsByTagName("a");
                for (let i = 0; i < anchors.length; i++) {
                    const link = anchors[i];
                    const hash = link.hash;
                    const href = link.getAttribute("href");

                    // Skip links with no href, href="#", javascript links, or data-js controlled
                    if (!href || href === "#" || href.startsWith("javascript:") || link.hasAttribute("data-js-control")) {
                        continue;
                    }

                    try {
                        const urlObj = new URL(link.href, document.location.href);
                        const currentUrl = new URL(document.location.href);

                        // Skip same-page hash links
                        if (urlObj.origin + urlObj.pathname === currentUrl.origin + currentUrl.pathname && urlObj.hash) {
                            continue;
                        }

                        const params = urlObj.searchParams;

                        // Replace [cnlid] placeholders if found
                        params.forEach((val, key) => {
                            if (val.includes("[cnlid]") || val.includes("%5Bcnlid%5D")) {
                                const replaced = val.replace(/\[cnlid\]/g, this.sessionId).replace(/%5Bcnlid%5D/g, this.sessionId);
                                params.set(key, this.encodeParameterValue(key, replaced));
                            } else {
                                params.set(key, this.encodeParameterValue(key, val));
                            }
                        });

                        // Add stored parameters
                        Object.entries(this.storedParams).forEach(([key, val]) => {
                            if (!params.has(key)) params.set(key, this.encodeParameterValue(key, val));
                        });

                        link.href = urlObj.toString() + hash;
                    } catch (e) {}
                }
            }
        }

        processPageButtons() {
            if (!this.isCrawlerVisitor) {
                const buttons = document.getElementsByTagName("button");
                for (let i = 0; i < buttons.length; i++) {
                    const btn = buttons[i];
                    if (!btn.onclick || btn.hasAttribute("data-js-control")) continue;

                    const onClickCode = btn.onclick.toString();
                    const locMatch = onClickCode.match(/location\.href\s*=\s*['"`]([^'"`]+)['"`]/);
                    const openMatch = onClickCode.match(/window\.open\s*\(\s*['"`]([^'"`]+)['"`]/);

                    let url = null;
                    let useWindowOpen = false;
                    if (locMatch) url = locMatch[1];
                    else if (openMatch) {
                        url = openMatch[1];
                        useWindowOpen = true;
                    }

                    if (!url || url.startsWith("javascript:")) continue;

                    try {
                        const urlObj = new URL(url, document.location.href);
                        const params = urlObj.searchParams;

                        Object.entries(this.storedParams).forEach(([key, val]) => {
                            if (!params.has(key)) params.set(key, this.encodeParameterValue(key, val));
                        });

                        const finalUrl = urlObj.toString();
                        btn.onclick = new Function(useWindowOpen ? `window.open('${finalUrl}')` : `location.href='${finalUrl}'`);
                    } catch (e) {}
                }
            }
        }

        processPageForms() {
            if (!this.isCrawlerVisitor) {
                const forms = document.getElementsByTagName("form");
                for (let i = 0; i < forms.length; i++) {
                    const form = forms[i];
                    Object.entries(this.storedParams).forEach(([key, val]) => {
                        if (!form.querySelector(`input[name="${key}"]`)) {
                            const input = document.createElement("input");
                            input.type = "hidden";
                            input.name = key;
                            input.value = key.toLowerCase() === "tid" ? this.encodeSpecialChars(val) : val;
                            form.appendChild(input);
                        }
                    });
                }
            }
        }
    }

    window.addEventListener("load", function () {
        const instance = new t();
        instance.processPageLinks();
        instance.processPageButtons();
        instance.processPageForms();
        window.console && console.log("Cannoli script initialized");
    });
}();
