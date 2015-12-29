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
        define(["require", "exports", '../Promise', './ReadableStream', './SeekableStreamReader'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var ReadableStream_1 = require('./ReadableStream');
    var SeekableStreamReader_1 = require('./SeekableStreamReader');
    var SeekableStream = (function (_super) {
        __extends(SeekableStream, _super);
        /**
         * @param preventClose (default=true) Prevent the stream from closing when it reaches the end.
         * If true, the stream will not close when requestClose is called on the controller (which is typically done by the
         * source when it reaches its end). This allows for re-seeking in a stream that has already been read to the end.
         * The stream can be closed by calling ReadableStream#close.
         */
        function SeekableStream(underlyingSource, strategy, preventClose) {
            if (strategy === void 0) { strategy = {}; }
            if (preventClose === void 0) { preventClose = true; }
            _super.call(this, underlyingSource, strategy);
            this.preventClose = preventClose;
        }
        SeekableStream.prototype.getReader = function () {
            if (!this.readable || !this.seek) {
                throw new TypeError('Must be a SeekableStream instance');
            }
            return new SeekableStreamReader_1.default(this);
        };
        SeekableStream.prototype.requestClose = function () {
            if (!this.preventClose) {
                _super.prototype.requestClose.call(this);
            }
        };
        SeekableStream.prototype.seek = function (position) {
            var _this = this;
            if (this._underlyingSource.seek) {
                return this._underlyingSource.seek(this.controller, position);
            }
            else {
                if (this.reader && position < this.reader.currentPosition) {
                    return Promise_1.default.reject(new Error('Stream source is not seekable; cannot seek backwards'));
                }
                else {
                    var discardNext = function () {
                        return _this.reader.read().then(function (result) {
                            if (result.done || _this.reader.currentPosition === position) {
                                return Promise_1.default.resolve(_this.reader.currentPosition);
                            }
                            else {
                                return discardNext();
                            }
                        });
                    };
                    return discardNext();
                }
            }
        };
        Object.defineProperty(SeekableStream.prototype, "strategy", {
            get: function () {
                return this._strategy;
            },
            enumerable: true,
            configurable: true
        });
        return SeekableStream;
    })(ReadableStream_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SeekableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vla2FibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9TZWVrYWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6WyJTZWVrYWJsZVN0cmVhbSIsIlNlZWthYmxlU3RyZWFtLmNvbnN0cnVjdG9yIiwiU2Vla2FibGVTdHJlYW0uZ2V0UmVhZGVyIiwiU2Vla2FibGVTdHJlYW0ucmVxdWVzdENsb3NlIiwiU2Vla2FibGVTdHJlYW0uc2VlayIsIlNlZWthYmxlU3RyZWFtLnN0cmF0ZWd5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQ0Esd0JBQW9CLFlBQVksQ0FBQyxDQUFBO0lBQ2pDLCtCQUF1QyxrQkFBa0IsQ0FBQyxDQUFBO0lBRTFELHFDQUFpQyx3QkFBd0IsQ0FBQyxDQUFBO0lBRTFEO1FBQStDQSxrQ0FBaUJBO1FBSS9EQTs7Ozs7V0FLR0E7UUFDSEEsd0JBQVlBLGdCQUEyQkEsRUFBRUEsUUFBMEJBLEVBQUVBLFlBQTRCQTtZQUF4REMsd0JBQTBCQSxHQUExQkEsYUFBMEJBO1lBQUVBLDRCQUE0QkEsR0FBNUJBLG1CQUE0QkE7WUFDaEdBLGtCQUFNQSxnQkFBZ0JBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1lBRWxDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxZQUFZQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFFREQsa0NBQVNBLEdBQVRBO1lBQ0NFLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsTUFBTUEsSUFBSUEsU0FBU0EsQ0FBQ0EsbUNBQW1DQSxDQUFDQSxDQUFDQTtZQUMxREEsQ0FBQ0E7WUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsOEJBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFFREYscUNBQVlBLEdBQVpBO1lBQ0NHLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO2dCQUN4QkEsZ0JBQUtBLENBQUNBLFlBQVlBLFdBQUVBLENBQUNBO1lBQ3RCQSxDQUFDQTtRQUNGQSxDQUFDQTtRQUVESCw2QkFBSUEsR0FBSkEsVUFBS0EsUUFBZ0JBO1lBQXJCSSxpQkF1QkNBO1lBdEJBQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNqQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUMvREEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0xBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO29CQUMzREEsTUFBTUEsQ0FBQ0EsaUJBQU9BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLHNEQUFzREEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFGQSxDQUFDQTtnQkFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ0xBLElBQUlBLFdBQVdBLEdBQUdBO3dCQUNqQkEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsTUFBcUJBOzRCQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQzdEQSxNQUFNQSxDQUFDQSxpQkFBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7NEJBQ3JEQSxDQUFDQTs0QkFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0NBQ0xBLE1BQU1BLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBOzRCQUN0QkEsQ0FBQ0E7d0JBQ0ZBLENBQUNBLENBQUNBLENBQUNBO29CQUNKQSxDQUFDQSxDQUFDQTtvQkFFRkEsTUFBTUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7Z0JBQ3RCQSxDQUFDQTtZQUNGQSxDQUFDQTtRQUNGQSxDQUFDQTtRQUVESixzQkFBSUEsb0NBQVFBO2lCQUFaQTtnQkFDQ0ssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDdkJBLENBQUNBOzs7V0FBQUw7UUFDRkEscUJBQUNBO0lBQURBLENBQUNBLEFBMURELEVBQStDLHdCQUFjLEVBMEQ1RDtJQTFERDtvQ0EwREMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmF0ZWd5IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtLCB7IFNvdXJjZSB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW0nO1xuaW1wb3J0IHsgUmVhZFJlc3VsdCB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW1SZWFkZXInO1xuaW1wb3J0IFNlZWthYmxlU3RyZWFtUmVhZGVyIGZyb20gJy4vU2Vla2FibGVTdHJlYW1SZWFkZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWVrYWJsZVN0cmVhbTxUPiBleHRlbmRzIFJlYWRhYmxlU3RyZWFtPFQ+IHtcblx0cHJldmVudENsb3NlOiBib29sZWFuO1xuXHRyZWFkZXI6IFNlZWthYmxlU3RyZWFtUmVhZGVyPFQ+O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gcHJldmVudENsb3NlIChkZWZhdWx0PXRydWUpIFByZXZlbnQgdGhlIHN0cmVhbSBmcm9tIGNsb3Npbmcgd2hlbiBpdCByZWFjaGVzIHRoZSBlbmQuXG5cdCAqIElmIHRydWUsIHRoZSBzdHJlYW0gd2lsbCBub3QgY2xvc2Ugd2hlbiByZXF1ZXN0Q2xvc2UgaXMgY2FsbGVkIG9uIHRoZSBjb250cm9sbGVyICh3aGljaCBpcyB0eXBpY2FsbHkgZG9uZSBieSB0aGVcblx0ICogc291cmNlIHdoZW4gaXQgcmVhY2hlcyBpdHMgZW5kKS4gVGhpcyBhbGxvd3MgZm9yIHJlLXNlZWtpbmcgaW4gYSBzdHJlYW0gdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHJlYWQgdG8gdGhlIGVuZC5cblx0ICogVGhlIHN0cmVhbSBjYW4gYmUgY2xvc2VkIGJ5IGNhbGxpbmcgUmVhZGFibGVTdHJlYW0jY2xvc2UuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bmRlcmx5aW5nU291cmNlOiBTb3VyY2U8VD4sIHN0cmF0ZWd5OiBTdHJhdGVneTxUPiA9IHt9LCBwcmV2ZW50Q2xvc2U6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0c3VwZXIodW5kZXJseWluZ1NvdXJjZSwgc3RyYXRlZ3kpO1xuXG5cdFx0dGhpcy5wcmV2ZW50Q2xvc2UgPSBwcmV2ZW50Q2xvc2U7XG5cdH1cblxuXHRnZXRSZWFkZXIoKTogU2Vla2FibGVTdHJlYW1SZWFkZXI8VD4ge1xuXHRcdGlmICghdGhpcy5yZWFkYWJsZSB8fCAhdGhpcy5zZWVrKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IGJlIGEgU2Vla2FibGVTdHJlYW0gaW5zdGFuY2UnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFNlZWthYmxlU3RyZWFtUmVhZGVyKHRoaXMpO1xuXHR9XG5cblx0cmVxdWVzdENsb3NlKCk6IHZvaWQge1xuXHRcdGlmICghdGhpcy5wcmV2ZW50Q2xvc2UpIHtcblx0XHRcdHN1cGVyLnJlcXVlc3RDbG9zZSgpO1xuXHRcdH1cblx0fVxuXG5cdHNlZWsocG9zaXRpb246IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiB7XG5cdFx0aWYgKHRoaXMuX3VuZGVybHlpbmdTb3VyY2Uuc2Vlaykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3VuZGVybHlpbmdTb3VyY2Uuc2Vlayh0aGlzLmNvbnRyb2xsZXIsIHBvc2l0aW9uKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodGhpcy5yZWFkZXIgJiYgcG9zaXRpb24gPCB0aGlzLnJlYWRlci5jdXJyZW50UG9zaXRpb24pIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignU3RyZWFtIHNvdXJjZSBpcyBub3Qgc2Vla2FibGU7IGNhbm5vdCBzZWVrIGJhY2t3YXJkcycpKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRsZXQgZGlzY2FyZE5leHQgPSAoKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZWFkZXIucmVhZCgpLnRoZW4oKHJlc3VsdDogUmVhZFJlc3VsdDxUPikgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5kb25lIHx8IHRoaXMucmVhZGVyLmN1cnJlbnRQb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnJlYWRlci5jdXJyZW50UG9zaXRpb24pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBkaXNjYXJkTmV4dCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJldHVybiBkaXNjYXJkTmV4dCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldCBzdHJhdGVneSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RyYXRlZ3k7XG5cdH1cbn1cbiJdfQ==