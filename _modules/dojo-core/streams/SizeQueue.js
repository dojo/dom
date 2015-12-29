(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    /**
     * This class is used internally by {@link ReadableStream} and {@link WritableStream} as a simple queue.
     * Each value in the queue includes a piece of metadata: the size of the value.
     */
    var SizeQueue = (function () {
        function SizeQueue() {
            this._queue = [];
        }
        Object.defineProperty(SizeQueue.prototype, "totalSize", {
            get: function () {
                var totalSize = 0;
                this._queue.forEach(function (pair) {
                    totalSize += pair.size;
                });
                return totalSize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SizeQueue.prototype, "length", {
            get: function () {
                return this._queue.length;
            },
            enumerable: true,
            configurable: true
        });
        SizeQueue.prototype.empty = function () {
            this._queue = [];
        };
        SizeQueue.prototype.enqueue = function (value, size) {
            this._queue.push({ value: value, size: size });
        };
        SizeQueue.prototype.dequeue = function () {
            var pair = this._queue.shift();
            return pair.value;
        };
        SizeQueue.prototype.peek = function () {
            var pair = this._queue[0];
            return pair.value;
        };
        return SizeQueue;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SizeQueue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2l6ZVF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvU2l6ZVF1ZXVlLnRzIl0sIm5hbWVzIjpbIlNpemVRdWV1ZSIsIlNpemVRdWV1ZS5jb25zdHJ1Y3RvciIsIlNpemVRdWV1ZS50b3RhbFNpemUiLCJTaXplUXVldWUubGVuZ3RoIiwiU2l6ZVF1ZXVlLmVtcHR5IiwiU2l6ZVF1ZXVlLmVucXVldWUiLCJTaXplUXVldWUuZGVxdWV1ZSIsIlNpemVRdWV1ZS5wZWVrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUtBOzs7T0FHRztJQUNIO1FBQUFBO1lBYVNDLFdBQU1BLEdBQWNBLEVBQUVBLENBQUNBO1FBbUJoQ0EsQ0FBQ0E7UUEvQkFELHNCQUFJQSxnQ0FBU0E7aUJBQWJBO2dCQUNDRSxJQUFJQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDbEJBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLFVBQVVBLElBQUlBO29CQUNqQyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDeEIsQ0FBQyxDQUFDQSxDQUFDQTtnQkFDSEEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDbEJBLENBQUNBOzs7V0FBQUY7UUFFREEsc0JBQUlBLDZCQUFNQTtpQkFBVkE7Z0JBQ0NHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQzNCQSxDQUFDQTs7O1dBQUFIO1FBSURBLHlCQUFLQSxHQUFMQTtZQUNDSSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNsQkEsQ0FBQ0E7UUFFREosMkJBQU9BLEdBQVBBLFVBQVFBLEtBQVFBLEVBQUVBLElBQVlBO1lBQzdCSyxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNoREEsQ0FBQ0E7UUFFREwsMkJBQU9BLEdBQVBBO1lBQ0NNLElBQU1BLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1lBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFFRE4sd0JBQUlBLEdBQUpBO1lBQ0NPLElBQU1BLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDRlAsZ0JBQUNBO0lBQURBLENBQUNBLEFBaENELElBZ0NDO0lBaENEOytCQWdDQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIFBhaXI8VD4ge1xuXHR2YWx1ZTogVDtcblx0c2l6ZTogbnVtYmVyO1xufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5IHtAbGluayBSZWFkYWJsZVN0cmVhbX0gYW5kIHtAbGluayBXcml0YWJsZVN0cmVhbX0gYXMgYSBzaW1wbGUgcXVldWUuXG4gKiBFYWNoIHZhbHVlIGluIHRoZSBxdWV1ZSBpbmNsdWRlcyBhIHBpZWNlIG9mIG1ldGFkYXRhOiB0aGUgc2l6ZSBvZiB0aGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpemVRdWV1ZTxUPiB7XG5cdGdldCB0b3RhbFNpemUoKTogbnVtYmVyIHtcblx0XHRsZXQgdG90YWxTaXplID0gMDtcblx0XHR0aGlzLl9xdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChwYWlyKSB7XG5cdFx0XHR0b3RhbFNpemUgKz0gcGFpci5zaXplO1xuXHRcdH0pO1xuXHRcdHJldHVybiB0b3RhbFNpemU7XG5cdH1cblxuXHRnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3F1ZXVlLmxlbmd0aDtcblx0fVxuXG5cdHByaXZhdGUgX3F1ZXVlOiBQYWlyPFQ+W10gPSBbXTtcblxuXHRlbXB0eSgpIHtcblx0XHR0aGlzLl9xdWV1ZSA9IFtdO1xuXHR9XG5cblx0ZW5xdWV1ZSh2YWx1ZTogVCwgc2l6ZTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5fcXVldWUucHVzaCh7IHZhbHVlOiB2YWx1ZSwgc2l6ZTogc2l6ZSB9KTtcblx0fVxuXG5cdGRlcXVldWUoKTogVCB7XG5cdFx0Y29uc3QgcGFpciA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG5cdFx0cmV0dXJuIHBhaXIudmFsdWU7XG5cdH1cblxuXHRwZWVrKCk6IFQge1xuXHRcdGNvbnN0IHBhaXIgPSB0aGlzLl9xdWV1ZVswXTtcblx0XHRyZXR1cm4gcGFpci52YWx1ZTtcblx0fVxufVxuIl19