(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './number'], factory);
    }
})(function (require, exports) {
    var number_1 = require('./number');
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     * @param length The number to validate
     * @return A proper length
     */
    function toLength(length) {
        length = Number(length);
        if (isNaN(length)) {
            return 0;
        }
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), number_1.MAX_SAFE_INTEGER);
    }
    /**
     * From ES6 7.1.4 ToInteger()
     * @param value A value to convert
     * @return An integer
     */
    function toInteger(value) {
        value = Number(value);
        if (isNaN(value)) {
            return 0;
        }
        if (value === 0 || !isFinite(value)) {
            return value;
        }
        return (value > 0 ? 1 : -1) * Math.floor(Math.abs(value));
    }
    /**
     * Normalizes an offset against a given length, wrapping it if negative.
     * @param value The original offset
     * @param length The total length to normalize against
     * @return If negative, provide a distance from the end (length); otherwise provide a distance from 0
     */
    function normalizeOffset(value, length) {
        return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
    }
    /**
     * The Array.from() method creates a new Array instance from an array-like or iterable object.
     *
     * @param arrayLike An array-like or iterable object to convert to an array
     * @param [mapFunction] A map function to call on each element in the array
     * @param [thisArg] The execution context for the map function
     * @return The new Array
     */
    function from(arrayLike, mapFunction, thisArg) {
        if (arrayLike == null) {
            throw new TypeError('from: requires an array-like object');
        }
        if (mapFunction && thisArg) {
            mapFunction = mapFunction.bind(thisArg);
        }
        var Constructor = this;
        var items = Object(arrayLike);
        var length = toLength(items.length);
        // Support extension
        var array = (typeof Constructor === 'function') ? Object(new Constructor(length)) : new Array(length);
        for (var i = 0, value = void 0; i < length; i++) {
            value = items[i];
            array[i] = mapFunction ? mapFunction(value, i) : value;
        }
        array.length = length;
        return array;
    }
    exports.from = from;
    /**
     * Creates a new array from the function parameters.
     *
     * @param arguments Any number of arguments for the array
     * @return An array from the given arguments
     */
    function of() {
        return Array.prototype.slice.call(arguments);
    }
    exports.of = of;
    /**
     * Fills elements of an array-like object with the specified value.
     *
     * @param target The target to fill
     * @param value The value to fill each element of the target with
     * @param [start] The first index to fill
     * @param [end] The (exclusive) index at which to stop filling
     * @return The filled target
     */
    function fill(target, value, start, end) {
        var length = toLength(target.length);
        var i = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end ? toInteger(end) : length, length);
        while (i < end) {
            target[i++] = value;
        }
        return target;
    }
    exports.fill = fill;
    /**
     * Performs a linear search and returns the first index whose value satisfies the passed callback,
     * or -1 if no values satisfy it.
     *
     * @param target An array-like object
     * @param callback A function returning true if the current value satisfies its criteria
     * @param [thisArg] The execution context for the find function
     * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
     */
    function findIndex(target, callback, thisArg) {
        var length = toLength(target.length);
        if (!callback) {
            throw new TypeError('find: second argument must be a function');
        }
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (var i = 0; i < length; i++) {
            if (callback(target[i], i, target)) {
                return i;
            }
        }
        return -1;
    }
    exports.findIndex = findIndex;
    /**
     * Finds and returns the first instance matching the callback or undefined if one is not found.
     *
     * @param target An array-like object
     * @param callback A function returning if the current value matches a criteria
     * @param [thisArg] The execution context for the find function
     * @return The first element matching the callback, or undefined if one does not exist
     */
    function find(target, callback, thisArg) {
        var index = findIndex(target, callback, thisArg);
        return index !== -1 ? target[index] : undefined;
    }
    exports.find = find;
    /**
     * Copies data internally within an array or array-like object.
     *
     * @param target The target array-like object
     * @param offset The index to start copying values to; if negative, it counts backwards from length
     * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
     * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
     * @return The target
     */
    function copyWithin(target, offset, start, end) {
        if (target == null) {
            throw new TypeError('copyWithin: target must be an array-like object');
        }
        var length = toLength(target.length);
        offset = normalizeOffset(toInteger(offset), length);
        start = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end ? toInteger(end) : length, length);
        var count = Math.min(end - start, length - offset);
        var direction = 1;
        if (offset > start && offset < (start + count)) {
            direction = -1;
            start += count - 1;
            offset += count - 1;
        }
        while (count > 0) {
            if (start in target) {
                target[offset] = target[start];
            }
            else {
                delete target[offset];
            }
            offset += direction;
            start += direction;
            count--;
        }
        return target;
    }
    exports.copyWithin = copyWithin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXJyYXkudHMiXSwibmFtZXMiOlsidG9MZW5ndGgiLCJ0b0ludGVnZXIiLCJub3JtYWxpemVPZmZzZXQiLCJmcm9tIiwib2YiLCJmaWxsIiwiZmluZEluZGV4IiwiZmluZCIsImNvcHlXaXRoaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsdUJBQW1ELFVBQVUsQ0FBQyxDQUFBO0lBZTlEOzs7O09BSUc7SUFDSCxrQkFBa0IsTUFBYztRQUMvQkEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBQ0RBLDRDQUE0Q0E7UUFDNUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLHlCQUFjQSxDQUFDQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFFRDs7OztPQUlHO0lBQ0gsbUJBQW1CLEtBQVU7UUFDNUJDLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7UUFDREEsRUFBRUEs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ImltcG9ydCB7IE1BWF9TQUZFX0lOVEVHRVIgYXMgbWF4U2FmZUludGVnZXIgfSBmcm9tICcuL251bWJlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXJyYXlMaWtlPFQ+IHtcblx0bGVuZ3RoOiBudW1iZXI7XG5cdFtuOiBudW1iZXJdOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1hcENhbGxiYWNrPFQ+IHtcblx0KGVsZW1lbnQ6IFQsIGluZGV4OiBudW1iZXIpOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbmRDYWxsYmFjazxUPiB7XG5cdChlbGVtZW50OiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogQXJyYXlMaWtlPFQ+KTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBFbnN1cmVzIGEgbm9uLW5lZ2F0aXZlLCBub24taW5maW5pdGUsIHNhZmUgaW50ZWdlci5cbiAqIEBwYXJhbSBsZW5ndGggVGhlIG51bWJlciB0byB2YWxpZGF0ZVxuICogQHJldHVybiBBIHByb3BlciBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gdG9MZW5ndGgobGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuXHRsZW5ndGggPSBOdW1iZXIobGVuZ3RoKTtcblx0aWYgKGlzTmFOKGxlbmd0aCkpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuXHRcdGxlbmd0aCA9IE1hdGguZmxvb3IobGVuZ3RoKTtcblx0fVxuXHQvLyBFbnN1cmUgYSBub24tbmVnYXRpdmUsIHJlYWwsIHNhZmUgaW50ZWdlclxuXHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuZ3RoLCAwKSwgbWF4U2FmZUludGVnZXIpO1xufVxuXG4vKipcbiAqIEZyb20gRVM2IDcuMS40IFRvSW50ZWdlcigpXG4gKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSB0byBjb252ZXJ0XG4gKiBAcmV0dXJuIEFuIGludGVnZXJcbiAqL1xuZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlOiBhbnkpOiBudW1iZXIge1xuXHR2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdGlmIChpc05hTih2YWx1ZSkpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAodmFsdWUgPT09IDAgfHwgIWlzRmluaXRlKHZhbHVlKSkge1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdHJldHVybiAodmFsdWUgPiAwID8gMSA6IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnModmFsdWUpKTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIGFuIG9mZnNldCBhZ2FpbnN0IGEgZ2l2ZW4gbGVuZ3RoLCB3cmFwcGluZyBpdCBpZiBuZWdhdGl2ZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgb3JpZ2luYWwgb2Zmc2V0XG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSB0b3RhbCBsZW5ndGggdG8gbm9ybWFsaXplIGFnYWluc3RcbiAqIEByZXR1cm4gSWYgbmVnYXRpdmUsIHByb3ZpZGUgYSBkaXN0YW5jZSBmcm9tIHRoZSBlbmQgKGxlbmd0aCk7IG90aGVyd2lzZSBwcm92aWRlIGEgZGlzdGFuY2UgZnJvbSAwXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZU9mZnNldCh2YWx1ZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG5cdHJldHVybiB2YWx1ZSA8IDAgPyBNYXRoLm1heChsZW5ndGggKyB2YWx1ZSwgMCkgOiBNYXRoLm1pbih2YWx1ZSwgbGVuZ3RoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlOiBzdHJpbmcsIG1hcEZ1bmN0aW9uPzogTWFwQ2FsbGJhY2s8c3RyaW5nPiwgdGhpc0FyZz86IHt9KTogQXJyYXlMaWtlPHN0cmluZz47XG5leHBvcnQgZnVuY3Rpb24gZnJvbTxUPihhcnJheUxpa2U6IEFycmF5TGlrZTxUPiwgbWFwRnVuY3Rpb24/OiBNYXBDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KTogQXJyYXlMaWtlPFQ+O1xuLyoqXG4gKiBUaGUgQXJyYXkuZnJvbSgpIG1ldGhvZCBjcmVhdGVzIGEgbmV3IEFycmF5IGluc3RhbmNlIGZyb20gYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QuXG4gKlxuICogQHBhcmFtIGFycmF5TGlrZSBBbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCB0byBjb252ZXJ0IHRvIGFuIGFycmF5XG4gKiBAcGFyYW0gW21hcEZ1bmN0aW9uXSBBIG1hcCBmdW5jdGlvbiB0byBjYWxsIG9uIGVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSBbdGhpc0FyZ10gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGZvciB0aGUgbWFwIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIFRoZSBuZXcgQXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb208VD4oYXJyYXlMaWtlOiAoc3RyaW5nIHwgQXJyYXlMaWtlPFQ+KSwgbWFwRnVuY3Rpb24/OiBNYXBDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KTogQXJyYXlMaWtlPFQ+IHtcblx0aWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignZnJvbTogcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvYmplY3QnKTtcblx0fVxuXG5cdGlmIChtYXBGdW5jdGlvbiAmJiB0aGlzQXJnKSB7XG5cdFx0bWFwRnVuY3Rpb24gPSBtYXBGdW5jdGlvbi5iaW5kKHRoaXNBcmcpO1xuXHR9XG5cblx0Y29uc3QgQ29uc3RydWN0b3I6IGFueSA9IHRoaXM7XG5cdGNvbnN0IGl0ZW1zOiBBcnJheUxpa2U8YW55PiA9IE9iamVjdChhcnJheUxpa2UpO1xuXHRjb25zdCBsZW5ndGg6IG51bWJlciA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG5cdC8vIFN1cHBvcnQgZXh0ZW5zaW9uXG5cdGNvbnN0IGFycmF5OiBhbnlbXSA9ICh0eXBlb2YgQ29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicpID8gPGFueVtdPiBPYmplY3QobmV3IENvbnN0cnVjdG9yKGxlbmd0aCkpIDogbmV3IEFycmF5KGxlbmd0aCk7XG5cblx0Zm9yIChsZXQgaSA9IDAsIHZhbHVlOiBhbnk7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdHZhbHVlID0gaXRlbXNbaV07XG5cdFx0YXJyYXlbaV0gPSBtYXBGdW5jdGlvbiA/IG1hcEZ1bmN0aW9uKHZhbHVlLCBpKSA6IHZhbHVlO1xuXHR9XG5cblx0YXJyYXkubGVuZ3RoID0gbGVuZ3RoO1xuXG5cdHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9mKC4uLml0ZW1zOiBhbnlbXSk6IGFueVtdO1xuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGFycmF5IGZyb20gdGhlIGZ1bmN0aW9uIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIGFyZ3VtZW50cyBBbnkgbnVtYmVyIG9mIGFyZ3VtZW50cyBmb3IgdGhlIGFycmF5XG4gKiBAcmV0dXJuIEFuIGFycmF5IGZyb20gdGhlIGdpdmVuIGFyZ3VtZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gb2YoKSB7XG5cdHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIEZpbGxzIGVsZW1lbnRzIG9mIGFuIGFycmF5LWxpa2Ugb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgdG8gZmlsbFxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBmaWxsIGVhY2ggZWxlbWVudCBvZiB0aGUgdGFyZ2V0IHdpdGhcbiAqIEBwYXJhbSBbc3RhcnRdIFRoZSBmaXJzdCBpbmRleCB0byBmaWxsXG4gKiBAcGFyYW0gW2VuZF0gVGhlIChleGNsdXNpdmUpIGluZGV4IGF0IHdoaWNoIHRvIHN0b3AgZmlsbGluZ1xuICogQHJldHVybiBUaGUgZmlsbGVkIHRhcmdldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlsbDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgdmFsdWU6IGFueSwgc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcik6IEFycmF5TGlrZTxUPiB7XG5cdGNvbnN0IGxlbmd0aCA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXHRsZXQgaSA9IG5vcm1hbGl6ZU9mZnNldCh0b0ludGVnZXIoc3RhcnQpLCBsZW5ndGgpO1xuXHRlbmQgPSBub3JtYWxpemVPZmZzZXQoZW5kID8gdG9JbnRlZ2VyKGVuZCkgOiBsZW5ndGgsIGxlbmd0aCk7XG5cblx0d2hpbGUgKGkgPCBlbmQpIHtcblx0XHR0YXJnZXRbaSsrXSA9IHZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBzZWFyY2ggYW5kIHJldHVybnMgdGhlIGZpcnN0IGluZGV4IHdob3NlIHZhbHVlIHNhdGlzZmllcyB0aGUgcGFzc2VkIGNhbGxiYWNrLFxuICogb3IgLTEgaWYgbm8gdmFsdWVzIHNhdGlzZnkgaXQuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBbiBhcnJheS1saWtlIG9iamVjdFxuICogQHBhcmFtIGNhbGxiYWNrIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgaWYgdGhlIGN1cnJlbnQgdmFsdWUgc2F0aXNmaWVzIGl0cyBjcml0ZXJpYVxuICogQHBhcmFtIFt0aGlzQXJnXSBUaGUgZXhlY3V0aW9uIGNvbnRleHQgZm9yIHRoZSBmaW5kIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIFRoZSBmaXJzdCBpbmRleCB3aG9zZSB2YWx1ZSBzYXRpc2ZpZXMgdGhlIHBhc3NlZCBjYWxsYmFjaywgb3IgLTEgaWYgbm8gdmFsdWVzIHNhdGlzZnkgaXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgY2FsbGJhY2s6IEZpbmRDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KTogbnVtYmVyIHtcblx0Y29uc3QgbGVuZ3RoID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cblx0aWYgKCFjYWxsYmFjaykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2ZpbmQ6IHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGlmICh0aGlzQXJnKSB7XG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXNBcmcpO1xuXHR9XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdGlmIChjYWxsYmFjayh0YXJnZXRbaV0sIGksIHRhcmdldCkpIHtcblx0XHRcdHJldHVybiBpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBGaW5kcyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2UgbWF0Y2hpbmcgdGhlIGNhbGxiYWNrIG9yIHVuZGVmaW5lZCBpZiBvbmUgaXMgbm90IGZvdW5kLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQW4gYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHJldHVybmluZyBpZiB0aGUgY3VycmVudCB2YWx1ZSBtYXRjaGVzIGEgY3JpdGVyaWFcbiAqIEBwYXJhbSBbdGhpc0FyZ10gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGZvciB0aGUgZmluZCBmdW5jdGlvblxuICogQHJldHVybiBUaGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgY2FsbGJhY2ssIG9yIHVuZGVmaW5lZCBpZiBvbmUgZG9lcyBub3QgZXhpc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmQ8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIGNhbGxiYWNrOiBGaW5kQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IFQge1xuXHRjb25zdCBpbmRleCA9IGZpbmRJbmRleDxUPih0YXJnZXQsIGNhbGxiYWNrLCB0aGlzQXJnKTtcblx0cmV0dXJuIGluZGV4ICE9PSAtMSA/IHRhcmdldFtpbmRleF0gOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ29waWVzIGRhdGEgaW50ZXJuYWxseSB3aXRoaW4gYW4gYXJyYXkgb3IgYXJyYXktbGlrZSBvYmplY3QuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IGFycmF5LWxpa2Ugb2JqZWN0XG4gKiBAcGFyYW0gb2Zmc2V0IFRoZSBpbmRleCB0byBzdGFydCBjb3B5aW5nIHZhbHVlcyB0bzsgaWYgbmVnYXRpdmUsIGl0IGNvdW50cyBiYWNrd2FyZHMgZnJvbSBsZW5ndGhcbiAqIEBwYXJhbSBzdGFydCBUaGUgZmlyc3QgKGluY2x1c2l2ZSkgaW5kZXggdG8gY29weTsgaWYgbmVnYXRpdmUsIGl0IGNvdW50cyBiYWNrd2FyZHMgZnJvbSBsZW5ndGhcbiAqIEBwYXJhbSBlbmQgVGhlIGxhc3QgKGV4Y2x1c2l2ZSkgaW5kZXggdG8gY29weTsgaWYgbmVnYXRpdmUsIGl0IGNvdW50cyBiYWNrd2FyZHMgZnJvbSBsZW5ndGhcbiAqIEByZXR1cm4gVGhlIHRhcmdldFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weVdpdGhpbjxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgb2Zmc2V0OiBudW1iZXIsIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheUxpa2U8VD4ge1xuXHRpZiAodGFyZ2V0ID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdjb3B5V2l0aGluOiB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheS1saWtlIG9iamVjdCcpO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cdG9mZnNldCA9IG5vcm1hbGl6ZU9mZnNldCh0b0ludGVnZXIob2Zmc2V0KSwgbGVuZ3RoKTtcblx0c3RhcnQgPSBub3JtYWxpemVPZmZzZXQodG9JbnRlZ2VyKHN0YXJ0KSwgbGVuZ3RoKTtcblx0ZW5kID0gbm9ybWFsaXplT2Zmc2V0KGVuZCA/IHRvSW50ZWdlcihlbmQpIDogbGVuZ3RoLCBsZW5ndGgpO1xuXHRsZXQgY291bnQgPSBNYXRoLm1pbihlbmQgLSBzdGFydCwgbGVuZ3RoIC0gb2Zmc2V0KTtcblxuXHRsZXQgZGlyZWN0aW9uID0gMTtcblx0aWYgKG9mZnNldCA+IHN0YXJ0ICYmIG9mZnNldCA8IChzdGFydCArIGNvdW50KSkge1xuXHRcdGRpcmVjdGlvbiA9IC0xO1xuXHRcdHN0YXJ0ICs9IGNvdW50IC0gMTtcblx0XHRvZmZzZXQgKz0gY291bnQgLSAxO1xuXHR9XG5cblx0d2hpbGUgKGNvdW50ID4gMCkge1xuXHRcdGlmIChzdGFydCBpbiB0YXJnZXQpIHtcblx0XHRcdHRhcmdldFtvZmZzZXRdID0gdGFyZ2V0W3N0YXJ0XTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkZWxldGUgdGFyZ2V0W29mZnNldF07XG5cdFx0fVxuXG5cdFx0b2Zmc2V0ICs9IGRpcmVjdGlvbjtcblx0XHRzdGFydCArPSBkaXJlY3Rpb247XG5cdFx0Y291bnQtLTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG4iXX0=