(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../../Promise');
    var WritableNodeStreamSink = (function () {
        function WritableNodeStreamSink(nodeStream, encoding) {
            if (encoding === void 0) { encoding = ''; }
            this._isClosed = false;
            this._encoding = encoding;
            this._nodeStream = nodeStream;
            this._onError = this._handleError.bind(this);
            this._nodeStream.on('error', this._onError);
        }
        WritableNodeStreamSink.prototype._handleError = function (error) {
            this._isClosed = true;
            this._removeListeners();
            if (this._rejectWritePromise) {
                this._rejectWritePromise(error);
                this._rejectWritePromise = undefined;
            }
            throw error;
        };
        WritableNodeStreamSink.prototype._removeListeners = function () {
            this._nodeStream.removeListener('error', this._onError);
        };
        WritableNodeStreamSink.prototype.abort = function (reason) {
            // TODO: is there anything else to do here?
            return this.close();
        };
        WritableNodeStreamSink.prototype.close = function () {
            var _this = this;
            this._isClosed = true;
            this._removeListeners();
            return new Promise_1.default(function (resolve, reject) {
                // TODO: if the node stream returns an error from 'end', should we:
                // 1. reject this.close with the error? (implemented)
                // 2. put 'this' into an error state? (this._handleError)
                _this._nodeStream.end(null, null, function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        };
        WritableNodeStreamSink.prototype.start = function () {
            if (this._isClosed) {
                return Promise_1.default.reject(new Error('Stream is closed'));
            }
            return Promise_1.default.resolve();
        };
        WritableNodeStreamSink.prototype.write = function (chunk) {
            var _this = this;
            if (this._isClosed) {
                return Promise_1.default.reject(new Error('Stream is closed'));
            }
            return new Promise_1.default(function (resolve, reject) {
                _this._rejectWritePromise = reject;
                _this._nodeStream.write(chunk, _this._encoding, function (error) {
                    if (error) {
                        _this._handleError(error);
                    }
                    else {
                        _this._rejectWritePromise = undefined;
                        resolve();
                    }
                });
            });
        };
        return WritableNodeStreamSink;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WritableNodeStreamSink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3JpdGFibGVOb2RlU3RyZWFtU2luay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJlYW1zL2FkYXB0ZXJzL1dyaXRhYmxlTm9kZVN0cmVhbVNpbmsudHMiXSwibmFtZXMiOlsiV3JpdGFibGVOb2RlU3RyZWFtU2luayIsIldyaXRhYmxlTm9kZVN0cmVhbVNpbmsuY29uc3RydWN0b3IiLCJXcml0YWJsZU5vZGVTdHJlYW1TaW5rLl9oYW5kbGVFcnJvciIsIldyaXRhYmxlTm9kZVN0cmVhbVNpbmsuX3JlbW92ZUxpc3RlbmVycyIsIldyaXRhYmxlTm9kZVN0cmVhbVNpbmsuYWJvcnQiLCJXcml0YWJsZU5vZGVTdHJlYW1TaW5rLmNsb3NlIiwiV3JpdGFibGVOb2RlU3RyZWFtU2luay5zdGFydCIsIldyaXRhYmxlTm9kZVN0cmVhbVNpbmsud3JpdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsd0JBQW9CLGVBQWUsQ0FBQyxDQUFBO0lBS3BDO1FBT0NBLGdDQUFZQSxVQUFpQ0EsRUFBRUEsUUFBcUJBO1lBQXJCQyx3QkFBcUJBLEdBQXJCQSxhQUFxQkE7WUFDbkVBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBO1lBRXZCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFDOUJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFFU0QsNkNBQVlBLEdBQXRCQSxVQUF1QkEsS0FBWUE7WUFDbENFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdB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Q0FBQ0E7d0JBQ0xBLEtBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsU0FBU0EsQ0FBQ0E7d0JBQ3JDQSxPQUFPQSxFQUFFQSxDQUFDQTtvQkFDWEEsQ0FBQ0E7Z0JBQ0ZBLENBQUNBLENBQUNBLENBQUNBO1lBQ0pBLENBQUNBLENBQUNBLENBQUNBO1FBQ0pBLENBQUNBO1FBQ0ZQLDZCQUFDQTtJQUFEQSxDQUFDQSxBQW5GRCxJQW1GQztJQW5GRDs0Q0FtRkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJy4uLy4uL1Byb21pc2UnO1xuaW1wb3J0IHsgU2luayB9IGZyb20gJy4uL1dyaXRhYmxlU3RyZWFtJztcblxuZXhwb3J0IHR5cGUgTm9kZVNvdXJjZVR5cGUgPSBCdWZmZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyaXRhYmxlTm9kZVN0cmVhbVNpbmsgaW1wbGVtZW50cyBTaW5rPE5vZGVTb3VyY2VUeXBlPiB7XG5cdHByb3RlY3RlZCBfZW5jb2Rpbmc6IHN0cmluZztcblx0cHJvdGVjdGVkIF9pc0Nsb3NlZDogYm9vbGVhbjtcblx0cHJvdGVjdGVkIF9ub2RlU3RyZWFtOiBOb2RlSlMuV3JpdGFibGVTdHJlYW07XG5cdHByb3RlY3RlZCBfb25FcnJvcjogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblx0cHJvdGVjdGVkIF9yZWplY3RXcml0ZVByb21pc2U6IEZ1bmN0aW9uO1xuXG5cdGNvbnN0cnVjdG9yKG5vZGVTdHJlYW06IE5vZGVKUy5Xcml0YWJsZVN0cmVhbSwgZW5jb2Rpbmc6IHN0cmluZyA9ICcnKSB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuX2VuY29kaW5nID0gZW5jb2Rpbmc7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbSA9IG5vZGVTdHJlYW07XG5cdFx0dGhpcy5fb25FcnJvciA9IHRoaXMuX2hhbmRsZUVycm9yLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbS5vbignZXJyb3InLCB0aGlzLl9vbkVycm9yKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuXHRcdHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuXG5cdFx0aWYgKHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSkge1xuXHRcdFx0dGhpcy5fcmVqZWN0V3JpdGVQcm9taXNlKGVycm9yKTtcblx0XHRcdHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnJvcjtcblx0fVxuXG5cdHByb3RlY3RlZCBfcmVtb3ZlTGlzdGVuZXJzKCk6IHZvaWQge1xuXHRcdHRoaXMuX25vZGVTdHJlYW0ucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fb25FcnJvcik7XG5cdH1cblxuXHRhYm9ydChyZWFzb246IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIFRPRE86IGlzIHRoZXJlIGFueXRoaW5nIGVsc2UgdG8gZG8gaGVyZT9cblx0XHRyZXR1cm4gdGhpcy5jbG9zZSgpO1xuXHR9XG5cblx0Y2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuXHRcdHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIFRPRE86IGlmIHRoZSBub2RlIHN0cmVhbSByZXR1cm5zIGFuIGVycm9yIGZyb20gJ2VuZCcsIHNob3VsZCB3ZTpcblx0XHRcdC8vIDEuIHJlamVjdCB0aGlzLmNsb3NlIHdpdGggdGhlIGVycm9yPyAoaW1wbGVtZW50ZWQpXG5cdFx0XHQvLyAyLiBwdXQgJ3RoaXMnIGludG8gYW4gZXJyb3Igc3RhdGU/ICh0aGlzLl9oYW5kbGVFcnJvcilcblx0XHRcdHRoaXMuX25vZGVTdHJlYW0uZW5kKG51bGwsIG51bGwsIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0c3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKHRoaXMuX2lzQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdTdHJlYW0gaXMgY2xvc2VkJykpO1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdHdyaXRlKGNodW5rOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5faXNDbG9zZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1N0cmVhbSBpcyBjbG9zZWQnKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSA9IHJlamVjdDtcblxuXHRcdFx0dGhpcy5fbm9kZVN0cmVhbS53cml0ZShjaHVuaywgdGhpcy5fZW5jb2RpbmcsIChlcnJvcj86IEVycm9yKSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRcdHRoaXMuX2hhbmRsZUVycm9yKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9yZWplY3RXcml0ZVByb21pc2UgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxufVxuIl19