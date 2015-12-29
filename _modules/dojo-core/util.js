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
     * Wraps a setTimeout call in a handle, allowing the timeout to be cleared by calling destroy.
     *
     * @param callback Callback to be called when the timeout elapses
     * @param delay Number of milliseconds to wait before calling the callback
     * @return Handle which can be destroyed to clear the timeout
     */
    function createTimer(callback, delay) {
        var timerId = setTimeout(callback, delay);
        return lang_1.createHandle(function () {
            clearTimeout(timerId);
            timerId = null;
        });
    }
    exports.createTimer = createTimer;
    /**
     * Wraps a callback, returning a function which fires after no further calls are received over a set interval.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait after any invocations before calling the original callback
     * @return Debounced function
     */
    function debounce(callback, delay) {
        // node.d.ts clobbers setTimeout/clearTimeout with versions that return/receive NodeJS.Timer,
        // but browsers return/receive a number
        var timer;
        return function () {
            timer && clearTimeout(timer);
            var context = this;
            var args = arguments;
            timer = setTimeout(function () {
                callback.apply(context, args);
                args = context = timer = null;
            }, delay);
        };
    }
    exports.debounce = debounce;
    /**
     * Wraps a callback, returning a function which fires at most once per set interval.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait before allowing the original callback to be called again
     * @return Throttled function
     */
    function throttle(callback, delay) {
        var ran;
        return function () {
            if (ran) {
                return;
            }
            ran = true;
            callback.apply(this, arguments);
            setTimeout(function () {
                ran = null;
            }, delay);
        };
    }
    exports.throttle = throttle;
    /**
     * Like throttle, but calls the callback at the end of each interval rather than the beginning.
     * Useful for e.g. resize or scroll events, when debounce would appear unresponsive.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait before calling the original callback and allowing it to be called again
     * @return Throttled function
     */
    function throttleAfter(callback, delay) {
        var ran;
        return function () {
            if (ran) {
                return;
            }
            ran = true;
            var context = this;
            var args = arguments;
            setTimeout(function () {
                callback.apply(context, args);
                args = context = ran = null;
            }, delay);
        };
    }
    exports.throttleAfter = throttleAfter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbImNyZWF0ZVRpbWVyIiwiZGVib3VuY2UiLCJ0aHJvdHRsZSIsInRocm90dGxlQWZ0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQ0EscUJBQTZCLFFBQVEsQ0FBQyxDQUFBO0lBRXRDOzs7Ozs7T0FNRztJQUNILHFCQUE0QixRQUFrQyxFQUFFLEtBQWM7UUFDN0VBLElBQUlBLE9BQU9BLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBRTFDQSxNQUFNQSxDQUFDQSxtQkFBWUEsQ0FBQ0E7WUFDbkIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQVBlLG1CQUFXLGNBTzFCLENBQUE7SUFFRDs7Ozs7O09BTUc7SUFDSCxrQkFBNkQsUUFBVyxFQUFFLEtBQWE7UUFDdEZDLDZGQUE2RkE7UUFDN0ZBLHVDQUF1Q0E7UUFDdkNBLElBQUlBLEtBQVVBLENBQUNBO1FBRWZBLE1BQU1BLENBQUtBO1lBQ1YsS0FBSyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU3QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBRXJCLEtBQUssR0FBRyxVQUFVLENBQUM7Z0JBQ2xCLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDQTtJQUNIQSxDQUFDQTtJQWhCZSxnQkFBUSxXQWdCdkIsQ0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNILGtCQUE2RCxRQUFXLEVBQUUsS0FBYTtRQUN0RkMsSUFBSUEsR0FBWUEsQ0FBQ0E7UUFFakJBLE1BQU1BLENBQUtBO1lBQ1YsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUM7WUFDUixDQUFDO1lBRUQsR0FBRyxHQUFHLElBQUksQ0FBQztZQUVYLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLFVBQVUsQ0FBQztnQkFDVixHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ1osQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDQTtJQUNIQSxDQUFDQTtJQWZlLGdCQUFRLFdBZXZCLENBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsdUJBQWtFLFFBQVcsRUFBRSxLQUFhO1FBQzNGQyxJQUFJQSxHQUFZQSxDQUFDQTtRQUVqQkEsTUFBTUEsQ0FBS0E7WUFDVixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQztZQUNSLENBQUM7WUFFRCxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBRVgsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUVyQixVQUFVLENBQUM7Z0JBQ1YsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLElBQUksR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztZQUM3QixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUNBO0lBQ0hBLENBQUNBO0lBbEJlLHFCQUFhLGdCQWtCNUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBjcmVhdGVIYW5kbGUgfSBmcm9tICcuL2xhbmcnO1xuXG4vKipcbiAqIFdyYXBzIGEgc2V0VGltZW91dCBjYWxsIGluIGEgaGFuZGxlLCBhbGxvd2luZyB0aGUgdGltZW91dCB0byBiZSBjbGVhcmVkIGJ5IGNhbGxpbmcgZGVzdHJveS5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHRpbWVvdXQgZWxhcHNlc1xuICogQHBhcmFtIGRlbGF5IE51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgY2FsbGluZyB0aGUgY2FsbGJhY2tcbiAqIEByZXR1cm4gSGFuZGxlIHdoaWNoIGNhbiBiZSBkZXN0cm95ZWQgdG8gY2xlYXIgdGhlIHRpbWVvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRpbWVyKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQsIGRlbGF5PzogbnVtYmVyKTogSGFuZGxlIHtcblx0bGV0IHRpbWVySWQgPSBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkZWxheSk7XG5cblx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuXHRcdHRpbWVySWQgPSBudWxsO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIGNhbGxiYWNrLCByZXR1cm5pbmcgYSBmdW5jdGlvbiB3aGljaCBmaXJlcyBhZnRlciBubyBmdXJ0aGVyIGNhbGxzIGFyZSByZWNlaXZlZCBvdmVyIGEgc2V0IGludGVydmFsLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFjayBDYWxsYmFjayB0byB3cmFwXG4gKiBAcGFyYW0gZGVsYXkgTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGFmdGVyIGFueSBpbnZvY2F0aW9ucyBiZWZvcmUgY2FsbGluZyB0aGUgb3JpZ2luYWwgY2FsbGJhY2tcbiAqIEByZXR1cm4gRGVib3VuY2VkIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihjYWxsYmFjazogVCwgZGVsYXk6IG51bWJlcik6IFQge1xuXHQvLyBub2RlLmQudHMgY2xvYmJlcnMgc2V0VGltZW91dC9jbGVhclRpbWVvdXQgd2l0aCB2ZXJzaW9ucyB0aGF0IHJldHVybi9yZWNlaXZlIE5vZGVKUy5UaW1lcixcblx0Ly8gYnV0IGJyb3dzZXJzIHJldHVybi9yZWNlaXZlIGEgbnVtYmVyXG5cdGxldCB0aW1lcjogYW55O1xuXG5cdHJldHVybiA8VD4gZnVuY3Rpb24gKCkge1xuXHRcdHRpbWVyICYmIGNsZWFyVGltZW91dCh0aW1lcik7XG5cblx0XHRsZXQgY29udGV4dCA9IHRoaXM7XG5cdFx0bGV0IGFyZ3MgPSBhcmd1bWVudHM7XG5cblx0XHR0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0Y2FsbGJhY2suYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdFx0XHRhcmdzID0gY29udGV4dCA9IHRpbWVyID0gbnVsbDtcblx0XHR9LCBkZWxheSk7XG5cdH07XG59XG5cbi8qKlxuICogV3JhcHMgYSBjYWxsYmFjaywgcmV0dXJuaW5nIGEgZnVuY3Rpb24gd2hpY2ggZmlyZXMgYXQgbW9zdCBvbmNlIHBlciBzZXQgaW50ZXJ2YWwuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIENhbGxiYWNrIHRvIHdyYXBcbiAqIEBwYXJhbSBkZWxheSBOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGFsbG93aW5nIHRoZSBvcmlnaW5hbCBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWdhaW5cbiAqIEByZXR1cm4gVGhyb3R0bGVkIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvdHRsZTxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihjYWxsYmFjazogVCwgZGVsYXk6IG51bWJlcik6IFQge1xuXHRsZXQgcmFuOiBib29sZWFuO1xuXG5cdHJldHVybiA8VD4gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChyYW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRyYW4gPSB0cnVlO1xuXG5cdFx0Y2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHJhbiA9IG51bGw7XG5cdFx0fSwgZGVsYXkpO1xuXHR9O1xufVxuXG4vKipcbiAqIExpa2UgdGhyb3R0bGUsIGJ1dCBjYWxscyB0aGUgY2FsbGJhY2sgYXQgdGhlIGVuZCBvZiBlYWNoIGludGVydmFsIHJhdGhlciB0aGFuIHRoZSBiZWdpbm5pbmcuXG4gKiBVc2VmdWwgZm9yIGUuZy4gcmVzaXplIG9yIHNjcm9sbCBldmVudHMsIHdoZW4gZGVib3VuY2Ugd291bGQgYXBwZWFyIHVucmVzcG9uc2l2ZS5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gd3JhcFxuICogQHBhcmFtIGRlbGF5IE51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgY2FsbGluZyB0aGUgb3JpZ2luYWwgY2FsbGJhY2sgYW5kIGFsbG93aW5nIGl0IHRvIGJlIGNhbGxlZCBhZ2FpblxuICogQHJldHVybiBUaHJvdHRsZWQgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRocm90dGxlQWZ0ZXI8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oY2FsbGJhY2s6IFQsIGRlbGF5OiBudW1iZXIpOiBUIHtcblx0bGV0IHJhbjogYm9vbGVhbjtcblxuXHRyZXR1cm4gPFQ+IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAocmFuKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmFuID0gdHJ1ZTtcblxuXHRcdGxldCBjb250ZXh0ID0gdGhpcztcblx0XHRsZXQgYXJncyA9IGFyZ3VtZW50cztcblxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0Y2FsbGJhY2suYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdFx0XHRhcmdzID0gY29udGV4dCA9IHJhbiA9IG51bGw7XG5cdFx0fSwgZGVsYXkpO1xuXHR9O1xufVxuIl19