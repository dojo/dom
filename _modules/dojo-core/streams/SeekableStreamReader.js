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
        define(["require", "exports", '../Promise', './ReadableStreamReader'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var ReadableStreamReader_1 = require('./ReadableStreamReader');
    var SeekableStreamReader = (function (_super) {
        __extends(SeekableStreamReader, _super);
        function SeekableStreamReader() {
            _super.apply(this, arguments);
            this._currentPosition = 0;
        }
        Object.defineProperty(SeekableStreamReader.prototype, "currentPosition", {
            get: function () {
                return this._currentPosition;
            },
            enumerable: true,
            configurable: true
        });
        SeekableStreamReader.prototype.read = function () {
            var _this = this;
            return _super.prototype.read.call(this).then(function (result) {
                if (!result.done) {
                    var chunkSize = 1;
                    try {
                        if (_this._ownerReadableStream.strategy && _this._ownerReadableStream.strategy.size) {
                            chunkSize = _this._ownerReadableStream.strategy.size(result.value);
                        }
                    }
                    catch (error) {
                        _this._ownerReadableStream.error(error);
                        return Promise_1.default.reject(error);
                    }
                    _this._currentPosition += chunkSize;
                }
                return Promise_1.default.resolve(result);
            }, function (error) {
                return Promise_1.default.reject(error);
            });
        };
        SeekableStreamReader.prototype.seek = function (position) {
            var _this = this;
            if (position === this._currentPosition) {
                return Promise_1.default.resolve(this._currentPosition);
            }
            if (position < this._currentPosition) {
                this._ownerReadableStream.queue.empty();
            }
            // Drain the queue of any items prior to the desired seek position
            while (position > this._currentPosition && this._ownerReadableStream.queue.length) {
                var chunkSize = 1;
                var chunk = this._ownerReadableStream.queue.dequeue();
                if (this._ownerReadableStream.strategy && this._ownerReadableStream.strategy.size) {
                    try {
                        chunkSize = this._ownerReadableStream.strategy.size(chunk);
                    }
                    catch (error) {
                        return Promise_1.default.reject(error);
                    }
                }
                this._currentPosition += chunkSize;
            }
            // If there's anything left in the queue, we don't need to seek in the source, we can read from the queue
            if (this._ownerReadableStream.queue.length) {
                return Promise_1.default.resolve(this._currentPosition);
            }
            return this._ownerReadableStream.seek(position).then(function (position) {
                _this._currentPosition = position;
                return Promise_1.default.resolve(position);
            }, function (error) {
                return Promise_1.default.reject(error);
            });
        };
        return SeekableStreamReader;
    })(ReadableStreamReader_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SeekableStreamReader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vla2FibGVTdHJlYW1SZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9TZWVrYWJsZVN0cmVhbVJlYWRlci50cyJdLCJuYW1lcyI6WyJTZWVrYWJsZVN0cmVhbVJlYWRlciIsIlNlZWthYmxlU3RyZWFtUmVhZGVyLmNvbnN0cnVjdG9yIiwiU2Vla2FibGVTdHJlYW1SZWFkZXIuY3VycmVudFBvc2l0aW9uIiwiU2Vla2FibGVTdHJlYW1SZWFkZXIucmVhZCIsIlNlZWthYmxlU3RyZWFtUmVhZGVyLnNlZWsiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQSx3QkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMscUNBQWlELHdCQUF3QixDQUFDLENBQUE7SUFHMUU7UUFBcURBLHdDQUF1QkE7UUFBNUVBO1lBQXFEQyw4QkFBdUJBO1lBQ2pFQSxxQkFBZ0JBLEdBQVdBLENBQUNBLENBQUNBO1FBdUV4Q0EsQ0FBQ0E7UUFwRUFELHNCQUFJQSxpREFBZUE7aUJBQW5CQTtnQkFDQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7OztXQUFBRjtRQUVEQSxtQ0FBSUEsR0FBSkE7WUFBQUcsaUJBdUJDQTtZQXRCQUEsTUFBTUEsQ0FBQ0EsZ0JBQUtBLENBQUNBLElBQUlBLFdBQUVBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLE1BQXFCQTtnQkFDOUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO29CQUNsQkEsSUFBSUEsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBRWxCQSxJQUFJQSxDQUFDQTt3QkFDSkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxJQUFJQSxLQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNB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O1lBRURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsUUFBZ0JBO2dCQUNyRUEsS0FBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxRQUFRQSxDQUFDQTtnQkFFakNBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUNsQ0EsQ0FBQ0EsRUFBRUEsVUFBQ0EsS0FBWUE7Z0JBQ2ZBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUM5QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDSkEsQ0FBQ0E7UUFDRkosMkJBQUNBO0lBQURBLENBQUNBLEFBeEVELEVBQXFELDhCQUFvQixFQXdFeEU7SUF4RUQ7MENBd0VDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9Qcm9taXNlJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbVJlYWRlciwgeyBSZWFkUmVzdWx0IH0gZnJvbSAnLi9SZWFkYWJsZVN0cmVhbVJlYWRlcic7XG5pbXBvcnQgU2Vla2FibGVTdHJlYW0gZnJvbSAnLi9TZWVrYWJsZVN0cmVhbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlZWthYmxlU3RyZWFtUmVhZGVyPFQ+IGV4dGVuZHMgUmVhZGFibGVTdHJlYW1SZWFkZXI8VD4ge1xuXHRwcm90ZWN0ZWQgX2N1cnJlbnRQb3NpdGlvbjogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIF9vd25lclJlYWRhYmxlU3RyZWFtOiBTZWVrYWJsZVN0cmVhbTxUPjtcblxuXHRnZXQgY3VycmVudFBvc2l0aW9uKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRQb3NpdGlvbjtcblx0fVxuXG5cdHJlYWQoKTogUHJvbWlzZTxSZWFkUmVzdWx0PFQ+PiB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlYWQoKS50aGVuKChyZXN1bHQ6IFJlYWRSZXN1bHQ8VD4pID0+IHtcblx0XHRcdGlmICghcmVzdWx0LmRvbmUpIHtcblx0XHRcdFx0bGV0IGNodW5rU2l6ZSA9IDE7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAodGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5zdHJhdGVneSAmJiB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0cmF0ZWd5LnNpemUpIHtcblx0XHRcdFx0XHRcdGNodW5rU2l6ZSA9IHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RyYXRlZ3kuc2l6ZShyZXN1bHQudmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLmVycm9yKGVycm9yKTtcblxuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9jdXJyZW50UG9zaXRpb24gKz0gY2h1bmtTaXplO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG5cdFx0fSwgZnVuY3Rpb24gKGVycm9yOiBFcnJvcikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblx0fVxuXG5cdHNlZWsocG9zaXRpb246IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiB7XG5cdFx0aWYgKHBvc2l0aW9uID09PSB0aGlzLl9jdXJyZW50UG9zaXRpb24pIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY3VycmVudFBvc2l0aW9uKTtcblx0XHR9XG5cblx0XHRpZiAocG9zaXRpb24gPCB0aGlzLl9jdXJyZW50UG9zaXRpb24pIHtcblx0XHRcdHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0ucXVldWUuZW1wdHkoKTtcblx0XHR9XG5cblx0XHQvLyBEcmFpbiB0aGUgcXVldWUgb2YgYW55IGl0ZW1zIHByaW9yIHRvIHRoZSBkZXNpcmVkIHNlZWsgcG9zaXRpb25cblx0XHR3aGlsZSAocG9zaXRpb24gPiB0aGlzLl9jdXJyZW50UG9zaXRpb24gJiYgdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5xdWV1ZS5sZW5ndGgpIHtcblx0XHRcdGxldCBjaHVua1NpemUgPSAxO1xuXHRcdFx0bGV0IGNodW5rID0gdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5xdWV1ZS5kZXF1ZXVlKCk7XG5cblx0XHRcdGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0cmF0ZWd5ICYmIHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RyYXRlZ3kuc2l6ZSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNodW5rU2l6ZSA9IHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RyYXRlZ3kuc2l6ZShjaHVuayk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9jdXJyZW50UG9zaXRpb24gKz0gY2h1bmtTaXplO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZXJlJ3MgYW55dGhpbmcgbGVmdCBpbiB0aGUgcXVldWUsIHdlIGRvbid0IG5lZWQgdG8gc2VlayBpbiB0aGUgc291cmNlLCB3ZSBjYW4gcmVhZCBmcm9tIHRoZSBxdWV1ZVxuXHRcdGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnF1ZXVlLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jdXJyZW50UG9zaXRpb24pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnNlZWsocG9zaXRpb24pLnRoZW4oKHBvc2l0aW9uOiBudW1iZXIpID0+IHtcblx0XHRcdHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBvc2l0aW9uKTtcblx0XHR9LCAoZXJyb3I6IEVycm9yKSA9PiB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG59XG4iXX0=