var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    /**
     * Used for delaying a Promise chain for a specific number of milliseconds.
     *
     * @param milliseconds the number of milliseconds to delay
     * @return {function(T): Promise<T>} a function producing a promise that eventually returns the value passed to it; usable with Thenable.then()
     */
    function delay(milliseconds) {
        return function (value) {
            return new Promise_1.default(function (resolve) {
                setTimeout(function () {
                    resolve(value);
                }, milliseconds);
            });
        };
    }
    exports.delay = delay;
    /**
     * Reject a promise chain if a result hasn't been found before the timeout
     *
     * @param milliseconds after this number of milliseconds a rejection will be returned
     * @param reason The reason for the rejection
     * @return {function(T): Promise<T>} a function that produces a promise that is rejected or resolved based on your timeout
     */
    function timeout(milliseconds, reason) {
        var start = Date.now();
        return function (value) {
            if (Date.now() - milliseconds > start) {
                return Promise_1.default.reject(reason);
            }
            return Promise_1.default.resolve(value);
        };
    }
    exports.timeout = timeout;
    /**
     * A Promise that will reject itself automatically after a time.
     * Useful for combining with other promises in Promise.race.
     */
    var DelayedRejection = (function (_super) {
        __extends(DelayedRejection, _super);
        /**
         * @param milliseconds the number of milliseconds to wait before triggering a rejection
         * @param reason the reason for the rejection
         */
        function DelayedRejection(milliseconds, reason) {
            _super.call(this, function (resolve, reject) {
                setTimeout(reason ? reject.bind(this, reason) : reject.bind(this), milliseconds);
            });
        }
        return DelayedRejection;
    })(Promise_1.default);
    exports.DelayedRejection = DelayedRejection;
    ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FzeW5jL3RpbWluZy50cyJdLCJuYW1lcyI6WyJkZWxheSIsInRpbWVvdXQiLCJEZWxheWVkUmVqZWN0aW9uIiwiRGVsYXllZFJlamVjdGlvbi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBLHdCQUFvQixZQUFZLENBQUMsQ0FBQTtJQUVqQzs7Ozs7T0FLRztJQUNILGVBQXlCLFlBQW9CO1FBQzVDQSxNQUFNQSxDQUFDQSxVQUFVQSxLQUFRQTtZQUN4QixNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLFVBQVUsT0FBTztnQkFDbkMsVUFBVSxDQUFDO29CQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDQTtJQUNIQSxDQUFDQTtJQVJlLGFBQUssUUFRcEIsQ0FBQTtJQU1EOzs7Ozs7T0FNRztJQUNILGlCQUEyQixZQUFvQixFQUFFLE1BQWE7UUFDN0RDLElBQU1BLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3pCQSxNQUFNQSxDQUFDQSxVQUFVQSxLQUFRQTtZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBSSxNQUFNLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxDQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFSZSxlQUFPLFVBUXRCLENBQUE7SUFFRDs7O09BR0c7SUFDSDtRQUFzQ0Msb0NBQVlBO1FBQ2pEQTs7O1dBR0dBO1FBQ0hBLDBCQUFZQSxZQUFvQkEsRUFBRUEsTUFBY0E7WUFDL0NDLGtCQUFNQSxVQUFVQSxPQUFPQSxFQUFFQSxNQUFNQTtnQkFDOUIsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSkEsQ0FBQ0E7UUFDRkQsdUJBQUNBO0lBQURBLENBQUNBLEFBVkQsRUFBc0MsaUJBQU8sRUFVNUM7SUFWWSx3QkFBZ0IsbUJBVTVCLENBQUE7SUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5cbi8qKlxuICogVXNlZCBmb3IgZGVsYXlpbmcgYSBQcm9taXNlIGNoYWluIGZvciBhIHNwZWNpZmljIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIG1pbGxpc2Vjb25kcyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheVxuICogQHJldHVybiB7ZnVuY3Rpb24oVCk6IFByb21pc2U8VD59IGEgZnVuY3Rpb24gcHJvZHVjaW5nIGEgcHJvbWlzZSB0aGF0IGV2ZW50dWFsbHkgcmV0dXJucyB0aGUgdmFsdWUgcGFzc2VkIHRvIGl0OyB1c2FibGUgd2l0aCBUaGVuYWJsZS50aGVuKClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGF5PFQ+KG1pbGxpc2Vjb25kczogbnVtYmVyKTogSWRlbnRpdHk8VD4ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKHZhbHVlOiBUKTogUHJvbWlzZTxUPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmVzb2x2ZSh2YWx1ZSk7XG5cdFx0XHR9LCBtaWxsaXNlY29uZHMpO1xuXHRcdH0pO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElkZW50aXR5PFQ+IHtcblx0KHZhbHVlOiBUKTogUHJvbWlzZTxUPjtcbn1cblxuLyoqXG4gKiBSZWplY3QgYSBwcm9taXNlIGNoYWluIGlmIGEgcmVzdWx0IGhhc24ndCBiZWVuIGZvdW5kIGJlZm9yZSB0aGUgdGltZW91dFxuICpcbiAqIEBwYXJhbSBtaWxsaXNlY29uZHMgYWZ0ZXIgdGhpcyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGEgcmVqZWN0aW9uIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEBwYXJhbSByZWFzb24gVGhlIHJlYXNvbiBmb3IgdGhlIHJlamVjdGlvblxuICogQHJldHVybiB7ZnVuY3Rpb24oVCk6IFByb21pc2U8VD59IGEgZnVuY3Rpb24gdGhhdCBwcm9kdWNlcyBhIHByb21pc2UgdGhhdCBpcyByZWplY3RlZCBvciByZXNvbHZlZCBiYXNlZCBvbiB5b3VyIHRpbWVvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVvdXQ8VD4obWlsbGlzZWNvbmRzOiBudW1iZXIsIHJlYXNvbjogRXJyb3IpOiBJZGVudGl0eTxUPiB7XG5cdGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcblx0cmV0dXJuIGZ1bmN0aW9uICh2YWx1ZTogVCk6IFByb21pc2U8VD4ge1xuXHRcdGlmIChEYXRlLm5vdygpIC0gbWlsbGlzZWNvbmRzID4gc3RhcnQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdDxUPihyZWFzb24pO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlPFQ+KHZhbHVlKTtcblx0fTtcbn1cblxuLyoqXG4gKiBBIFByb21pc2UgdGhhdCB3aWxsIHJlamVjdCBpdHNlbGYgYXV0b21hdGljYWxseSBhZnRlciBhIHRpbWUuXG4gKiBVc2VmdWwgZm9yIGNvbWJpbmluZyB3aXRoIG90aGVyIHByb21pc2VzIGluIFByb21pc2UucmFjZS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlbGF5ZWRSZWplY3Rpb24gZXh0ZW5kcyBQcm9taXNlPGFueT4ge1xuXHQvKipcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kcyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSB0cmlnZ2VyaW5nIGEgcmVqZWN0aW9uXG5cdCAqIEBwYXJhbSByZWFzb24gdGhlIHJlYXNvbiBmb3IgdGhlIHJlamVjdGlvblxuXHQgKi9cblx0Y29uc3RydWN0b3IobWlsbGlzZWNvbmRzOiBudW1iZXIsIHJlYXNvbj86IEVycm9yKSB7XG5cdFx0c3VwZXIoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0c2V0VGltZW91dChyZWFzb24gPyByZWplY3QuYmluZCh0aGlzLCByZWFzb24pIDogcmVqZWN0LmJpbmQodGhpcyksIG1pbGxpc2Vjb25kcyk7XG5cdFx0fSk7XG5cdH1cbn07XG4iXX0=