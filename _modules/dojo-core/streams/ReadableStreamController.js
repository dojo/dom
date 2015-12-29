(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './ReadableStream'], factory);
    }
})(function (require, exports) {
    var ReadableStream_1 = require('./ReadableStream');
    // 3.5.9-1 has been ignored
    function isReadableStreamController(x) {
        return Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream');
    }
    exports.isReadableStreamController = isReadableStreamController;
    var ReadableStreamController = (function () {
        function ReadableStreamController(stream) {
            if (!stream.readable) {
                throw new TypeError('3.3.3-1: ReadableStreamController can only be constructed with a ReadableStream instance');
            }
            if (stream.controller !== undefined) {
                throw new TypeError('ReadableStreamController instances can only be created by the ReadableStream constructor');
            }
            this._controlledReadableStream = stream;
        }
        Object.defineProperty(ReadableStreamController.prototype, "desiredSize", {
            /**
             * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
             * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
             * backpressure.
             *
             * @returns The stream's strategy's `highWaterMark` value minus the queue size
             */
            // 3.3.4.1. get desiredSize
            get: function () {
                return this._controlledReadableStream.desiredSize;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * A source should call this method when it has no more data to provide. After this method is called, the stream
         * will provided any queued data to the reader, but once the stream's queue is exhausted the stream will be closed
         * and no more data can be read from it.
         */
        ReadableStreamController.prototype.close = function () {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.2-1: ReadableStreamController#close can only be used on a ReadableStreamController');
            }
            var stream = this._controlledReadableStream;
            if (stream.closeRequested) {
                throw new TypeError('3.3.4.2-3: The stream has already been closed; do not close it again!');
            }
            if (stream.state === ReadableStream_1.State.Errored) {
                throw new TypeError('3.3.4.2-4: The stream is in an errored state and cannot be closed');
            }
            return stream.requestClose();
        };
        /**
         * A source should call this method to provide data to the stream.
         *
         * @param chunk The data to provide to the stream
         */
        ReadableStreamController.prototype.enqueue = function (chunk) {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
            }
            var stream = this._controlledReadableStream;
            if (stream.state === ReadableStream_1.State.Errored) {
                throw stream.storedError;
            }
            if (stream.closeRequested) {
                throw new TypeError('3.3.4.3-4: stream is draining');
            }
            stream.enqueue(chunk);
        };
        /**
         * A source should call this method to indicate an error condition to the stream that irreparably disrupts the
         * source's (and thus the stream's) ability to provide all the intended data.
         *
         * @param error An error object representing the error condition in the source
         */
        ReadableStreamController.prototype.error = function (error) {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
            }
            if (this._controlledReadableStream.state !== ReadableStream_1.State.Readable) {
                throw new TypeError("3.3.4.3-2: the stream is " + this._controlledReadableStream.state + " and so cannot be errored");
            }
            // return errorReadableStream(this._controlledReadableStream, e);
            this._controlledReadableStream.error(error);
        };
        return ReadableStreamController;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStreamController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbImlzUmVhZGFibGVTdHJlYW1Db250cm9sbGVyIiwiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyIiwiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmNvbnN0cnVjdG9yIiwiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmRlc2lyZWRTaXplIiwiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmNsb3NlIiwiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmVucXVldWUiLCJSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIuZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsK0JBQXNDLGtCQUFrQixDQUFDLENBQUE7SUFFekQsMkJBQTJCO0lBQzNCLG9DQUEyQyxDQUFNO1FBQ2hEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxFQUFFQSwyQkFBMkJBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUZlLGtDQUEwQiw2QkFFekMsQ0FBQTtJQUVEO1FBZUNDLGtDQUFZQSxNQUF5QkE7WUFDcENDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsTUFBTUEsSUFBSUEsU0FBU0EsQ0FBQ0EsMEZBQTBGQSxDQUFDQSxDQUFDQTtZQUNqSEEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JDQSxNQUFNQSxJQUFJQSxTQUFTQSxDQUFDQSwwRkFBMEZBLENBQUNBLENBQUNBO1lBQ2pIQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFDQSx5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QXpGRCxJQXlGQztJQXpGRDs4Q0F5RkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFkYWJsZVN0cmVhbSwgeyBTdGF0ZSB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW0nO1xuXG4vLyAzLjUuOS0xIGhhcyBiZWVuIGlnbm9yZWRcbmV4cG9ydCBmdW5jdGlvbiBpc1JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcih4OiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbScpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VD4ge1xuXHRwcml2YXRlIF9jb250cm9sbGVkUmVhZGFibGVTdHJlYW06IFJlYWRhYmxlU3RyZWFtPFQ+O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbnVtYmVyIGluZGljYXRpbmcgaG93IG11Y2ggYWRkaXRpb25hbCBkYXRhIGNhbiBiZSBwdXNoZWQgYnkgdGhlIHNvdXJjZSB0byB0aGUgc3RyZWFtJ3MgcXVldWUgYmVmb3JlIGl0XG5cdCAqIGV4Y2VlZHMgaXRzIGBoaWdoV2F0ZXJNYXJrYC4gQW4gdW5kZXJseWluZyBzb3VyY2Ugc2hvdWxkIHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRldGVybWluZSB3aGVuIGFuZCBob3cgdG8gYXBwbHlcblx0ICogYmFja3ByZXNzdXJlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgc3RyZWFtJ3Mgc3RyYXRlZ3kncyBgaGlnaFdhdGVyTWFya2AgdmFsdWUgbWludXMgdGhlIHF1ZXVlIHNpemVcblx0ICovXG5cdC8vIDMuMy40LjEuIGdldCBkZXNpcmVkU2l6ZVxuXHRnZXQgZGVzaXJlZFNpemUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtLmRlc2lyZWRTaXplO1xuXHR9XG5cblx0Y29uc3RydWN0b3Ioc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxUPikge1xuXHRcdGlmICghc3RyZWFtLnJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuMy0xOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgY2FuIG9ubHkgYmUgY29uc3RydWN0ZWQgd2l0aCBhIFJlYWRhYmxlU3RyZWFtIGluc3RhbmNlJyk7XG5cdFx0fVxuXG5cdFx0aWYgKHN0cmVhbS5jb250cm9sbGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciBpbnN0YW5jZXMgY2FuIG9ubHkgYmUgY3JlYXRlZCBieSB0aGUgUmVhZGFibGVTdHJlYW0gY29uc3RydWN0b3InKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0gPSBzdHJlYW07XG5cdH1cblxuXHQvKipcblx0ICogQSBzb3VyY2Ugc2hvdWxkIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiBpdCBoYXMgbm8gbW9yZSBkYXRhIHRvIHByb3ZpZGUuIEFmdGVyIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCwgdGhlIHN0cmVhbVxuXHQgKiB3aWxsIHByb3ZpZGVkIGFueSBxdWV1ZWQgZGF0YSB0byB0aGUgcmVhZGVyLCBidXQgb25jZSB0aGUgc3RyZWFtJ3MgcXVldWUgaXMgZXhoYXVzdGVkIHRoZSBzdHJlYW0gd2lsbCBiZSBjbG9zZWRcblx0ICogYW5kIG5vIG1vcmUgZGF0YSBjYW4gYmUgcmVhZCBmcm9tIGl0LlxuXHQgKi9cblx0Y2xvc2UoKTogdm9pZCB7XG5cdFx0aWYgKCFpc1JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcih0aGlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy4zLjQuMi0xOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIjY2xvc2UgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHN0cmVhbSA9IHRoaXMuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbTtcblx0XHRpZiAoc3RyZWFtLmNsb3NlUmVxdWVzdGVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4yLTM6IFRoZSBzdHJlYW0gaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQ7IGRvIG5vdCBjbG9zZSBpdCBhZ2FpbiEnKTtcblx0XHR9XG5cblx0XHRpZiAoc3RyZWFtLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4yLTQ6IFRoZSBzdHJlYW0gaXMgaW4gYW4gZXJyb3JlZCBzdGF0ZSBhbmQgY2Fubm90IGJlIGNsb3NlZCcpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHJlYW0ucmVxdWVzdENsb3NlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzb3VyY2Ugc2hvdWxkIGNhbGwgdGhpcyBtZXRob2QgdG8gcHJvdmlkZSBkYXRhIHRvIHRoZSBzdHJlYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSBjaHVuayBUaGUgZGF0YSB0byBwcm92aWRlIHRvIHRoZSBzdHJlYW1cblx0ICovXG5cdGVucXVldWUoY2h1bms6IFQpOiB2b2lkIHtcblx0XHRpZiAoIWlzUmVhZGFibGVTdHJlYW1Db250cm9sbGVyKHRoaXMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4zLTE6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciNlbnF1ZXVlIGNhbiBvbmx5IGJlIHVzZWQgb24gYSBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInKTtcblx0XHR9XG5cblx0XHRjb25zdCBzdHJlYW0gPSB0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW07XG5cblx0XHRpZiAoc3RyZWFtLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHR0aHJvdyBzdHJlYW0uc3RvcmVkRXJyb3I7XG5cdFx0fVxuXG5cdFx0aWYgKHN0cmVhbS5jbG9zZVJlcXVlc3RlZCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy4zLjQuMy00OiBzdHJlYW0gaXMgZHJhaW5pbmcnKTtcblx0XHR9XG5cblx0XHRzdHJlYW0uZW5xdWV1ZShjaHVuayk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzb3VyY2Ugc2hvdWxkIGNhbGwgdGhpcyBtZXRob2QgdG8gaW5kaWNhdGUgYW4gZXJyb3IgY29uZGl0aW9uIHRvIHRoZSBzdHJlYW0gdGhhdCBpcnJlcGFyYWJseSBkaXNydXB0cyB0aGVcblx0ICogc291cmNlJ3MgKGFuZCB0aHVzIHRoZSBzdHJlYW0ncykgYWJpbGl0eSB0byBwcm92aWRlIGFsbCB0aGUgaW50ZW5kZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtIGVycm9yIEFuIGVycm9yIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGVycm9yIGNvbmRpdGlvbiBpbiB0aGUgc291cmNlXG5cdCAqL1xuXHRlcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcblx0XHRpZiAoIWlzUmVhZGFibGVTdHJlYW1Db250cm9sbGVyKHRoaXMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4zLTE6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciNlbnF1ZXVlIGNhbiBvbmx5IGJlIHVzZWQgb24gYSBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtLnN0YXRlICE9PSBTdGF0ZS5SZWFkYWJsZSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgMy4zLjQuMy0yOiB0aGUgc3RyZWFtIGlzICR7dGhpcy5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtLnN0YXRlfSBhbmQgc28gY2Fubm90IGJlIGVycm9yZWRgKTtcblx0XHR9XG5cdFx0Ly8gcmV0dXJuIGVycm9yUmVhZGFibGVTdHJlYW0odGhpcy5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtLCBlKTtcblx0XHR0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0uZXJyb3IoZXJyb3IpO1xuXHR9XG59XG4iXX0=