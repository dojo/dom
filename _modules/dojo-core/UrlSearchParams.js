(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './lang'], factory);
    }
})(function (require, exports) {
    var lang_1 = require('./lang');
    /**
     * Parses a query string, returning a ParamList object.
     */
    function parseQueryString(input) {
        var query = {};
        for (var _i = 0, _a = input.split('&'); _i < _a.length; _i++) {
            var entry = _a[_i];
            var indexOfFirstEquals = entry.indexOf('=');
            var key = void 0;
            var value = void 0;
            if (indexOfFirstEquals >= 0) {
                key = entry.slice(0, indexOfFirstEquals);
                value = entry.slice(indexOfFirstEquals + 1);
            }
            else {
                key = entry;
            }
            key = key ? decodeURIComponent(key) : '';
            value = value ? decodeURIComponent(value) : '';
            if (key in query) {
                query[key].push(value);
            }
            else {
                query[key] = [value];
            }
        }
        return query;
    }
    /**
     * Represents a set of URL query search parameters.
     */
    var UrlSearchParams = (function () {
        /**
         * Constructs a new UrlSearchParams from a query string, an object of parameters and values, or another
         * UrlSearchParams.
         */
        function UrlSearchParams(input) {
            var list;
            if (input instanceof UrlSearchParams) {
                // Copy the incoming UrlSearchParam's internal list
                list = lang_1.duplicate(input._list);
            }
            else if (typeof input === 'object') {
                // Copy the incoming object, assuming its property values are either arrays or strings
                list = {};
                for (var key in input) {
                    var value = input[key];
                    if (Array.isArray(value)) {
                        list[key] = value.length ? value.slice() : [''];
                    }
                    else if (value == null) {
                        list[key] = [''];
                    }
                    else {
                        list[key] = [value];
                    }
                }
            }
            else if (typeof input === 'string') {
                // Parse the incoming string as a query string
                list = parseQueryString(input);
            }
            else {
                list = {};
            }
            Object.defineProperty(this, '_list', { value: list });
        }
        /**
         * Appends a new value to the set of values for a key.
         * @param key The key to add a value for
         * @param value The value to add
         */
        UrlSearchParams.prototype.append = function (key, value) {
            if (!this.has(key)) {
                this.set(key, value);
            }
            else {
                this._list[key].push(value);
            }
        };
        /**
         * Deletes all values for a key.
         * @param key The key whose values are to be removed
         */
        UrlSearchParams.prototype.delete = function (key) {
            // Set to undefined rather than deleting the key, for better consistency across browsers.
            // If a deleted key is re-added, most browsers put it at the end of iteration order, but IE maintains
            // its original position.  This approach maintains the original position everywhere.
            this._list[key] = undefined;
        };
        /**
         * Returns the first value associated with a key.
         * @param key The key to return the first value for
         * @return The first string value for the key
         */
        UrlSearchParams.prototype.get = function (key) {
            if (!this.has(key)) {
                return null;
            }
            return this._list[key][0];
        };
        /**
         * Returns all the values associated with a key.
         * @param key The key to return all values for
         * @return An array of strings containing all values for the key
         */
        UrlSearchParams.prototype.getAll = function (key) {
            if (!this.has(key)) {
                return null;
            }
            return this._list[key];
        };
        /**
         * Returns true if a key has been set to any value, false otherwise.
         * @param key The key to test for existence
         * @return A boolean indicating if the key has been set
         */
        UrlSearchParams.prototype.has = function (key) {
            return Array.isArray(this._list[key]);
        };
        /**
         * Returns an array of all keys which have been set.
         * @return An array of strings containing all keys set in the UrlSearchParams instance
         */
        UrlSearchParams.prototype.keys = function () {
            var keys = [];
            for (var key in this._list) {
                if (this.has(key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
        /**
         * Sets the value associated with a key.
         * @param key The key to set the value of
         */
        UrlSearchParams.prototype.set = function (key, value) {
            this._list[key] = [value];
        };
        /**
         * Returns this object's data as an encoded query string.
         * @return A string in application/x-www-form-urlencoded format containing all of the set keys/values
         */
        UrlSearchParams.prototype.toString = function () {
            var query = [];
            for (var key in this._list) {
                if (!this.has(key)) {
                    continue;
                }
                var values = this._list[key];
                var encodedKey = encodeURIComponent(key);
                for (var _i = 0; _i < values.length; _i++) {
                    var value = values[_i];
                    query.push(encodedKey + (value ? ('=' + encodeURIComponent(value)) : ''));
                }
            }
            return query.join('&');
        };
        return UrlSearchParams;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = UrlSearchParams;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsU2VhcmNoUGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1VybFNlYXJjaFBhcmFtcy50cyJdLCJuYW1lcyI6WyJwYXJzZVF1ZXJ5U3RyaW5nIiwiVXJsU2VhcmNoUGFyYW1zIiwiVXJsU2VhcmNoUGFyYW1zLmNvbnN0cnVjdG9yIiwiVXJsU2VhcmNoUGFyYW1zLmFwcGVuZCIsIlVybFNlYXJjaFBhcmFtcy5kZWxldGUiLCJVcmxTZWFyY2hQYXJhbXMuZ2V0IiwiVXJsU2VhcmNoUGFyYW1zLmdldEFsbCIsIlVybFNlYXJjaFBhcmFtcy5oYXMiLCJVcmxTZWFyY2hQYXJhbXMua2V5cyIsIlVybFNlYXJjaFBhcmFtcy5zZXQiLCJVcmxTZWFyY2hQYXJhbXMudG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQ0EscUJBQTBCLFFBQVEsQ0FBQyxDQUFBO0lBT25DOztPQUVHO0lBQ0gsMEJBQTBCLEtBQWE7UUFDdENBLElBQU1BLEtBQUtBLEdBQW1CQSxFQUFFQSxDQUFDQTtRQUNqQ0EsR0FBR0EsQ0FBQ0EsQ0FBZ0JBLFVBQWdCQSxFQUFoQkEsS0FBQUEsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBL0JBLGNBQVdBLEVBQVhBLElBQStCQSxDQUFDQTtZQUFoQ0EsSUFBTUEsS0FBS0EsU0FBQUE7WUFDZkEsSUFBTUEsa0JBQWtCQSxHQUFHQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsR0FBR0EsU0FBUUEsQ0FBQ0E7WUFDaEJBLElBQUlBLEtBQUtBLFNBQVFBLENBQUNBO1lBRWxCQSxFQUFFQSxDQUFDQSxDQUFDQSxrQkFBa0JBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM3QkEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQTtnQkFDekNBLEtBQUtB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LEdBQWFBLEVBQUVBLENBQUNBO1lBRTNCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFHQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDOUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQkEsUUFBUUEsQ0FBQ0E7Z0JBQ1ZBLENBQUNBO2dCQUVEQSxJQUFNQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDL0JBLElBQU1BLFVBQVVBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxHQUFHQSxDQUFDQSxDQUFnQkEsVUFBTUEsRUFBckJBLGtCQUFXQSxFQUFYQSxJQUFxQkEsQ0FBQ0E7b0JBQXRCQSxJQUFNQSxLQUFLQSxHQUFJQSxNQUFNQSxJQUFWQTtvQkFDZkEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtpQkFDMUVBO1lBQ0ZBLENBQUNBO1lBRURBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUNGVCxzQkFBQ0E7SUFBREEsQ0FBQ0EsQUFySkQsSUFxSkM7SUFySkQ7cUNBcUpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYXNoIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGR1cGxpY2F0ZSB9IGZyb20gJy4vbGFuZyc7XG5cbi8qKlxuICogT2JqZWN0IHdpdGggc3RyaW5nIGtleXMgYW5kIHN0cmluZyBvciBzdHJpbmcgYXJyYXkgdmFsdWVzIHRoYXQgZGVzY3JpYmVzIGEgcXVlcnkgc3RyaW5nLlxuICovXG5leHBvcnQgdHlwZSBQYXJhbUxpc3QgPSBIYXNoPHN0cmluZyB8IHN0cmluZ1tdPjtcblxuLyoqXG4gKiBQYXJzZXMgYSBxdWVyeSBzdHJpbmcsIHJldHVybmluZyBhIFBhcmFtTGlzdCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IFBhcmFtTGlzdCB7XG5cdGNvbnN0IHF1ZXJ5OiBIYXNoPHN0cmluZ1tdPiA9IHt9O1xuXHRmb3IgKGNvbnN0IGVudHJ5IG9mIGlucHV0LnNwbGl0KCcmJykpIHtcblx0XHRjb25zdCBpbmRleE9mRmlyc3RFcXVhbHMgPSBlbnRyeS5pbmRleE9mKCc9Jyk7XG5cdFx0bGV0IGtleTogc3RyaW5nO1xuXHRcdGxldCB2YWx1ZTogc3RyaW5nO1xuXG5cdFx0aWYgKGluZGV4T2ZGaXJzdEVxdWFscyA+PSAwKSB7XG5cdFx0XHRrZXkgPSBlbnRyeS5zbGljZSgwLCBpbmRleE9mRmlyc3RFcXVhbHMpO1xuXHRcdFx0dmFsdWUgPSBlbnRyeS5zbGljZShpbmRleE9mRmlyc3RFcXVhbHMgKyAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0a2V5ID0gZW50cnk7XG5cdFx0fVxuXG5cdFx0a2V5ID0ga2V5ID8gZGVjb2RlVVJJQ29tcG9uZW50KGtleSkgOiAnJztcblx0XHR2YWx1ZSA9IHZhbHVlID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6ICcnO1xuXG5cdFx0aWYgKGtleSBpbiBxdWVyeSkge1xuXHRcdFx0cXVlcnlba2V5XS5wdXNoKHZhbHVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRxdWVyeVtrZXldID0gWyB2YWx1ZSBdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcXVlcnk7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNldCBvZiBVUkwgcXVlcnkgc2VhcmNoIHBhcmFtZXRlcnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVybFNlYXJjaFBhcmFtcyB7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RzIGEgbmV3IFVybFNlYXJjaFBhcmFtcyBmcm9tIGEgcXVlcnkgc3RyaW5nLCBhbiBvYmplY3Qgb2YgcGFyYW1ldGVycyBhbmQgdmFsdWVzLCBvciBhbm90aGVyXG5cdCAqIFVybFNlYXJjaFBhcmFtcy5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGlucHV0Pzogc3RyaW5nIHwgUGFyYW1MaXN0IHwgVXJsU2VhcmNoUGFyYW1zKSB7XG5cdFx0bGV0IGxpc3Q6IFBhcmFtTGlzdDtcblxuXHRcdGlmIChpbnB1dCBpbnN0YW5jZW9mIFVybFNlYXJjaFBhcmFtcykge1xuXHRcdFx0Ly8gQ29weSB0aGUgaW5jb21pbmcgVXJsU2VhcmNoUGFyYW0ncyBpbnRlcm5hbCBsaXN0XG5cdFx0XHRsaXN0ID0gPFBhcmFtTGlzdD4gZHVwbGljYXRlKGlucHV0Ll9saXN0KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Ly8gQ29weSB0aGUgaW5jb21pbmcgb2JqZWN0LCBhc3N1bWluZyBpdHMgcHJvcGVydHkgdmFsdWVzIGFyZSBlaXRoZXIgYXJyYXlzIG9yIHN0cmluZ3Ncblx0XHRcdGxpc3QgPSB7fTtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gKDxQYXJhbUxpc3Q+IGlucHV0KVtrZXldO1xuXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRcdGxpc3Rba2V5XSA9IHZhbHVlLmxlbmd0aCA/IHZhbHVlLnNsaWNlKCkgOiBbICcnIF07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAodmFsdWUgPT0gbnVsbCkge1xuXHRcdFx0XHRcdGxpc3Rba2V5XSA9IFsgJycgXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRsaXN0W2tleV0gPSBbIDxzdHJpbmc+IHZhbHVlIF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuXHRcdFx0Ly8gUGFyc2UgdGhlIGluY29taW5nIHN0cmluZyBhcyBhIHF1ZXJ5IHN0cmluZ1xuXHRcdFx0bGlzdCA9IHBhcnNlUXVlcnlTdHJpbmcoaW5wdXQpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGxpc3QgPSB7fTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19saXN0JywgeyB2YWx1ZTogbGlzdCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYXBzIHByb3BlcnR5IGtleXMgdG8gYXJyYXlzIG9mIHZhbHVlcy4gVGhlIHZhbHVlIGZvciBhbnkgcHJvcGVydHkgdGhhdCBoYXMgYmVlbiBzZXQgd2lsbCBiZSBhbiBhcnJheSBjb250YWluaW5nXG5cdCAqIGF0IGxlYXN0IG9uZSBpdGVtLiBQcm9wZXJ0aWVzIHRoYXQgaGF2ZSBiZWVuIGRlbGV0ZWQgd2lsbCBoYXZlIGEgdmFsdWUgb2YgJ3VuZGVmaW5lZCcuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgX2xpc3Q6IEhhc2g8c3RyaW5nW10+O1xuXG5cdC8qKlxuXHQgKiBBcHBlbmRzIGEgbmV3IHZhbHVlIHRvIHRoZSBzZXQgb2YgdmFsdWVzIGZvciBhIGtleS5cblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGFkZCBhIHZhbHVlIGZvclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGFkZFxuXHQgKi9cblx0YXBwZW5kKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmhhcyhrZXkpKSB7XG5cdFx0XHR0aGlzLnNldChrZXksIHZhbHVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLl9saXN0W2tleV0ucHVzaCh2YWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIHZhbHVlcyBmb3IgYSBrZXkuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB3aG9zZSB2YWx1ZXMgYXJlIHRvIGJlIHJlbW92ZWRcblx0ICovXG5cdGRlbGV0ZShrZXk6IHN0cmluZyk6IHZvaWQge1xuXHRcdC8vIFNldCB0byB1bmRlZmluZWQgcmF0aGVyIHRoYW4gZGVsZXRpbmcgdGhlIGtleSwgZm9yIGJldHRlciBjb25zaXN0ZW5jeSBhY3Jvc3MgYnJvd3NlcnMuXG5cdFx0Ly8gSWYgYSBkZWxldGVkIGtleSBpcyByZS1hZGRlZCwgbW9zdCBicm93c2VycyBwdXQgaXQgYXQgdGhlIGVuZCBvZiBpdGVyYXRpb24gb3JkZXIsIGJ1dCBJRSBtYWludGFpbnNcblx0XHQvLyBpdHMgb3JpZ2luYWwgcG9zaXRpb24uICBUaGlzIGFwcHJvYWNoIG1haW50YWlucyB0aGUgb3JpZ2luYWwgcG9zaXRpb24gZXZlcnl3aGVyZS5cblx0XHR0aGlzLl9saXN0W2tleV0gPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEga2V5LlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gcmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSBmb3Jcblx0ICogQHJldHVybiBUaGUgZmlyc3Qgc3RyaW5nIHZhbHVlIGZvciB0aGUga2V5XG5cdCAqL1xuXHRnZXQoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICghdGhpcy5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9saXN0W2tleV1bMF07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbGwgdGhlIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggYSBrZXkuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byByZXR1cm4gYWxsIHZhbHVlcyBmb3Jcblx0ICogQHJldHVybiBBbiBhcnJheSBvZiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIHZhbHVlcyBmb3IgdGhlIGtleVxuXHQgKi9cblx0Z2V0QWxsKGtleTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGlmICghdGhpcy5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9saXN0W2tleV07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIGEga2V5IGhhcyBiZWVuIHNldCB0byBhbnkgdmFsdWUsIGZhbHNlIG90aGVyd2lzZS5cblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHRlc3QgZm9yIGV4aXN0ZW5jZVxuXHQgKiBAcmV0dXJuIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBrZXkgaGFzIGJlZW4gc2V0XG5cdCAqL1xuXHRoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLl9saXN0W2tleV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIGtleXMgd2hpY2ggaGF2ZSBiZWVuIHNldC5cblx0ICogQHJldHVybiBBbiBhcnJheSBvZiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGtleXMgc2V0IGluIHRoZSBVcmxTZWFyY2hQYXJhbXMgaW5zdGFuY2Vcblx0ICovXG5cdGtleXMoKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9saXN0KSB7XG5cdFx0XHRpZiAodGhpcy5oYXMoa2V5KSkge1xuXHRcdFx0XHRrZXlzLnB1c2goa2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ga2V5cztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBrZXkuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBzZXQgdGhlIHZhbHVlIG9mXG5cdCAqL1xuXHRzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLl9saXN0W2tleV0gPSBbIHZhbHVlIF07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGlzIG9iamVjdCdzIGRhdGEgYXMgYW4gZW5jb2RlZCBxdWVyeSBzdHJpbmcuXG5cdCAqIEByZXR1cm4gQSBzdHJpbmcgaW4gYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIGZvcm1hdCBjb250YWluaW5nIGFsbCBvZiB0aGUgc2V0IGtleXMvdmFsdWVzXG5cdCAqL1xuXHR0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHF1ZXJ5OiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gdGhpcy5fbGlzdCkge1xuXHRcdFx0aWYgKCF0aGlzLmhhcyhrZXkpKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLl9saXN0W2tleV07XG5cdFx0XHRjb25zdCBlbmNvZGVkS2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuXHRcdFx0XHRxdWVyeS5wdXNoKGVuY29kZWRLZXkgKyAodmFsdWUgPyAoJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSkgOiAnJykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBxdWVyeS5qb2luKCcmJyk7XG5cdH1cbn1cbiJdfQ==