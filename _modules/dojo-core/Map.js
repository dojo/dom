(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './object'], factory);
    }
})(function (require, exports) {
    var object_1 = require('./object');
    /**
     * An implementation analogous to the Map specification in ES2015,
     * with the exception of iterators.  The entries, keys, and values methods
     * are omitted, since forEach essentially provides the same functionality.
     */
    var Map = (function () {
        /**
         * Creates a new Map
         *
         * @constructor
         *
         * @param arrayLike
         * Array or array-like object containing two-item tuples used to initially populate the map.
         * The first item in each tuple corresponds to the key of the map entry.
         * The second item corresponds to the value of the map entry.
         */
        function Map(arrayLike) {
            this._keys = [];
            this._values = [];
            if (arrayLike) {
                for (var i = 0, length_1 = arrayLike.length; i < length_1; i++) {
                    this.set(arrayLike[i][0], arrayLike[i][1]);
                }
            }
        }
        /*
         * An alternative to Array.prototype.indexOf using Object.is
         * to check for equality. See http://mzl.la/1zuKO2V
         */
        Map.prototype._indexOfKey = function (keys, key) {
            for (var i = 0, length_2 = keys.length; i < length_2; i++) {
                if (object_1.is(keys[i], key)) {
                    return i;
                }
            }
            return -1;
        };
        Object.defineProperty(Map.prototype, "size", {
            /**
             * Returns the number of key / value pairs in the Map.
             *
             * @return the number of key / value pairs in the Map
             */
            get: function () {
                return this._keys.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Deletes all keys and their associated values.
         */
        Map.prototype.clear = function () {
            this._keys.length = this._values.length = 0;
        };
        /**
         * Deletes a given key and its associated value.
         *
         * @param key The key to delete
         * @return true if the key exists, false if it does not
         */
        Map.prototype.delete = function (key) {
            var index = this._indexOfKey(this._keys, key);
            if (index < 0) {
                return false;
            }
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            return true;
        };
        /**
         * Executes a given function for each map entry. The function
         * is invoked with three arguments: the element value, the
         * element key, and the associated Map instance.
         *
         * @param callback The function to execute for each map entry,
         * @param context The value to use for `this` for each execution of the calback
         */
        Map.prototype.forEach = function (callback, context) {
            var keys = this._keys;
            var values = this._values;
            for (var i = 0, length_3 = keys.length; i < length_3; i++) {
                callback.call(context, values[i], keys[i], this);
            }
        };
        /**
         * Returns the value associated with a given key.
         *
         * @param key The key to look up
         * @return The value if one exists or undefined
         */
        Map.prototype.get = function (key) {
            var index = this._indexOfKey(this._keys, key);
            return index < 0 ? undefined : this._values[index];
        };
        /**
         * Checks for the presence of a given key.
         *
         * @param key The key to check for
         * @return true if the key exists, false if it does not
         */
        Map.prototype.has = function (key) {
            return this._indexOfKey(this._keys, key) > -1;
        };
        /**
         * Sets the value associated with a given key.
         *
         * @param key The key to define a value to
         * @param value The value to assign
         * @return The Map instance
         */
        Map.prototype.set = function (key, value) {
            var index = this._indexOfKey(this._keys, key);
            index = index < 0 ? this._keys.length : index;
            this._keys[index] = key;
            this._values[index] = value;
            return this;
        };
        return Map;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL01hcC50cyJdLCJuYW1lcyI6WyJNYXAiLCJNYXAuY29uc3RydWN0b3IiLCJNYXAuX2luZGV4T2ZLZXkiLCJNYXAuc2l6ZSIsIk1hcC5jbGVhciIsIk1hcC5kZWxldGUiLCJNYXAuZm9yRWFjaCIsIk1hcC5nZXQiLCJNYXAuaGFzIiwiTWFwLnNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFDQSx1QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUI7Ozs7T0FJRztJQUNIO1FBaUJDQTs7Ozs7Ozs7O1dBU0dBO1FBQ0hBLGFBQVlBLFNBQStCQTtZQTFCakNDLFVBQUtBLEdBQVFBLEVBQUVBLENBQUNBO1lBQ2hCQSxZQUFPQSxHQUFRQSxFQUFFQSxDQUFDQTtZQTBCM0JBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNmQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxRQUFNQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQSxRQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtvQkFDNURBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1Q0EsQ0FBQ0E7WUFDRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUE3QkREOzs7V0FHR0E7UUFDT0EseUJBQVdBLEdBQXJCQSxVQUFzQkEsSUFBU0EsRUFBRUEsR0FBTUE7WUFDdENFLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLFFBQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENB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Ozs7O1dBTUdBO1FBQ0hBLGlCQUFHQSxHQUFIQSxVQUFJQSxHQUFNQSxFQUFFQSxLQUFRQTtZQUNuQlMsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLEtBQUtBLEdBQUdBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO1lBQzlDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUN4QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0ZULFVBQUNBO0lBQURBLENBQUNBLEFBdEhELElBc0hDO0lBdEhEO3lCQXNIQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXJyYXlMaWtlIH0gZnJvbSAnLi9hcnJheSc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJy4vb2JqZWN0JztcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBhbmFsb2dvdXMgdG8gdGhlIE1hcCBzcGVjaWZpY2F0aW9uIGluIEVTMjAxNSxcbiAqIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiBpdGVyYXRvcnMuICBUaGUgZW50cmllcywga2V5cywgYW5kIHZhbHVlcyBtZXRob2RzXG4gKiBhcmUgb21pdHRlZCwgc2luY2UgZm9yRWFjaCBlc3NlbnRpYWxseSBwcm92aWRlcyB0aGUgc2FtZSBmdW5jdGlvbmFsaXR5LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXA8SywgVj4ge1xuXHRwcm90ZWN0ZWQgX2tleXM6IEtbXSA9IFtdO1xuXHRwcm90ZWN0ZWQgX3ZhbHVlczogVltdID0gW107XG5cblx0Lypcblx0ICogQW4gYWx0ZXJuYXRpdmUgdG8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgdXNpbmcgT2JqZWN0LmlzXG5cdCAqIHRvIGNoZWNrIGZvciBlcXVhbGl0eS4gU2VlIGh0dHA6Ly9temwubGEvMXp1S08yVlxuXHQgKi9cblx0cHJvdGVjdGVkIF9pbmRleE9mS2V5KGtleXM6IEtbXSwga2V5OiBLKTogbnVtYmVyIHtcblx0XHRmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGlzKGtleXNbaV0sIGtleSkpIHtcblx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IE1hcFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGFycmF5TGlrZVxuXHQgKiBBcnJheSBvciBhcnJheS1saWtlIG9iamVjdCBjb250YWluaW5nIHR3by1pdGVtIHR1cGxlcyB1c2VkIHRvIGluaXRpYWxseSBwb3B1bGF0ZSB0aGUgbWFwLlxuXHQgKiBUaGUgZmlyc3QgaXRlbSBpbiBlYWNoIHR1cGxlIGNvcnJlc3BvbmRzIHRvIHRoZSBrZXkgb2YgdGhlIG1hcCBlbnRyeS5cblx0ICogVGhlIHNlY29uZCBpdGVtIGNvcnJlc3BvbmRzIHRvIHRoZSB2YWx1ZSBvZiB0aGUgbWFwIGVudHJ5LlxuXHQgKi9cblx0Y29uc3RydWN0b3IoYXJyYXlMaWtlPzogQXJyYXlMaWtlPFsgSywgViBdPikge1xuXHRcdGlmIChhcnJheUxpa2UpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBhcnJheUxpa2UubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGhpcy5zZXQoYXJyYXlMaWtlW2ldWzBdLCBhcnJheUxpa2VbaV1bMV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5IC8gdmFsdWUgcGFpcnMgaW4gdGhlIE1hcC5cblx0ICpcblx0ICogQHJldHVybiB0aGUgbnVtYmVyIG9mIGtleSAvIHZhbHVlIHBhaXJzIGluIHRoZSBNYXBcblx0ICovXG5cdGdldCBzaXplKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2tleXMubGVuZ3RoO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIGtleXMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgdmFsdWVzLlxuXHQgKi9cblx0Y2xlYXIoKTogdm9pZCB7XG5cdFx0dGhpcy5fa2V5cy5sZW5ndGggPSB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGEgZ2l2ZW4ga2V5IGFuZCBpdHMgYXNzb2NpYXRlZCB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGRlbGV0ZVxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGtleSBleGlzdHMsIGZhbHNlIGlmIGl0IGRvZXMgbm90XG5cdCAqL1xuXHRkZWxldGUoa2V5OiBLKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XG5cdFx0aWYgKGluZGV4IDwgMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHR0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0dGhpcy5fdmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBnaXZlbiBmdW5jdGlvbiBmb3IgZWFjaCBtYXAgZW50cnkuIFRoZSBmdW5jdGlvblxuXHQgKiBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgZWxlbWVudCB2YWx1ZSwgdGhlXG5cdCAqIGVsZW1lbnQga2V5LCBhbmQgdGhlIGFzc29jaWF0ZWQgTWFwIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggbWFwIGVudHJ5LFxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgdmFsdWUgdG8gdXNlIGZvciBgdGhpc2AgZm9yIGVhY2ggZXhlY3V0aW9uIG9mIHRoZSBjYWxiYWNrXG5cdCAqL1xuXHRmb3JFYWNoKGNhbGxiYWNrOiAodmFsdWU6IFYsIGtleTogSywgbWFwSW5zdGFuY2U6IE1hcDxLLCBWPikgPT4gYW55LCBjb250ZXh0Pzoge30pIHtcblx0XHRjb25zdCBrZXlzID0gdGhpcy5fa2V5cztcblx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLl92YWx1ZXM7XG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdmFsdWVzW2ldLCBrZXlzW2ldLCB0aGlzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gbG9vayB1cFxuXHQgKiBAcmV0dXJuIFRoZSB2YWx1ZSBpZiBvbmUgZXhpc3RzIG9yIHVuZGVmaW5lZFxuXHQgKi9cblx0Z2V0KGtleTogSyk6IFYge1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpO1xuXHRcdHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiB0aGlzLl92YWx1ZXNbaW5kZXhdO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBmb3IgdGhlIHByZXNlbmNlIG9mIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gY2hlY2sgZm9yXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUga2V5IGV4aXN0cywgZmFsc2UgaWYgaXQgZG9lcyBub3Rcblx0ICovXG5cdGhhcyhrZXk6IEspOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpID4gLTE7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gZGVmaW5lIGEgdmFsdWUgdG9cblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ25cblx0ICogQHJldHVybiBUaGUgTWFwIGluc3RhbmNlXG5cdCAqL1xuXHRzZXQoa2V5OiBLLCB2YWx1ZTogVik6IE1hcDxLLCBWPiB7XG5cdFx0bGV0IGluZGV4ID0gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpO1xuXHRcdGluZGV4ID0gaW5kZXggPCAwID8gdGhpcy5fa2V5cy5sZW5ndGggOiBpbmRleDtcblx0XHR0aGlzLl9rZXlzW2luZGV4XSA9IGtleTtcblx0XHR0aGlzLl92YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==