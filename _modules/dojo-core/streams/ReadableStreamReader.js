(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStream'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var ReadableStream_1 = require('./ReadableStream');
    function isReadableStreamReader(readableStreamReader) {
        return Object.prototype.hasOwnProperty.call(readableStreamReader, '_ownerReadableStream');
    }
    /**
     * This class provides the interface for reading data from a stream. A reader can by acquired by calling
     * {@link ReadableStream#getReader}. A {@link ReadableStream} can only have a single reader at any time. A reader can
     * be released from the stream by calling {@link ReadableStreamReader.releaseLock}. If the stream still has data, a new
     * reader can be acquired to read from the stream.
     */
    var ReadableStreamReader = (function () {
        function ReadableStreamReader(stream) {
            var _this = this;
            if (!stream.readable) {
                throw new TypeError('3.4.3-1: stream must be a ReadableStream');
            }
            if (stream.locked) {
                throw new TypeError('3.4.3-2: stream cannot be locked');
            }
            stream.reader = this;
            this._ownerReadableStream = stream;
            this.state = ReadableStream_1.State.Readable;
            this._storedError = undefined;
            this._readRequests = [];
            this._closedPromise = new Promise_1.default(function (resolve, reject) {
                _this._resolveClosedPromise = resolve;
                _this._rejectClosedPromise = reject;
            });
        }
        Object.defineProperty(ReadableStreamReader.prototype, "closed", {
            get: function () {
                return this._closedPromise;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Cancel a stream. The reader is released and the stream is closed. {@link ReadableStream.Source#cancel} is
         * called with the provided `reason`.
         *
         * @param reason The reason for canceling the stream
         */
        ReadableStreamReader.prototype.cancel = function (reason) {
            if (!isReadableStreamReader(this)) {
                return Promise_1.default.reject(new TypeError('3.4.4.2-1: Must be a ReadableStreamReader instance'));
            }
            if (this.state === ReadableStream_1.State.Closed) {
                return Promise_1.default.resolve();
            }
            if (this.state === ReadableStream_1.State.Errored) {
                return Promise_1.default.reject(this._storedError);
            }
            if (this._ownerReadableStream && this._ownerReadableStream.state === ReadableStream_1.State.Readable) {
                return this._ownerReadableStream.cancel(reason);
            }
            // 3.4.4.2-4,5 - the spec calls for this to throw an error. We have changed it to reject instead
            return Promise_1.default.reject(new TypeError('3.4.4.2-4,5: Cannot cancel ReadableStreamReader'));
        };
        /**
         * Read data from the stream.
         *
         * @returns A promise that resolves to a {@link ReadResult}.
         */
        // This method also incorporates the ReadFromReadableStreamReader from 3.5.12.
        ReadableStreamReader.prototype.read = function () {
            var _this = this;
            if (!isReadableStreamReader(this)) {
                return Promise_1.default.reject(new TypeError('3.4.4.3-1: Must be a ReadableStreamReader instance'));
            }
            if (this.state === ReadableStream_1.State.Closed) {
                return Promise_1.default.resolve({
                    value: undefined,
                    done: true
                });
            }
            if (this.state === ReadableStream_1.State.Errored) {
                return Promise_1.default.reject(new TypeError('3.5.12-2: reader state is Errored'));
            }
            var stream = this._ownerReadableStream;
            if (!stream || stream.state !== ReadableStream_1.State.Readable) {
                throw new TypeError('3.5.12-3,4: Stream must exist and be readable');
            }
            var queue = stream.queue;
            if (queue.length > 0) {
                var chunk = queue.dequeue();
                if (stream.closeRequested && !queue.length) {
                    stream.close();
                }
                else {
                    stream.pull();
                }
                return Promise_1.default.resolve({
                    value: chunk,
                    done: false
                });
            }
            else {
                var readPromise = new Promise_1.default(function (resolve, reject) {
                    _this._readRequests.push({
                        promise: readPromise,
                        resolve: resolve,
                        reject: reject
                    });
                    stream.pull();
                });
                return readPromise;
            }
        };
        /**
         * Release a reader's lock on the corresponding stream. The reader will no longer be readable. Further reading on
         * the stream can be done by acquiring a new `ReadableStreamReader`.
         */
        // 3.4.4.4. releaseLock()
        ReadableStreamReader.prototype.releaseLock = function () {
            if (!isReadableStreamReader(this)) {
                throw new TypeError('3.4.4.4-1: Must be a ReadableStreamReader isntance');
            }
            if (!this._ownerReadableStream) {
                return;
            }
            if (this._readRequests.length) {
                throw new TypeError('3.4.4.4-3: Tried to release a reader lock when that reader has pending read calls un-settled');
            }
            this.release();
        };
        // 3.5.13. ReleaseReadableStreamReader ( reader )
        ReadableStreamReader.prototype.release = function () {
            var request;
            if (this._ownerReadableStream.state === ReadableStream_1.State.Errored) {
                this.state = ReadableStream_1.State.Errored;
                var e = this._ownerReadableStream.storedError;
                this._storedError = e;
                this._rejectClosedPromise(e);
                for (var _i = 0, _a = this._readRequests; _i < _a.length; _i++) {
                    request = _a[_i];
                    request.reject(e);
                }
            }
            else {
                this.state = ReadableStream_1.State.Closed;
                this._resolveClosedPromise();
                for (var _b = 0, _c = this._readRequests; _b < _c.length; _b++) {
                    request = _c[_b];
                    request.resolve({
                        value: undefined,
                        done: true
                    });
                }
            }
            this._readRequests = [];
            this._ownerReadableStream.reader = undefined;
            this._ownerReadableStream = undefined;
        };
        /**
         * Resolves a pending read request, if any, with the provided chunk.
         * @param chunk
         * @return boolean True if a read request was resolved.
         */
        ReadableStreamReader.prototype.resolveReadRequest = function (chunk) {
            if (this._readRequests.length > 0) {
                this._readRequests.shift().resolve({
                    value: chunk,
                    done: false
                });
                return true;
            }
            return false;
        };
        return ReadableStreamReader;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStreamReader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW1SZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9SZWFkYWJsZVN0cmVhbVJlYWRlci50cyJdLCJuYW1lcyI6WyJpc1JlYWRhYmxlU3RyZWFtUmVhZGVyIiwiUmVhZGFibGVTdHJlYW1SZWFkZXIiLCJSZWFkYWJsZVN0cmVhbVJlYWRlci5jb25zdHJ1Y3RvciIsIlJlYWRhYmxlU3RyZWFtUmVhZGVyLmNsb3NlZCIsIlJlYWRhYmxlU3RyZWFtUmVhZGVyLmNhbmNlbCIsIlJlYWRhYmxlU3RyZWFtUmVhZGVyLnJlYWQiLCJSZWFkYWJsZVN0cmVhbVJlYWRlci5yZWxlYXNlTG9jayIsIlJlYWRhYmxlU3RyZWFtUmVhZGVyLnJlbGVhc2UiLCJSZWFkYWJsZVN0cmVhbVJlYWRlci5yZXNvbHZlUmVhZFJlcXVlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsd0JBQW9CLFlBQVksQ0FBQyxDQUFBO0lBQ2pDLCtCQUFzQyxrQkFBa0IsQ0FBQyxDQUFBO0lBaUJ6RCxnQ0FBbUMsb0JBQTZDO1FBQy9FQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxvQkFBb0JBLEVBQUVBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBRUQ7Ozs7O09BS0c7SUFDSDtRQWVDQyw4QkFBWUEsTUFBeUJBO1lBZnRDQyxpQkF1TENBO1lBdktDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLE1BQU1BLElBQUlBLFNBQVNBLENBQUNBLDBDQUEwQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsTUFBTUEsSUFBSUEsU0FBU0EsQ0FBQ0Esa0NB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QUlBLEVBQUVBLElBQUlBO3FCQUNWQSxDQUFDQSxDQUFDQTtpQkFDSEE7WUFDRkEsQ0FBQ0E7WUFFREEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDeEJBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsU0FBU0EsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLG9CQUFvQkEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBRUROOzs7O1dBSUdBO1FBQ0hBLGlEQUFrQkEsR0FBbEJBLFVBQW1CQSxLQUFRQTtZQUMxQk8sRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQTtvQkFDbENBLEtBQUtBLEVBQUVBLEtBQUtBO29CQUNaQSxJQUFJQSxFQUFFQSxLQUFLQTtpQkFDWEEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0hBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2JBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0ZQLDJCQUFDQTtJQUFEQSxDQUFDQSxBQXZMRCxJQXVMQztJQXZMRDswQ0F1TEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtLCB7IFN0YXRlIH0gZnJvbSAnLi9SZWFkYWJsZVN0cmVhbSc7XG5cbmludGVyZmFjZSBSZWFkUmVxdWVzdDxUPiB7XG5cdHByb21pc2U6IFByb21pc2U8UmVhZFJlc3VsdDxUPj47XG5cdHJlc29sdmU6ICh2YWx1ZTogUmVhZFJlc3VsdDxUPikgPT4gdm9pZDtcblx0cmVqZWN0OiAocmVhc29uOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgb2JqZWN0cyByZXR1cm5lZCBieSB7QGxpbmsgUmVhZGFibGVTdHJlYW1SZWFkZXIjcmVhZH0uIFRoZSBkYXRhIGlzIGFjY2Vzc2libGUgb24gdGhlIGB2YWx1ZWAgcHJvcGVydHkuXG4gKiBJZiB0aGUgYGRvbmVgIHByb3BlcnR5IGlzIHRydWUsIHRoZSBzdHJlYW0gaGFzIG5vIG1vcmUgZGF0YSB0byBwcm92aWRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRSZXN1bHQ8VD4ge1xuXHR2YWx1ZTogVDtcblx0ZG9uZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gaXNSZWFkYWJsZVN0cmVhbVJlYWRlcjxUPihyZWFkYWJsZVN0cmVhbVJlYWRlcjogUmVhZGFibGVTdHJlYW1SZWFkZXI8VD4pOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZWFkYWJsZVN0cmVhbVJlYWRlciwgJ19vd25lclJlYWRhYmxlU3RyZWFtJyk7XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBwcm92aWRlcyB0aGUgaW50ZXJmYWNlIGZvciByZWFkaW5nIGRhdGEgZnJvbSBhIHN0cmVhbS4gQSByZWFkZXIgY2FuIGJ5IGFjcXVpcmVkIGJ5IGNhbGxpbmdcbiAqIHtAbGluayBSZWFkYWJsZVN0cmVhbSNnZXRSZWFkZXJ9LiBBIHtAbGluayBSZWFkYWJsZVN0cmVhbX0gY2FuIG9ubHkgaGF2ZSBhIHNpbmdsZSByZWFkZXIgYXQgYW55IHRpbWUuIEEgcmVhZGVyIGNhblxuICogYmUgcmVsZWFzZWQgZnJvbSB0aGUgc3RyZWFtIGJ5IGNhbGxpbmcge0BsaW5rIFJlYWRhYmxlU3RyZWFtUmVhZGVyLnJlbGVhc2VMb2NrfS4gSWYgdGhlIHN0cmVhbSBzdGlsbCBoYXMgZGF0YSwgYSBuZXdcbiAqIHJlYWRlciBjYW4gYmUgYWNxdWlyZWQgdG8gcmVhZCBmcm9tIHRoZSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRhYmxlU3RyZWFtUmVhZGVyPFQ+IHtcblx0Z2V0IGNsb3NlZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fY2xvc2VkUHJvbWlzZTtcblx0fVxuXG5cdHByaXZhdGUgX2Nsb3NlZFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cdHByaXZhdGUgX3N0b3JlZEVycm9yOiBFcnJvcjtcblx0cHJpdmF0ZSBfcmVhZFJlcXVlc3RzOiBSZWFkUmVxdWVzdDxUPltdO1xuXHRwcml2YXRlIF9yZXNvbHZlQ2xvc2VkUHJvbWlzZTogKCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBfcmVqZWN0Q2xvc2VkUHJvbWlzZTogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblxuXHRwcm90ZWN0ZWQgX293bmVyUmVhZGFibGVTdHJlYW06IFJlYWRhYmxlU3RyZWFtPFQ+O1xuXG5cdHN0YXRlOiBTdGF0ZTtcblxuXHRjb25zdHJ1Y3RvcihzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFQ+KSB7XG5cdFx0aWYgKCFzdHJlYW0ucmVhZGFibGUpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuNC4zLTE6IHN0cmVhbSBtdXN0IGJlIGEgUmVhZGFibGVTdHJlYW0nKTtcblx0XHR9XG5cblx0XHRpZiAoc3RyZWFtLmxvY2tlZCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy40LjMtMjogc3RyZWFtIGNhbm5vdCBiZSBsb2NrZWQnKTtcblx0XHR9XG5cblx0XHRzdHJlYW0ucmVhZGVyID0gdGhpcztcblx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID0gc3RyZWFtO1xuXHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5SZWFkYWJsZTtcblx0XHR0aGlzLl9zdG9yZWRFcnJvciA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLl9yZWFkUmVxdWVzdHMgPSBbXTtcblx0XHR0aGlzLl9jbG9zZWRQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0dGhpcy5fcmVzb2x2ZUNsb3NlZFByb21pc2UgPSByZXNvbHZlO1xuXHRcdFx0dGhpcy5fcmVqZWN0Q2xvc2VkUHJvbWlzZSA9IHJlamVjdDtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYW5jZWwgYSBzdHJlYW0uIFRoZSByZWFkZXIgaXMgcmVsZWFzZWQgYW5kIHRoZSBzdHJlYW0gaXMgY2xvc2VkLiB7QGxpbmsgUmVhZGFibGVTdHJlYW0uU291cmNlI2NhbmNlbH0gaXNcblx0ICogY2FsbGVkIHdpdGggdGhlIHByb3ZpZGVkIGByZWFzb25gLlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVhc29uIFRoZSByZWFzb24gZm9yIGNhbmNlbGluZyB0aGUgc3RyZWFtXG5cdCAqL1xuXHRjYW5jZWwocmVhc29uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWlzUmVhZGFibGVTdHJlYW1SZWFkZXIodGhpcykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCczLjQuNC4yLTE6IE11c3QgYmUgYSBSZWFkYWJsZVN0cmVhbVJlYWRlciBpbnN0YW5jZScpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCh0aGlzLl9zdG9yZWRFcnJvcik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0gJiYgdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5zdGF0ZSA9PT0gU3RhdGUuUmVhZGFibGUpIHtcblx0XHRcdHJldHVybiB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLmNhbmNlbChyZWFzb24pO1xuXHRcdH1cblxuXHRcdC8vIDMuNC40LjItNCw1IC0gdGhlIHNwZWMgY2FsbHMgZm9yIHRoaXMgdG8gdGhyb3cgYW4gZXJyb3IuIFdlIGhhdmUgY2hhbmdlZCBpdCB0byByZWplY3QgaW5zdGVhZFxuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCczLjQuNC4yLTQsNTogQ2Fubm90IGNhbmNlbCBSZWFkYWJsZVN0cmVhbVJlYWRlcicpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkIGRhdGEgZnJvbSB0aGUgc3RyZWFtLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHtAbGluayBSZWFkUmVzdWx0fS5cblx0ICovXG5cdC8vIFRoaXMgbWV0aG9kIGFsc28gaW5jb3Jwb3JhdGVzIHRoZSBSZWFkRnJvbVJlYWRhYmxlU3RyZWFtUmVhZGVyIGZyb20gMy41LjEyLlxuXHRyZWFkKCk6IFByb21pc2U8UmVhZFJlc3VsdDxUPj4ge1xuXHRcdGlmICghaXNSZWFkYWJsZVN0cmVhbVJlYWRlcih0aGlzKSkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0PFJlYWRSZXN1bHQ8VD4+KG5ldyBUeXBlRXJyb3IoJzMuNC40LjMtMTogTXVzdCBiZSBhIFJlYWRhYmxlU3RyZWFtUmVhZGVyIGluc3RhbmNlJykpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5DbG9zZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuXHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRkb25lOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0PFJlYWRSZXN1bHQ8VD4+KG5ldyBUeXBlRXJyb3IoJzMuNS4xMi0yOiByZWFkZXIgc3RhdGUgaXMgRXJyb3JlZCcpKTtcblx0XHR9XG5cblx0XHRjb25zdCBzdHJlYW0gPSB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtO1xuXHRcdGlmICghc3RyZWFtIHx8IHN0cmVhbS5zdGF0ZSAhPT0gU3RhdGUuUmVhZGFibGUpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuNS4xMi0zLDQ6IFN0cmVhbSBtdXN0IGV4aXN0IGFuZCBiZSByZWFkYWJsZScpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHF1ZXVlID0gc3RyZWFtLnF1ZXVlO1xuXHRcdGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBjaHVuayA9IHF1ZXVlLmRlcXVldWUoKTtcblx0XHRcdGlmIChzdHJlYW0uY2xvc2VSZXF1ZXN0ZWQgJiYgIXF1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRzdHJlYW0uY2xvc2UoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRzdHJlYW0ucHVsbCgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG5cdFx0XHRcdHZhbHVlOiBjaHVuayxcblx0XHRcdFx0ZG9uZTogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHJlYWRQcm9taXNlID0gbmV3IFByb21pc2U8UmVhZFJlc3VsdDxUPj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9yZWFkUmVxdWVzdHMucHVzaCh7XG5cdFx0XHRcdFx0cHJvbWlzZTogcmVhZFByb21pc2UsXG5cdFx0XHRcdFx0cmVzb2x2ZTogcmVzb2x2ZSxcblx0XHRcdFx0XHRyZWplY3Q6IHJlamVjdFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c3RyZWFtLnB1bGwoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gcmVhZFByb21pc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbGVhc2UgYSByZWFkZXIncyBsb2NrIG9uIHRoZSBjb3JyZXNwb25kaW5nIHN0cmVhbS4gVGhlIHJlYWRlciB3aWxsIG5vIGxvbmdlciBiZSByZWFkYWJsZS4gRnVydGhlciByZWFkaW5nIG9uXG5cdCAqIHRoZSBzdHJlYW0gY2FuIGJlIGRvbmUgYnkgYWNxdWlyaW5nIGEgbmV3IGBSZWFkYWJsZVN0cmVhbVJlYWRlcmAuXG5cdCAqL1xuXHQvLyAzLjQuNC40LiByZWxlYXNlTG9jaygpXG5cdHJlbGVhc2VMb2NrKCk6IHZvaWQge1xuXHRcdGlmICghaXNSZWFkYWJsZVN0cmVhbVJlYWRlcih0aGlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy40LjQuNC0xOiBNdXN0IGJlIGEgUmVhZGFibGVTdHJlYW1SZWFkZXIgaXNudGFuY2UnKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcmVhZFJlcXVlc3RzLmxlbmd0aCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy40LjQuNC0zOiBUcmllZCB0byByZWxlYXNlIGEgcmVhZGVyIGxvY2sgd2hlbiB0aGF0IHJlYWRlciBoYXMgcGVuZGluZyByZWFkIGNhbGxzIHVuLXNldHRsZWQnKTtcblx0XHR9XG5cblx0XHR0aGlzLnJlbGVhc2UoKTtcblx0fVxuXG5cdC8vIDMuNS4xMy4gUmVsZWFzZVJlYWRhYmxlU3RyZWFtUmVhZGVyICggcmVhZGVyIClcblx0cmVsZWFzZSgpOiB2b2lkIHtcblx0XHRsZXQgcmVxdWVzdDogYW55O1xuXHRcdGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHR0aGlzLnN0YXRlID0gU3RhdGUuRXJyb3JlZDtcblxuXHRcdFx0Y29uc3QgZSA9IHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RvcmVkRXJyb3I7XG5cdFx0XHR0aGlzLl9zdG9yZWRFcnJvciA9IGU7XG5cdFx0XHR0aGlzLl9yZWplY3RDbG9zZWRQcm9taXNlKGUpO1xuXG5cdFx0XHRmb3IgKHJlcXVlc3Qgb2YgdGhpcy5fcmVhZFJlcXVlc3RzKSB7XG5cdFx0XHRcdHJlcXVlc3QucmVqZWN0KGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5DbG9zZWQ7XG5cdFx0XHR0aGlzLl9yZXNvbHZlQ2xvc2VkUHJvbWlzZSgpO1xuXHRcdFx0Zm9yIChyZXF1ZXN0IG9mIHRoaXMuX3JlYWRSZXF1ZXN0cykge1xuXHRcdFx0XHRyZXF1ZXN0LnJlc29sdmUoe1xuXHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0ZG9uZTogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9yZWFkUmVxdWVzdHMgPSBbXTtcblx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnJlYWRlciA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgcGVuZGluZyByZWFkIHJlcXVlc3QsIGlmIGFueSwgd2l0aCB0aGUgcHJvdmlkZWQgY2h1bmsuXG5cdCAqIEBwYXJhbSBjaHVua1xuXHQgKiBAcmV0dXJuIGJvb2xlYW4gVHJ1ZSBpZiBhIHJlYWQgcmVxdWVzdCB3YXMgcmVzb2x2ZWQuXG5cdCAqL1xuXHRyZXNvbHZlUmVhZFJlcXVlc3QoY2h1bms6IFQpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5fcmVhZFJlcXVlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuX3JlYWRSZXF1ZXN0cy5zaGlmdCgpLnJlc29sdmUoe1xuXHRcdFx0XHR2YWx1ZTogY2h1bmssXG5cdFx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbiJdfQ==