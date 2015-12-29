(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../UrlSearchParams'], factory);
    }
})(function (require, exports) {
    var UrlSearchParams_1 = require('../UrlSearchParams');
    /**
     * Returns a URL formatted with optional query string and cache-busting segments.
     *
     * @param url The base URL.
     * @param options The options hash that is used to generate the query string.
     */
    function generateRequestUrl(url, options) {
        var query = new UrlSearchParams_1.default(options.query).toString();
        if (options.cacheBust) {
            var cacheBust = String(Date.now());
            query += query ? '&' + cacheBust : cacheBust;
        }
        var separator = url.indexOf('?') > -1 ? '&' : '?';
        return query ? url + separator + query : url;
    }
    exports.generateRequestUrl = generateRequestUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXF1ZXN0L3V0aWwudHMiXSwibmFtZXMiOlsiZ2VuZXJhdGVSZXF1ZXN0VXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUNBLGdDQUE0QixvQkFBb0IsQ0FBQyxDQUFBO0lBRWpEOzs7OztPQUtHO0lBQ0gsNEJBQW1DLEdBQVcsRUFBRSxPQUF1QjtRQUN0RUEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEseUJBQWVBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBRTFEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsSUFBTUEsU0FBU0EsR0FBR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLEtBQUtBLElBQUlBLEtBQUtBLEdBQUdBLEdBQUdBLEdBQUdBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzlDQSxDQUFDQTtRQUVEQSxJQUFNQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNwREEsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsR0FBR0EsU0FBU0EsR0FBR0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDOUNBLENBQUNBO0lBVmUsMEJBQWtCLHFCQVVqQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVxdWVzdE9wdGlvbnMgfSBmcm9tICcuLi9yZXF1ZXN0JztcbmltcG9ydCBVcmxTZWFyY2hQYXJhbXMgZnJvbSAnLi4vVXJsU2VhcmNoUGFyYW1zJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgVVJMIGZvcm1hdHRlZCB3aXRoIG9wdGlvbmFsIHF1ZXJ5IHN0cmluZyBhbmQgY2FjaGUtYnVzdGluZyBzZWdtZW50cy5cbiAqXG4gKiBAcGFyYW0gdXJsIFRoZSBiYXNlIFVSTC5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIGhhc2ggdGhhdCBpcyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVJlcXVlc3RVcmwodXJsOiBzdHJpbmcsIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKTogc3RyaW5nIHtcblx0bGV0IHF1ZXJ5ID0gbmV3IFVybFNlYXJjaFBhcmFtcyhvcHRpb25zLnF1ZXJ5KS50b1N0cmluZygpO1xuXG5cdGlmIChvcHRpb25zLmNhY2hlQnVzdCkge1xuXHRcdGNvbnN0IGNhY2hlQnVzdCA9IFN0cmluZyhEYXRlLm5vdygpKTtcblx0XHRxdWVyeSArPSBxdWVyeSA/ICcmJyArIGNhY2hlQnVzdCA6IGNhY2hlQnVzdDtcblx0fVxuXG5cdGNvbnN0IHNlcGFyYXRvciA9IHVybC5pbmRleE9mKCc/JykgPiAtMSA/ICcmJyA6ICc/Jztcblx0cmV0dXJuIHF1ZXJ5ID8gdXJsICsgc2VwYXJhdG9yICsgcXVlcnkgOiB1cmw7XG59XG4iXX0=