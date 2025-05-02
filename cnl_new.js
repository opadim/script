// cannoli = awesomex20250502
(function () {
    const config = {
        trackingParams: ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid'],
        storageKey: 'tracking_params',
        storageExpiryKey: 'tracking_params_expiry',
        storageDuration: 30 * 24 * 60 * 60 * 1000
    };

    const crawlerPatterns = [
        /googlebot\//i, /bingbot/i, /yandexbot/i, /duckduckbot/i, /baiduspider/i,
        /facebookexternalhit\//i, /twitterbot/i, /linkedinbot/i, /pinterest/i
    ];

    class TrackingManager {
        constructor() {
            this.isCrawlerVisitor = this.isCrawler();
            this.trackingId = 'desconhecido';
            this.storedParams = {};
            this.initialize();
        }

        isCrawler() {
            const userAgent = navigator.userAgent.toLowerCase();
            return crawlerPatterns.some(pattern => pattern.test(userAgent));
        }

        initialize() {
            if (this.isCrawlerVisitor) return;

            const storedData = this.getStoredParameters();
            if (storedData) {
                this.storedParams = storedData.params;
                this.trackingId = this.getTrackingIdFromParams(storedData.params);
            }

            this.processUrlParameters();
        }

        getTrackingIdFromParams(params) {
            for (const param of config.trackingParams) {
                if (params[param]) return params[param];
            }
            return 'desconhecido';
        }

        encodeSpecialChars(str) {
            return str.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');
        }

        processUrlParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            let foundNewParams = false;

            urlParams.forEach((value, key) => {
                this.storedParams[key] = value;
                if (config.trackingParams.includes(key)) {
                    this.trackingId = value;
                    foundNewParams = true;
                }
            });

            if (foundNewParams) {
                this.storeParameters(this.storedParams);
            }
        }

        storeParameters(params) {
            const data = {
                params: params,
                timestamp: new Date().getTime()
            };

            try {
                localStorage.setItem(config.storageKey, JSON.stringify(data));
                localStorage.setItem(config.storageExpiryKey,
                    (new Date().getTime() + config.storageDuration).toString());
            } catch (e) {
                console.warn('Erro ao salvar parametros:', e);
            }
        }

        getStoredParameters() {
            try {
                const stored = localStorage.getItem(config.storageKey);
                const expiry = localStorage.getItem(config.storageExpiryKey);

                if (!stored || !expiry) return null;

                if (new Date().getTime() > parseInt(expiry)) {
                    localStorage.removeItem(config.storageKey);
                    localStorage.removeItem(config.storageExpiryKey);
                    return null;
                }

                return JSON.parse(stored);
            } catch (e) {
                console.warn('Erro ao recuperar parametros:', e);
                return null;
            }
        }

        processPageLinks() {
            if (this.isCrawlerVisitor) return;

            const links = document.getElementsByTagName('a');
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const hash = link.hash;
                const href = link.href.split('#')[0];

                try {
                    const url = new URL(href, document.location.href);
                    const linkParams = url.searchParams;

                    linkParams.forEach((value, key) => {
                        if (value.includes('[cnlid]') || value.includes('%5Bcnlid%5D')) {
                            const newValue = value
                                .replace(/\[cnlid\]/g, this.trackingId)
                                .replace(/%5Bcnlid%5D/g, this.trackingId);
                            linkParams.set(key, key.toLowerCase() === 'tid' ?
                                this.encodeSpecialChars(newValue) : newValue);
                        } else if (key.toLowerCase() === 'tid') {
                            linkParams.set(key, this.encodeSpecialChars(value));
                        }
                    });

                    Object.entries(this.storedParams).forEach(([key, value]) => {
                        if (!linkParams.has(key)) {
                            linkParams.set(key, key.toLowerCase() === 'tid' ?
                                this.encodeSpecialChars(value) : value);
                        }
                    });

                    link.href = url.toString() + hash;
                } catch (e) {
                    console.warn('Erro ao processar link:', link.href, e);
                }
            }
        }

        processButtonLinks() {
            if (this.isCrawlerVisitor) return;

            const buttons = document.querySelectorAll('button[onclick*="window.location.href"]');
            buttons.forEach(button => {
                const onclick = button.getAttribute('onclick');
                const match = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
                if (!match) return;

                let urlStr = match[1];
                let hash = '';
                if (urlStr.includes('#')) {
                    [urlStr, hash] = urlStr.split('#', 2);
                    hash = '#' + hash;
                }

                try {
                    const url = new URL(urlStr, document.location.href);
                    const linkParams = url.searchParams;

                    // Replace placeholders like {gclid} with actual values
                    config.trackingParams.forEach(param => {
                        if (urlStr.includes(`{${param}}`)) {
                            urlStr = urlStr.replaceAll(`{${param}}`, this.storedParams[param] || '');
                        }
                    });

                    // Replace [cnlid] or %5Bcnlid%5D
                    linkParams.forEach((value, key) => {
                        if (value.includes('[cnlid]') || value.includes('%5Bcnlid%5D')) {
                            const newValue = value
                                .replace(/\[cnlid\]/g, this.trackingId)
                                .replace(/%5Bcnlid%5D/g, this.trackingId);
                            linkParams.set(key, key.toLowerCase() === 'tid' ?
                                this.encodeSpecialChars(newValue) : newValue);
                        } else if (key.toLowerCase() === 'tid') {
                            linkParams.set(key, this.encodeSpecialChars(value));
                        }
                    });

                    // Add missing stored params
                    Object.entries(this.storedParams).forEach(([key, value]) => {
                        if (!linkParams.has(key)) {
                            linkParams.set(key, key.toLowerCase() === 'tid' ?
                                this.encodeSpecialChars(value) : value);
                        }
                    });

                    // Rebuild the URL
                    const newUrl = url.origin + url.pathname + '?' + linkParams.toString() + hash;
                    // Update the onclick attribute
                    button.setAttribute('onclick', `window.location.href='${newUrl}'`);
                } catch (e) {
                    console.warn('Erro ao processar botão:', urlStr, e);
                }
            });
        }
    }

    // Track start time
    const startTime = new Date().getTime();
    console.log('🚀 Inicializando Cannoli...');

    // Replacing DOMContentLoaded with window.onload
    window.onload = function () {
        const tracker = new TrackingManager();
        tracker.processPageLinks();
        tracker.processButtonLinks(); // <-- Added to process button links
        console.log(`✅ Cannoli inicializado com sucesso`);

        // Track end time and calculate execution duration
        const endTime = new Date().getTime();
        const executionDuration = endTime - startTime;
        console.log(`⏱️ Tempo: ${executionDuration}ms`);
    };
})(); 
