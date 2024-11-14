(function(window) {
    window.ParamHandler = {
        init: function(config = {}) {
            this.destinationUrl = config.destinationUrl || '';
            this.setupEventListeners();
            this.updatePolicyLink();
        },

        getUrlParameters: function() {
            var urlParams = new URLSearchParams(window.location.search);
            var trackingId = urlParams.get('gclid') || 
                            urlParams.get('gbraid') || 
                            urlParams.get('wbraid') || 
                            urlParams.get('msclkid') || 
                            urlParams.get('fbclid') || 
                            'desconhecido';
            
            return {
                params: urlParams,
                trackingId: trackingId
            };
        },

        encodeSpecialChars: function(str) {
            return str.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');
        },

        buildDestinationUrl: function() {
            if (!this.destinationUrl) {
                console.error('Destination URL not set');
                return window.location.href;
            }

            var { params } = this.getUrlParameters();
            var destinationUrl = new URL(this.destinationUrl);
            var destinationParams = destinationUrl.searchParams;

            params.forEach(function(value, key) {
                if (key.toLowerCase() === 'tid') {
                    destinationParams.set(key, this.encodeSpecialChars(value));
                } else {
                    destinationParams.set(key, value);
                }
            }.bind(this));

            return destinationUrl.toString();
        },

        updatePolicyLink: function() {
            var policyLinks = document.querySelectorAll('.cookie-banner a');
            var destinationUrl = this.buildDestinationUrl();
            
            policyLinks.forEach(function(link) {
                link.href = destinationUrl;
            });
        },

        setupEventListeners: function() {
            document.addEventListener('closePopup', function() {
                window.location.href = this.buildDestinationUrl();
            }.bind(this));
        }
    };
})(window);
