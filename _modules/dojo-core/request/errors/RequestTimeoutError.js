(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var RequestTimeoutError = (function () {
        function RequestTimeoutError(message) {
            this.message = message || 'The request timed out.';
        }
        Object.defineProperty(RequestTimeoutError.prototype, "name", {
            get: function () {
                return 'RequestTimeoutError';
            },
            enumerable: true,
            configurable: true
        });
        return RequestTimeoutError;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RequestTimeoutError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFRpbWVvdXRFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXF1ZXN0L2Vycm9ycy9SZXF1ZXN0VGltZW91dEVycm9yLnRzIl0sIm5hbWVzIjpbIlJlcXVlc3RUaW1lb3V0RXJyb3IiLCJSZXF1ZXN0VGltZW91dEVycm9yLmNvbnN0cnVjdG9yIiwiUmVxdWVzdFRpbWVvdXRFcnJvci5uYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUVBO1FBUUNBLDZCQUFZQSxPQUFnQkE7WUFDM0JDLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLElBQUlBLHdCQUF3QkEsQ0FBQ0E7UUFDcERBLENBQUNBO1FBUkRELHNCQUFJQSxxQ0FBSUE7aUJBQVJBO2dCQUNDRSxNQUFNQSxDQUFDQSxxQkFBcUJBLENBQUNBO1lBQzlCQSxDQUFDQTs7O1dBQUFGO1FBT0ZBLDBCQUFDQTtJQUFEQSxDQUFDQSxBQVhELElBV0M7SUFYRDt5Q0FXQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVxdWVzdEVycm9yLCBSZXNwb25zZSB9IGZyb20gJy4uLy4uL3JlcXVlc3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXF1ZXN0VGltZW91dEVycm9yPFQ+IGltcGxlbWVudHMgUmVxdWVzdEVycm9yPFQ+IHtcblx0bWVzc2FnZTogc3RyaW5nO1xuXHRnZXQgbmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiAnUmVxdWVzdFRpbWVvdXRFcnJvcic7XG5cdH1cblxuXHRyZXNwb25zZTogUmVzcG9uc2U8VD47XG5cblx0Y29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZykge1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgJ1RoZSByZXF1ZXN0IHRpbWVkIG91dC4nO1xuXHR9XG59XG4iXX0=