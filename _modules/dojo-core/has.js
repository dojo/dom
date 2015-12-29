(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './global'], factory);
    }
})(function (require, exports) {
    var global_1 = require('./global');
    exports.cache = Object.create(null);
    var testFunctions = Object.create(null);
    /**
     * Register a new test for a named feature.
     *
     * @example
     * has.add('dom-addeventlistener', !!document.addEventListener);
     *
     * @example
     * has.add('touch-events', function () {
     *    return 'ontouchstart' in document
     * });
     */
    function add(feature, value, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        if ((feature in exports.cache || feature in testFunctions) && !overwrite) {
            return;
        }
        if (typeof value === 'function') {
            testFunctions[feature] = value;
        }
        else {
            exports.cache[feature] = value;
        }
    }
    exports.add = add;
    /**
     * Return the current value of a named feature.
     *
     * @param feature The name (if a string) or identifier (if an integer) of the feature to test.
     * @return The value of a given feature test
     */
    function has(feature) {
        var result;
        if (testFunctions[feature]) {
            result = exports.cache[feature] = testFunctions[feature].call(null);
            testFunctions[feature] = null;
        }
        else {
            result = exports.cache[feature];
        }
        return result;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = has;
    /*
     * OOTB feature tests
     */
    add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
    add('host-node', function () {
        if (typeof process === 'object' && process.versions && process.versions.node) {
            return process.versions.node;
        }
    });
    add('float32array', 'Float32Array' in global_1.default);
    add('setimmediate', typeof global_1.default.setImmediate !== 'undefined');
    add('dom-mutationobserver', function () {
        return has('host-browser') && Boolean(global_1.default.MutationObserver || global_1.default.WebKitMutationObserver);
    });
    add('microtasks', function () {
        return has('promise') || has('host-node') || has('dom-mutationobserver');
    });
    add('object-assign', typeof Object.assign === 'function');
    add('object-observe', typeof Object.observe === 'function');
    add('postmessage', typeof postMessage === 'function');
    add('promise', typeof global_1.default.Promise !== 'undefined');
    add('raf', typeof requestAnimationFrame === 'function');
    add('weakmap', function () {
        if (typeof global_1.default.WeakMap !== 'undefined') {
            var key1 = {};
            var key2 = {};
            var map = new global_1.default.WeakMap([[key1, 1]]);
            return map.get(key1) === 1 && map.set(key2, 2) === map;
        }
        return false;
    });
    add('arraybuffer', typeof global_1.default.ArrayBuffer !== 'undefined');
    add('formdata', typeof global_1.default.FormData !== 'undefined');
    add('xhr', typeof global_1.default.XMLHttpRequest !== 'undefined');
    add('xhr2', has('xhr') && 'responseType' in global_1.default.XMLHttpRequest.prototype);
    add('xhr2-blob', function () {
        if (!has('xhr2')) {
            return false;
        }
        var request = new XMLHttpRequest();
        request.open('GET', '/', true);
        request.responseType = 'blob';
        request.abort();
        return request.responseType === 'blob';
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hhcy50cyJdLCJuYW1lcyI6WyJhZGQiLCJoYXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsdUJBQW1CLFVBQVUsQ0FBQyxDQUFBO0lBRWpCLGFBQUssR0FBYyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BELElBQU0sYUFBYSxHQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNEOzs7Ozs7Ozs7O09BVUc7SUFDSCxhQUFvQixPQUFlLEVBQUUsS0FBVSxFQUFFLFNBQTBCO1FBQTFCQSx5QkFBMEJBLEdBQTFCQSxpQkFBMEJBO1FBQzFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxhQUFLQSxJQUFJQSxPQUFPQSxJQUFJQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsRUEsTUFBTUEsQ0FBQ0E7UUFDUkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNMQSxhQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFYZSxXQUFHLE1BV2xCLENBQUE7SUFFRDs7Ozs7T0FLRztJQUNILGFBQTRCLE9BQWU7UUFDMUNDLElBQUlBLE1BQVdBLENBQUNBO1FBRWhCQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsR0FBR0EsYUFBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0Es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TyxnQkFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQztJQUN4RCxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sZ0JBQU0sQ0FBQyxjQUFjLEtBQUssV0FBVyxDQUFDLENBQUM7SUFDekQsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksY0FBYyxJQUFJLGdCQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdFLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBTSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDOUIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IHsgSGFzaCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgY29uc3QgY2FjaGU6IEhhc2g8YW55PiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5jb25zdCB0ZXN0RnVuY3Rpb25zOiBIYXNoPCgpID0+IGFueT4gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IHRlc3QgZm9yIGEgbmFtZWQgZmVhdHVyZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaGFzLmFkZCgnZG9tLWFkZGV2ZW50bGlzdGVuZXInLCAhIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpO1xuICpcbiAqIEBleGFtcGxlXG4gKiBoYXMuYWRkKCd0b3VjaC1ldmVudHMnLCBmdW5jdGlvbiAoKSB7XG4gKiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnRcbiAqIH0pO1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKGZlYXR1cmU6IHN0cmluZywgdmFsdWU6IGFueSwgb3ZlcndyaXRlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcblx0aWYgKChmZWF0dXJlIGluIGNhY2hlIHx8IGZlYXR1cmUgaW4gdGVzdEZ1bmN0aW9ucykgJiYgIW92ZXJ3cml0ZSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHR0ZXN0RnVuY3Rpb25zW2ZlYXR1cmVdID0gdmFsdWU7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y2FjaGVbZmVhdHVyZV0gPSB2YWx1ZTtcblx0fVxufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCB2YWx1ZSBvZiBhIG5hbWVkIGZlYXR1cmUuXG4gKlxuICogQHBhcmFtIGZlYXR1cmUgVGhlIG5hbWUgKGlmIGEgc3RyaW5nKSBvciBpZGVudGlmaWVyIChpZiBhbiBpbnRlZ2VyKSBvZiB0aGUgZmVhdHVyZSB0byB0ZXN0LlxuICogQHJldHVybiBUaGUgdmFsdWUgb2YgYSBnaXZlbiBmZWF0dXJlIHRlc3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzKGZlYXR1cmU6IHN0cmluZyk6IGFueSB7XG5cdGxldCByZXN1bHQ6IGFueTtcblxuXHRpZiAodGVzdEZ1bmN0aW9uc1tmZWF0dXJlXSkge1xuXHRcdHJlc3VsdCA9IGNhY2hlW2ZlYXR1cmVdID0gdGVzdEZ1bmN0aW9uc1tmZWF0dXJlXS5jYWxsKG51bGwpO1xuXHRcdHRlc3RGdW5jdGlvbnNbZmVhdHVyZV0gPSBudWxsO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJlc3VsdCA9IGNhY2hlW2ZlYXR1cmVdO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIE9PVEIgZmVhdHVyZSB0ZXN0c1xuICovXG5hZGQoJ2hvc3QtYnJvd3NlcicsIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ2hvc3Qtbm9kZScsIGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xuXHRcdHJldHVybiBwcm9jZXNzLnZlcnNpb25zLm5vZGU7XG5cdH1cbn0pO1xuYWRkKCdmbG9hdDMyYXJyYXknLCAnRmxvYXQzMkFycmF5JyBpbiBnbG9iYWwpO1xuYWRkKCdzZXRpbW1lZGlhdGUnLCB0eXBlb2YgZ2xvYmFsLnNldEltbWVkaWF0ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuYWRkKCdkb20tbXV0YXRpb25vYnNlcnZlcicsIGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gaGFzKCdob3N0LWJyb3dzZXInKSAmJiBCb29sZWFuKGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyKTtcbn0pO1xuYWRkKCdtaWNyb3Rhc2tzJywgZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gaGFzKCdwcm9taXNlJykgfHwgaGFzKCdob3N0LW5vZGUnKSB8fCBoYXMoJ2RvbS1tdXRhdGlvbm9ic2VydmVyJyk7XG59KTtcbmFkZCgnb2JqZWN0LWFzc2lnbicsIHR5cGVvZiAoPGFueT4gT2JqZWN0KS5hc3NpZ24gPT09ICdmdW5jdGlvbicpO1xuYWRkKCdvYmplY3Qtb2JzZXJ2ZScsIHR5cGVvZiAoPGFueT4gT2JqZWN0KS5vYnNlcnZlID09PSAnZnVuY3Rpb24nKTtcbmFkZCgncG9zdG1lc3NhZ2UnLCB0eXBlb2YgcG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbicpO1xuYWRkKCdwcm9taXNlJywgdHlwZW9mIGdsb2JhbC5Qcm9taXNlICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ3JhZicsIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicpO1xuYWRkKCd3ZWFrbWFwJywgZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbC5XZWFrTWFwICE9PSAndW5kZWZpbmVkJykge1xuXHRcdGNvbnN0IGtleTEgPSB7fTtcblx0XHRjb25zdCBrZXkyID0ge307XG5cdFx0Y29uc3QgbWFwID0gbmV3IGdsb2JhbC5XZWFrTWFwKFsgWyBrZXkxLCAxIF0gXSk7XG5cdFx0cmV0dXJuIG1hcC5nZXQoa2V5MSkgPT09IDEgJiYgbWFwLnNldChrZXkyLCAyKSA9PT0gbWFwO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuYWRkKCdhcnJheWJ1ZmZlcicsIHR5cGVvZiBnbG9iYWwuQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKTtcbmFkZCgnZm9ybWRhdGEnLCB0eXBlb2YgZ2xvYmFsLkZvcm1EYXRhICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ3hocicsIHR5cGVvZiBnbG9iYWwuWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKTtcbmFkZCgneGhyMicsIGhhcygneGhyJykgJiYgJ3Jlc3BvbnNlVHlwZScgaW4gZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSk7XG5hZGQoJ3hocjItYmxvYicsIGZ1bmN0aW9uICgpIHtcblx0aWYgKCFoYXMoJ3hocjInKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0cmVxdWVzdC5vcGVuKCdHRVQnLCAnLycsIHRydWUpO1xuXHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdibG9iJztcblx0cmVxdWVzdC5hYm9ydCgpO1xuXHRyZXR1cm4gcmVxdWVzdC5yZXNwb25zZVR5cGUgPT09ICdibG9iJztcbn0pO1xuIl19