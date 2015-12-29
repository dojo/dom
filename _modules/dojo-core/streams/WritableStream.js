(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './SizeQueue', './util'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var SizeQueue_1 = require('./SizeQueue');
    var util = require('./util');
    /**
     * WritableStream's possible states
     */
    (function (State) {
        State[State["Closed"] = 0] = "Closed";
        State[State["Closing"] = 1] = "Closing";
        State[State["Errored"] = 2] = "Errored";
        State[State["Waiting"] = 3] = "Waiting";
        State[State["Writable"] = 4] = "Writable";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    // This function is basically a context check to protect against calling WritableStream methods with incorrect context
    // (as one might accidentally do when passing a method as callback)
    function isWritableStream(x) {
        return Object.prototype.hasOwnProperty.call(x, '_underlyingSink');
    }
    /**
     * This class provides a writable stream implementation. Data written to a stream will be passed on to the underlying
     * sink (`WritableStream.Sink`), an instance of which must be supplied to the stream upon instantation. This class
     * provides the standard stream API, while implementations of the `Sink` API allow the data to be written to
     * various persistence layers.
     */
    var WritableStream = (function () {
        function WritableStream(underlyingSink, strategy) {
            var _this = this;
            if (underlyingSink === void 0) { underlyingSink = {}; }
            if (strategy === void 0) { strategy = {}; }
            this._underlyingSink = underlyingSink;
            this._closedPromise = new Promise_1.default(function (resolve, reject) {
                _this._resolveClosedPromise = resolve;
                _this._rejectClosedPromise = reject;
            });
            this._advancing = false;
            this._readyPromise = Promise_1.default.resolve();
            this._queue = new SizeQueue_1.default();
            this._state = State.Writable;
            this._started = false;
            this._writing = false;
            this._strategy = util.normalizeStrategy(strategy);
            this._syncStateWithQueue();
            this._startedPromise = Promise_1.default.resolve(util.invokeOrNoop(this._underlyingSink, 'start', [this._error.bind(this)])).then(function () {
                _this._started = true;
                _this._startedPromise = undefined;
            }, function (error) {
                _this._error(error);
            });
        }
        Object.defineProperty(WritableStream.prototype, "closed", {
            /**
             * @returns A promise that is resolved when the stream is closed, or is rejected if the stream errors.
             */
            get: function () {
                return this._closedPromise;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WritableStream.prototype, "ready", {
            /**
             * @returns A promise that is resolved when the stream transitions away from the 'waiting' state. The stream will
             * use this to indicate backpressure - an unresolved `ready` promise indicates that writes should not yet be
             * performed.
             */
            get: function () {
                return this._readyPromise;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WritableStream.prototype, "state", {
            /**
             * @returns The stream's current @State
             */
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        // This method combines the logic of two methods:
        // 4.3.1 CallOrScheduleWritableStreamAdvanceQueue
        // 4.3.6 WritableStreamAdvanceQueue
        WritableStream.prototype._advanceQueue = function () {
            var _this = this;
            if (!this._started) {
                if (!this._advancing) {
                    this._advancing = true;
                    this._startedPromise.then(function () {
                        _this._advanceQueue();
                    });
                }
                return;
            }
            if (!this._queue || this._writing) {
                return;
            }
            var writeRecord = this._queue.peek();
            if (writeRecord.close) {
                // TODO: SKIP? Assert 4.3.6-3.a
                if (this.state !== State.Closing) {
                    throw new Error('Invalid record');
                }
                this._queue.dequeue();
                // TODO: SKIP? Assert 4.3.6-3.c
                this._close();
                return;
            }
            this._writing = true;
            util.promiseInvokeOrNoop(this._underlyingSink, 'write', [writeRecord.chunk]).then(function () {
                if (_this.state !== State.Errored) {
                    _this._writing = false;
                    writeRecord.resolve();
                    _this._queue.dequeue();
                    try {
                        _this._syncStateWithQueue();
                    }
                    catch (error) {
                        return _this._error(error);
                    }
                    _this._advanceQueue();
                }
            }, function (error) {
                _this._error(error);
            });
        };
        // 4.3.2 CloseWritableStream
        WritableStream.prototype._close = function () {
            var _this = this;
            if (this.state !== State.Closing) {
                // 4.3.2-1
                throw new Error('WritableStream#_close called while state is not "Closing"');
            }
            util.promiseInvokeOrNoop(this._underlyingSink, 'close').then(function () {
                if (_this.state !== State.Errored) {
                    // TODO: Assert 4.3.2.2-a.ii
                    _this._resolveClosedPromise();
                    _this._state = State.Closed;
                    _this._underlyingSink = undefined;
                }
            }, function (error) {
                _this._error(error);
            });
        };
        // 4.3.3 ErrorWritableStream
        WritableStream.prototype._error = function (error) {
            if (this.state === State.Closed || this.state === State.Errored) {
                return;
            }
            var writeRecord;
            while (this._queue.length) {
                writeRecord = this._queue.dequeue();
                if (!writeRecord.close) {
                    writeRecord.reject(error);
                }
            }
            this._storedError = error;
            if (this.state === State.Waiting) {
                this._resolveReadyPromise();
            }
            this._rejectClosedPromise(error);
            this._state = State.Errored;
        };
        // 4.3.5 SyncWritableStreamStateWithQueue
        WritableStream.prototype._syncStateWithQueue = function () {
            var _this = this;
            if (this.state === State.Closing) {
                return;
            }
            var queueSize = this._queue.totalSize;
            var shouldApplyBackPressure = queueSize > this._strategy.highWaterMark;
            if (shouldApplyBackPressure && this.state === State.Writable) {
                this._state = State.Waiting;
                this._readyPromise = new Promise_1.default(function (resolve, reject) {
                    _this._resolveReadyPromise = resolve;
                    _this._rejectReadyPromise = reject;
                });
            }
            if (shouldApplyBackPressure === false && this.state === State.Waiting) {
                this._state = State.Writable;
                this._resolveReadyPromise();
            }
        };
        /**
         * Signals that the producer can no longer write to the stream and it should be immediately moved to an "errored"
         * state. Any un-written data that is queued will be discarded.
         */
        WritableStream.prototype.abort = function (reason) {
            // 4.2.4.4-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            if (this.state === State.Closed) {
                // 4.2.4.4-2
                return Promise_1.default.resolve();
            }
            if (this.state === State.Errored) {
                // 4.2.4.4-3
                return Promise_1.default.reject(this._storedError);
            }
            var error = reason instanceof Error ? reason : new Error(reason);
            this._error(error);
            return util.promiseInvokeOrFallbackOrNoop(this._underlyingSink, 'abort', [reason], 'close')
                .then(function () {
                return;
            });
        };
        /**
         * Signals that the producer is done writing to the stream and wishes to move it to a "closed" state. The stream
         * may have un-writted data queued; until the data has been written the stream will remain in the "closing" state.
         */
        WritableStream.prototype.close = function () {
            // 4.2.4.5-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            // 4.2.4.5-2
            if (this.state === State.Closed) {
                return Promise_1.default.reject(new TypeError('Stream is already closed'));
            }
            if (this.state === State.Closing) {
                return Promise_1.default.reject(new TypeError('Stream is already closing'));
            }
            if (this.state === State.Errored) {
                // 4.2.4.5-3
                return Promise_1.default.reject(this._storedError);
            }
            if (this.state === State.Waiting) {
                // 4.2.4.5-4
                this._resolveReadyPromise();
            }
            this._state = State.Closing;
            this._queue.enqueue({ close: true }, 0);
            this._advanceQueue();
            return this._closedPromise;
        };
        /**
         * Enqueue a chunk of data to be written to the underlying sink. `write` can be called successively without waiting
         * for the previous write's promise to resolve. To respect the stream's backpressure indicator, check if the stream
         * has entered the "waiting" state between writes.
         *
         * @returns A promise that will be fulfilled when the chunk has been written to the underlying sink.
         */
        WritableStream.prototype.write = function (chunk) {
            // 4.2.4.6-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            // 4.2.4.6-2
            if (this.state === State.Closed) {
                return Promise_1.default.reject(new TypeError('Stream is closed'));
            }
            if (this.state === State.Closing) {
                return Promise_1.default.reject(new TypeError('Stream is closing'));
            }
            if (this.state === State.Errored) {
                // 4.2.4.6-3
                return Promise_1.default.reject(this._storedError);
            }
            var chunkSize = 1;
            var writeRecord;
            var promise = new Promise_1.default(function (resolve, reject) {
                writeRecord = {
                    chunk: chunk,
                    reject: reject,
                    resolve: resolve
                };
            });
            // 4.2.4.6-6.b
            try {
                if (this._strategy && this._strategy.size) {
                    chunkSize = this._strategy.size(chunk);
                }
                this._queue.enqueue(writeRecord, chunkSize);
                this._syncStateWithQueue();
            }
            catch (error) {
                // 4.2.4.6-6.b, 4.2.4.6-10, 4.2.4.6-12
                this._error(error);
                return Promise_1.default.reject(error);
            }
            this._advanceQueue();
            return promise;
        };
        return WritableStream;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WritableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3JpdGFibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9Xcml0YWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6WyJTdGF0ZSIsImlzV3JpdGFibGVTdHJlYW0iLCJXcml0YWJsZVN0cmVhbSIsIldyaXRhYmxlU3RyZWFtLmNvbnN0cnVjdG9yIiwiV3JpdGFibGVTdHJlYW0uY2xvc2VkIiwiV3JpdGFibGVTdHJlYW0ucmVhZHkiLCJXcml0YWJsZVN0cmVhbS5zdGF0ZSIsIldyaXRhYmxlU3RyZWFtLl9hZHZhbmNlUXVldWUiLCJXcml0YWJsZVN0cmVhbS5fY2xvc2UiLCJXcml0YWJsZVN0cmVhbS5fZXJyb3IiLCJXcml0YWJsZVN0cmVhbS5fc3luY1N0YXRlV2l0aFF1ZXVlIiwiV3JpdGFibGVTdHJlYW0uYWJvcnQiLCJXcml0YWJsZVN0cmVhbS5jbG9zZSIsIldyaXRhYmxlU3RyZWFtLndyaXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUNBLHdCQUFvQixZQUFZLENBQUMsQ0FBQTtJQUNqQywwQkFBc0IsYUFBYSxDQUFDLENBQUE7SUFDcEMsSUFBWSxJQUFJLFdBQU0sUUFBUSxDQUFDLENBQUE7SUFZL0I7O09BRUc7SUFDSCxXQUFZLEtBQUs7UUFBR0EscUNBQU1BLENBQUFBO1FBQUVBLHVDQUFPQSxDQUFBQTtRQUFFQSx1Q0FBT0EsQ0FBQUE7UUFBRUEsdUNBQU9BLENBQUFBO1FBQUVBLHlDQUFRQSxDQUFBQTtJQUFDQSxDQUFDQSxFQUFyRCxhQUFLLEtBQUwsYUFBSyxRQUFnRDtJQUFqRSxJQUFZLEtBQUssR0FBTCxhQUFxRCxDQUFBO0lBRWpFLHNIQUFzSDtJQUN0SCxtRUFBbUU7SUFDbkUsMEJBQTBCLENBQU07UUFDL0JDLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLEVBQUVBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7SUFDbkVBLENB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Q0FBQ0EsQ0FBQ0E7Z0JBQzVDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLEVBQUVBLENBQUNBO1lBQzVCQSxDQUNBQTtZQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZEEsc0NBQXNDQTtnQkFDdENBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsTUFBTUEsQ0FBQ0EsaUJBQU9BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQzlCQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtZQUVyQkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBQ0ZYLHFCQUFDQTtJQUFEQSxDQUFDQSxBQS9URCxJQStUQztJQS9URDtvQ0ErVEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmF0ZWd5IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0IFNpemVRdWV1ZSBmcm9tICcuL1NpemVRdWV1ZSc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbi8vIEEgUmVjb3JkIGlzIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgc3RyZWFtIHRvIHByb2Nlc3MgcXVldWVkIHdyaXRlcy4gSXQgcmVwcmVzZW50cyB0aGUgY2h1bmsgdG8gYmUgd3JpdHRlbiBwbHVzXG4vLyBhZGRpdGlvbmFsIG1ldGFkYXRhIHVzZWQgaW50ZXJuYWxseS5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjb3JkPFQ+IHtcblx0Ly8gVGhpcyBmbGFnIGluZGljYXRlcyB0aGF0IHRoaXMgcmVjb3JkIGlzIHRoZSBlbmQgb2YgdGhlIHN0cmVhbSBhbmQgdGhlIHN0cmVhbSBzaG91bGQgY2xvc2Ugd2hlbiBwcm9jZXNzaW5nIGl0XG5cdGNsb3NlPzogYm9vbGVhbjtcblx0Y2h1bms/OiBUO1xuXHRyZWplY3Q/OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXHRyZXNvbHZlPzogKCkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBXcml0YWJsZVN0cmVhbSdzIHBvc3NpYmxlIHN0YXRlc1xuICovXG5leHBvcnQgZW51bSBTdGF0ZSB7IENsb3NlZCwgQ2xvc2luZywgRXJyb3JlZCwgV2FpdGluZywgV3JpdGFibGUgfVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGJhc2ljYWxseSBhIGNvbnRleHQgY2hlY2sgdG8gcHJvdGVjdCBhZ2FpbnN0IGNhbGxpbmcgV3JpdGFibGVTdHJlYW0gbWV0aG9kcyB3aXRoIGluY29ycmVjdCBjb250ZXh0XG4vLyAoYXMgb25lIG1pZ2h0IGFjY2lkZW50YWxseSBkbyB3aGVuIHBhc3NpbmcgYSBtZXRob2QgYXMgY2FsbGJhY2spXG5mdW5jdGlvbiBpc1dyaXRhYmxlU3RyZWFtKHg6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfdW5kZXJseWluZ1NpbmsnKTtcbn1cblxuLyoqXG4gKiBUaGUgU2luayBpbnRlcmZhY2UgZGVmaW5lcyB0aGUgbWV0aG9kcyBhIG1vZHVsZSBjYW4gaW1wbGVtZW50IHRvIGNyZWF0ZSBhIHRhcmdldCBzaW5rIGZvciBhIGBXcml0YWJsZVN0cmVhbWAuXG4gKlxuICogVGhlIFN0cmVhbSBBUEkgcHJvdmlkZXMgYSBjb25zaXN0ZW50IHN0cmVhbSBBUEkgd2hpbGUgYFJlYWRhYmxlU3RyZWFtLlNvdXJjZWAgYW5kIGBXcml0YWJsZVN0cmVhbS5TaW5rYCBpbXBsZW1lbnRvcnNcbiAqIHByb3ZpZGUgdGhlIGxvZ2ljIHRvIGNvbm5lY3QgYSBzdHJlYW0gdG8gc3BlY2lmaWMgZGF0YSBzb3VyY2VzICYgc2lua3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2luazxUPiB7XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGUgc3RyZWFtIGlzIHByZW1hdHVyZWx5IGNsb3NpbmcgZHVlIHRvIGFuIGVycm9yLiAgVGhlIHNpbmsgc2hvdWxkIGRvIGFueSBuZWNlc3NhcnkgY2xlYW51cFxuXHQgKiBhbmQgcmVsZWFzZSByZXNvdXJjZXMuIFdoZW4gYSBzdHJlYW0gY2FsbHMgYGFib3J0YCBpdCB3aWxsIGRpc2NhcmQgYW55IHF1ZXVlZCBjaHVua3MuIElmIHRoZSBzaW5rIGRvZXMgbm90XG5cdCAqIHByb3ZpZGUgYW4gYGFib3J0YCBtZXRob2QgdGhlbiB0aGUgc3RyZWFtIHdpbGwgY2FsbCBgY2xvc2VgIGluc3RlYWQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWFzb24gVGhlIHJlYXNvbiB0aGUgc3RyZWFtIGlzIGNsb3NpbmcuXG5cdCAqL1xuXHRhYm9ydD8ocmVhc29uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHRoZSBzdHJlYW0gaXMgY2xvc2luZy4gIFRoZSBzaW5rIHNob3VsZCBkbyBhbnkgbmVjZXNzYXJ5IGNsZWFudXAgYW5kIHJlbGVhc2UgcmVzb3VyY2VzLiBUaGUgc3RyZWFtXG5cdCAqIHdpbGwgbm90IGNhbGwgdGhpcyBtZXRob2QgdW50aWwgaXMgaGFzIHN1Y2Nlc3NmdWxseSB3cml0dGVuIGFsbCBxdWV1ZWQgY2h1bmtzLlxuXHQgKi9cblx0Y2xvc2U/KCk6IFByb21pc2U8dm9pZD47XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBzaW5rIHRvIHByZXBhcmUgZm9yIHJlY2VpdmluZyBjaHVua3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBlcnJvciBBbiBlcnJvciBjYWxsYmFjayB0aGF0IGNhbiBiZSB1c2VkIGF0IGFueSB0aW1lIGJ5IHRoZSBzaW5rIHRvIGluZGljYXRlIGFuIGVycm9yIGhhcyBvY2N1cnJlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc2luaydzIHN0YXJ0IG9wZXJhdGlvbiBoYXMgZmluaXNoZWQuICBJZiB0aGUgcHJvbWlzZSByZWplY3RzLFxuXHQgKiBcdFx0dGhlIHN0cmVhbSB3aWxsIGJlIGVycm9yZWQuXG5cdCAqL1xuXHRzdGFydD8oZXJyb3I6IChlcnJvcjogRXJyb3IpID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgc2luayB3cml0ZSBhIGNodW5rLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIGJlIHdyaXR0ZW4uXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNpbmsncyB3cml0ZSBvcGVyYXRpb24gaGFzIGZpbmlzaGVkLiAgSWYgdGhlIHByb21pc2UgcmVqZWN0cyxcblx0ICogXHRcdHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0d3JpdGU/KGNodW5rOiBUKTogUHJvbWlzZTx2b2lkPjtcbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIHByb3ZpZGVzIGEgd3JpdGFibGUgc3RyZWFtIGltcGxlbWVudGF0aW9uLiBEYXRhIHdyaXR0ZW4gdG8gYSBzdHJlYW0gd2lsbCBiZSBwYXNzZWQgb24gdG8gdGhlIHVuZGVybHlpbmdcbiAqIHNpbmsgKGBXcml0YWJsZVN0cmVhbS5TaW5rYCksIGFuIGluc3RhbmNlIG9mIHdoaWNoIG11c3QgYmUgc3VwcGxpZWQgdG8gdGhlIHN0cmVhbSB1cG9uIGluc3RhbnRhdGlvbi4gVGhpcyBjbGFzc1xuICogcHJvdmlkZXMgdGhlIHN0YW5kYXJkIHN0cmVhbSBBUEksIHdoaWxlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgYFNpbmtgIEFQSSBhbGxvdyB0aGUgZGF0YSB0byBiZSB3cml0dGVuIHRvXG4gKiB2YXJpb3VzIHBlcnNpc3RlbmNlIGxheWVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JpdGFibGVTdHJlYW08VD4ge1xuXHQvKipcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgc3RyZWFtIGlzIGNsb3NlZCwgb3IgaXMgcmVqZWN0ZWQgaWYgdGhlIHN0cmVhbSBlcnJvcnMuXG5cdCAqL1xuXHRnZXQgY2xvc2VkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9jbG9zZWRQcm9taXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSB0cmFuc2l0aW9ucyBhd2F5IGZyb20gdGhlICd3YWl0aW5nJyBzdGF0ZS4gVGhlIHN0cmVhbSB3aWxsXG5cdCAqIHVzZSB0aGlzIHRvIGluZGljYXRlIGJhY2twcmVzc3VyZSAtIGFuIHVucmVzb2x2ZWQgYHJlYWR5YCBwcm9taXNlIGluZGljYXRlcyB0aGF0IHdyaXRlcyBzaG91bGQgbm90IHlldCBiZVxuXHQgKiBwZXJmb3JtZWQuXG5cdCAqL1xuXHRnZXQgcmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuX3JlYWR5UHJvbWlzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyBUaGUgc3RyZWFtJ3MgY3VycmVudCBAU3RhdGVcblx0ICovXG5cdGdldCBzdGF0ZSgpOiBTdGF0ZSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9hZHZhbmNpbmc6IGJvb2xlYW47XG5cdHByb3RlY3RlZCBfY2xvc2VkUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblx0cHJvdGVjdGVkIF9yZWFkeVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cdHByb3RlY3RlZCBfcmVqZWN0Q2xvc2VkUHJvbWlzZTogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblx0cHJvdGVjdGVkIF9yZWplY3RSZWFkeVByb21pc2U6IChlcnJvcjogRXJyb3IpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBfcmVzb2x2ZUNsb3NlZFByb21pc2U6ICgpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBfcmVzb2x2ZVJlYWR5UHJvbWlzZTogKCkgPT4gdm9pZDtcblx0cHJvdGVjdGVkIF9zdGFydGVkOiBib29sZWFuO1xuXHRwcm90ZWN0ZWQgX3N0YXJ0ZWRQcm9taXNlOiBQcm9taXNlPGFueT47XG5cdHByb3RlY3RlZCBfc3RhdGU6IFN0YXRlO1xuXHRwcm90ZWN0ZWQgX3N0b3JlZEVycm9yOiBFcnJvcjtcblx0cHJvdGVjdGVkIF9zdHJhdGVneTogU3RyYXRlZ3k8VD47XG5cdHByb3RlY3RlZCBfdW5kZXJseWluZ1Npbms6IFNpbms8VD47XG5cdHByb3RlY3RlZCBfcXVldWU6IFNpemVRdWV1ZTxSZWNvcmQ8VD4+O1xuXHRwcm90ZWN0ZWQgX3dyaXRpbmc6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3IodW5kZXJseWluZ1Npbms6IFNpbms8VD4gPSB7fSwgc3RyYXRlZ3k6IFN0cmF0ZWd5PFQ+ID0ge30pIHtcblx0XHR0aGlzLl91bmRlcmx5aW5nU2luayA9IHVuZGVybHlpbmdTaW5rO1xuXG5cdFx0dGhpcy5fY2xvc2VkUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMuX3Jlc29sdmVDbG9zZWRQcm9taXNlID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMuX3JlamVjdENsb3NlZFByb21pc2UgPSByZWplY3Q7XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9hZHZhbmNpbmcgPSBmYWxzZTtcblx0XHR0aGlzLl9yZWFkeVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR0aGlzLl9xdWV1ZSA9IG5ldyBTaXplUXVldWU8UmVjb3JkPFQ+PigpO1xuXHRcdHRoaXMuX3N0YXRlID0gU3RhdGUuV3JpdGFibGU7XG5cdFx0dGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX3dyaXRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLl9zdHJhdGVneSA9IHV0aWwubm9ybWFsaXplU3RyYXRlZ3koc3RyYXRlZ3kpO1xuXHRcdHRoaXMuX3N5bmNTdGF0ZVdpdGhRdWV1ZSgpO1xuXG5cdFx0dGhpcy5fc3RhcnRlZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHR1dGlsLmludm9rZU9yTm9vcCh0aGlzLl91bmRlcmx5aW5nU2luaywgJ3N0YXJ0JywgWyB0aGlzLl9lcnJvci5iaW5kKHRoaXMpIF0pXG5cdFx0KS50aGVuKCgpID0+IHtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fc3RhcnRlZFByb21pc2UgPSB1bmRlZmluZWQ7XG5cdFx0fSwgKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0dGhpcy5fZXJyb3IoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVGhpcyBtZXRob2QgY29tYmluZXMgdGhlIGxvZ2ljIG9mIHR3byBtZXRob2RzOlxuXHQvLyA0LjMuMSBDYWxsT3JTY2hlZHVsZVdyaXRhYmxlU3RyZWFtQWR2YW5jZVF1ZXVlXG5cdC8vIDQuMy42IFdyaXRhYmxlU3RyZWFtQWR2YW5jZVF1ZXVlXG5cdHByb3RlY3RlZCBfYWR2YW5jZVF1ZXVlKCkge1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0aWYgKCF0aGlzLl9hZHZhbmNpbmcpIHtcblx0XHRcdFx0dGhpcy5fYWR2YW5jaW5nID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5fc3RhcnRlZFByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fYWR2YW5jZVF1ZXVlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLl9xdWV1ZSB8fCB0aGlzLl93cml0aW5nKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgd3JpdGVSZWNvcmQ6IFJlY29yZDxUPiA9IHRoaXMuX3F1ZXVlLnBlZWsoKTtcblxuXHRcdGlmICh3cml0ZVJlY29yZC5jbG9zZSkge1xuXHRcdFx0Ly8gVE9ETzogU0tJUD8gQXNzZXJ0IDQuMy42LTMuYVxuXHRcdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLkNsb3NpbmcpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlY29yZCcpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9xdWV1ZS5kZXF1ZXVlKCk7XG5cdFx0XHQvLyBUT0RPOiBTS0lQPyBBc3NlcnQgNC4zLjYtMy5jXG5cdFx0XHR0aGlzLl9jbG9zZSgpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fd3JpdGluZyA9IHRydWU7XG5cblx0XHR1dGlsLnByb21pc2VJbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NpbmssICd3cml0ZScsIFsgd3JpdGVSZWNvcmQuY2h1bmsgXSkudGhlbigoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0XHR0aGlzLl93cml0aW5nID0gZmFsc2U7XG5cdFx0XHRcdHdyaXRlUmVjb3JkLnJlc29sdmUoKTtcblx0XHRcdFx0dGhpcy5fcXVldWUuZGVxdWV1ZSgpO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dGhpcy5fc3luY1N0YXRlV2l0aFF1ZXVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKGVycm9yKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuX2FkdmFuY2VRdWV1ZSgpO1xuXHRcdFx0fVxuXHRcdH0sIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdHRoaXMuX2Vycm9yKGVycm9yKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIDQuMy4yIENsb3NlV3JpdGFibGVTdHJlYW1cblx0cHJvdGVjdGVkIF9jbG9zZSgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuQ2xvc2luZykge1xuXHRcdFx0Ly8gNC4zLjItMVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdXcml0YWJsZVN0cmVhbSNfY2xvc2UgY2FsbGVkIHdoaWxlIHN0YXRlIGlzIG5vdCBcIkNsb3NpbmdcIicpO1xuXHRcdH1cblxuXHRcdHV0aWwucHJvbWlzZUludm9rZU9yTm9vcCh0aGlzLl91bmRlcmx5aW5nU2luaywgJ2Nsb3NlJykudGhlbigoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0XHQvLyBUT0RPOiBBc3NlcnQgNC4zLjIuMi1hLmlpXG5cdFx0XHRcdHRoaXMuX3Jlc29sdmVDbG9zZWRQcm9taXNlKCk7XG5cdFx0XHRcdHRoaXMuX3N0YXRlID0gU3RhdGUuQ2xvc2VkO1xuXHRcdFx0XHR0aGlzLl91bmRlcmx5aW5nU2luayA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9LCAoZXJyb3I6IEVycm9yKSA9PiB7XG5cdFx0XHR0aGlzLl9lcnJvcihlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyA0LjMuMyBFcnJvcldyaXRhYmxlU3RyZWFtXG5cdHByb3RlY3RlZCBfZXJyb3IoZXJyb3I6IEVycm9yKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCB8fCB0aGlzLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHdyaXRlUmVjb3JkOiBSZWNvcmQ8VD47XG5cblx0XHR3aGlsZSAodGhpcy5fcXVldWUubGVuZ3RoKSB7XG5cdFx0XHR3cml0ZVJlY29yZCA9IHRoaXMuX3F1ZXVlLmRlcXVldWUoKTtcblxuXHRcdFx0aWYgKCF3cml0ZVJlY29yZC5jbG9zZSkge1xuXHRcdFx0XHR3cml0ZVJlY29yZC5yZWplY3QoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX3N0b3JlZEVycm9yID0gZXJyb3I7XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuV2FpdGluZykge1xuXHRcdFx0dGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3JlamVjdENsb3NlZFByb21pc2UoZXJyb3IpO1xuXHRcdHRoaXMuX3N0YXRlID0gU3RhdGUuRXJyb3JlZDtcblx0fVxuXG5cdC8vIDQuMy41IFN5bmNXcml0YWJsZVN0cmVhbVN0YXRlV2l0aFF1ZXVlXG5cdHByb3RlY3RlZCBfc3luY1N0YXRlV2l0aFF1ZXVlKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5DbG9zaW5nKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgcXVldWVTaXplID0gdGhpcy5fcXVldWUudG90YWxTaXplO1xuXHRcdGNvbnN0IHNob3VsZEFwcGx5QmFja1ByZXNzdXJlID0gcXVldWVTaXplID4gdGhpcy5fc3RyYXRlZ3kuaGlnaFdhdGVyTWFyaztcblxuXHRcdGlmIChzaG91bGRBcHBseUJhY2tQcmVzc3VyZSAmJiB0aGlzLnN0YXRlID09PSBTdGF0ZS5Xcml0YWJsZSkge1xuXHRcdFx0dGhpcy5fc3RhdGUgPSBTdGF0ZS5XYWl0aW5nO1xuXHRcdFx0dGhpcy5fcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9yZXNvbHZlUmVhZHlQcm9taXNlID0gcmVzb2x2ZTtcblx0XHRcdFx0dGhpcy5fcmVqZWN0UmVhZHlQcm9taXNlID0gcmVqZWN0O1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHNob3VsZEFwcGx5QmFja1ByZXNzdXJlID09PSBmYWxzZSAmJiB0aGlzLnN0YXRlID09PSBTdGF0ZS5XYWl0aW5nKSB7XG5cdFx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLldyaXRhYmxlO1xuXHRcdFx0dGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTaWduYWxzIHRoYXQgdGhlIHByb2R1Y2VyIGNhbiBubyBsb25nZXIgd3JpdGUgdG8gdGhlIHN0cmVhbSBhbmQgaXQgc2hvdWxkIGJlIGltbWVkaWF0ZWx5IG1vdmVkIHRvIGFuIFwiZXJyb3JlZFwiXG5cdCAqIHN0YXRlLiBBbnkgdW4td3JpdHRlbiBkYXRhIHRoYXQgaXMgcXVldWVkIHdpbGwgYmUgZGlzY2FyZGVkLlxuXHQgKi9cblx0YWJvcnQocmVhc29uOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyA0LjIuNC40LTFcblx0XHRpZiAoIWlzV3JpdGFibGVTdHJlYW0odGhpcykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcblx0XHRcdFx0bmV3IEVycm9yKCdXcml0YWJsZVN0cmVhbSBtZXRob2QgY2FsbGVkIGluIGNvbnRleHQgb2Ygb2JqZWN0IHRoYXQgaXMgbm90IGEgV3JpdGFibGVTdHJlYW0gaW5zdGFuY2UnKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2VkKSB7XG5cdFx0XHQvLyA0LjIuNC40LTJcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0Ly8gNC4yLjQuNC0zXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5fc3RvcmVkRXJyb3IpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGVycm9yOiBFcnJvciA9IHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVhc29uIDogbmV3IEVycm9yKHJlYXNvbik7XG5cblx0XHR0aGlzLl9lcnJvcihlcnJvcik7XG5cblx0XHRyZXR1cm4gdXRpbC5wcm9taXNlSW52b2tlT3JGYWxsYmFja09yTm9vcCh0aGlzLl91bmRlcmx5aW5nU2luaywgJ2Fib3J0JywgWyByZWFzb24gXSwgJ2Nsb3NlJylcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogU2lnbmFscyB0aGF0IHRoZSBwcm9kdWNlciBpcyBkb25lIHdyaXRpbmcgdG8gdGhlIHN0cmVhbSBhbmQgd2lzaGVzIHRvIG1vdmUgaXQgdG8gYSBcImNsb3NlZFwiIHN0YXRlLiBUaGUgc3RyZWFtXG5cdCAqIG1heSBoYXZlIHVuLXdyaXR0ZWQgZGF0YSBxdWV1ZWQ7IHVudGlsIHRoZSBkYXRhIGhhcyBiZWVuIHdyaXR0ZW4gdGhlIHN0cmVhbSB3aWxsIHJlbWFpbiBpbiB0aGUgXCJjbG9zaW5nXCIgc3RhdGUuXG5cdCAqL1xuXHRjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyA0LjIuNC41LTFcblx0XHRpZiAoIWlzV3JpdGFibGVTdHJlYW0odGhpcykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcblx0XHRcdFx0bmV3IEVycm9yKCdXcml0YWJsZVN0cmVhbSBtZXRob2QgY2FsbGVkIGluIGNvbnRleHQgb2Ygb2JqZWN0IHRoYXQgaXMgbm90IGEgV3JpdGFibGVTdHJlYW0gaW5zdGFuY2UnKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvLyA0LjIuNC41LTJcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignU3RyZWFtIGlzIGFscmVhZHkgY2xvc2VkJykpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5DbG9zaW5nKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignU3RyZWFtIGlzIGFscmVhZHkgY2xvc2luZycpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0Ly8gNC4yLjQuNS0zXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5fc3RvcmVkRXJyb3IpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5XYWl0aW5nKSB7XG5cdFx0XHQvLyA0LjIuNC41LTRcblx0XHRcdHRoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLkNsb3Npbmc7XG5cdFx0dGhpcy5fcXVldWUuZW5xdWV1ZSh7IGNsb3NlOiB0cnVlIH0sIDApO1xuXHRcdHRoaXMuX2FkdmFuY2VRdWV1ZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2Nsb3NlZFByb21pc2U7XG5cdH1cblxuXHQvKipcblx0ICogRW5xdWV1ZSBhIGNodW5rIG9mIGRhdGEgdG8gYmUgd3JpdHRlbiB0byB0aGUgdW5kZXJseWluZyBzaW5rLiBgd3JpdGVgIGNhbiBiZSBjYWxsZWQgc3VjY2Vzc2l2ZWx5IHdpdGhvdXQgd2FpdGluZ1xuXHQgKiBmb3IgdGhlIHByZXZpb3VzIHdyaXRlJ3MgcHJvbWlzZSB0byByZXNvbHZlLiBUbyByZXNwZWN0IHRoZSBzdHJlYW0ncyBiYWNrcHJlc3N1cmUgaW5kaWNhdG9yLCBjaGVjayBpZiB0aGUgc3RyZWFtXG5cdCAqIGhhcyBlbnRlcmVkIHRoZSBcIndhaXRpbmdcIiBzdGF0ZSBiZXR3ZWVuIHdyaXRlcy5cblx0ICpcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgd2hlbiB0aGUgY2h1bmsgaGFzIGJlZW4gd3JpdHRlbiB0byB0aGUgdW5kZXJseWluZyBzaW5rLlxuXHQgKi9cblx0d3JpdGUoY2h1bms6IFQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyA0LjIuNC42LTFcblx0XHRpZiAoIWlzV3JpdGFibGVTdHJlYW0odGhpcykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcblx0XHRcdFx0bmV3IEVycm9yKCdXcml0YWJsZVN0cmVhbSBtZXRob2QgY2FsbGVkIGluIGNvbnRleHQgb2Ygb2JqZWN0IHRoYXQgaXMgbm90IGEgV3JpdGFibGVTdHJlYW0gaW5zdGFuY2UnKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvLyA0LjIuNC42LTJcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignU3RyZWFtIGlzIGNsb3NlZCcpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2luZykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1N0cmVhbSBpcyBjbG9zaW5nJykpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHQvLyA0LjIuNC42LTNcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCh0aGlzLl9zdG9yZWRFcnJvcik7XG5cdFx0fVxuXG5cdFx0bGV0IGNodW5rU2l6ZSA9IDE7XG5cdFx0bGV0IHdyaXRlUmVjb3JkOiBSZWNvcmQ8VD47XG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHR3cml0ZVJlY29yZCA9IHtcblx0XHRcdFx0Y2h1bms6IGNodW5rLFxuXHRcdFx0XHRyZWplY3Q6IHJlamVjdCxcblx0XHRcdFx0cmVzb2x2ZTogcmVzb2x2ZVxuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdC8vIDQuMi40LjYtNi5iXG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLl9zdHJhdGVneSAmJiB0aGlzLl9zdHJhdGVneS5zaXplKSB7XG5cdFx0XHRcdGNodW5rU2l6ZSA9IHRoaXMuX3N0cmF0ZWd5LnNpemUoY2h1bmspO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9xdWV1ZS5lbnF1ZXVlKHdyaXRlUmVjb3JkLCBjaHVua1NpemUpO1xuXHRcdFx0dGhpcy5fc3luY1N0YXRlV2l0aFF1ZXVlKCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0Ly8gNC4yLjQuNi02LmIsIDQuMi40LjYtMTAsIDQuMi40LjYtMTJcblx0XHRcdHRoaXMuX2Vycm9yKGVycm9yKTtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYWR2YW5jZVF1ZXVlKCk7XG5cblx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxufVxuIl19