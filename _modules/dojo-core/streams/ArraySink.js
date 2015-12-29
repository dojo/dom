(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    // Since this Sink is doing no asynchronous operations,
    // use a single resolved promise for all returned promises.
    var resolved = Promise_1.default.resolve();
    /**
     * A WritableStream sink that collects the chunks it receives and
     * stores them into an array.  Use the chunks property to retrieve
     * the collection of chunks.
     */
    var ArraySink = (function () {
        function ArraySink() {
        }
        ArraySink.prototype.abort = function (reason) {
            return resolved;
        };
        ArraySink.prototype.close = function () {
            return Promise_1.default.resolve();
        };
        ArraySink.prototype.start = function (error) {
            this.chunks = [];
            return resolved;
        };
        ArraySink.prototype.write = function (chunk) {
            if (chunk) {
                this.chunks.push(chunk);
            }
            return resolved;
        };
        return ArraySink;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ArraySink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJyYXlTaW5rLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvQXJyYXlTaW5rLnRzIl0sIm5hbWVzIjpbIkFycmF5U2luayIsIkFycmF5U2luay5jb25zdHJ1Y3RvciIsIkFycmF5U2luay5hYm9ydCIsIkFycmF5U2luay5jbG9zZSIsIkFycmF5U2luay5zdGFydCIsIkFycmF5U2luay53cml0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQSx3QkFBb0IsWUFBWSxDQUFDLENBQUE7SUFHakMsdURBQXVEO0lBQ3ZELDJEQUEyRDtJQUMzRCxJQUFJLFFBQVEsR0FBRyxpQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWpDOzs7O09BSUc7SUFDSDtRQUFBQTtRQXVCQUMsQ0FBQ0E7UUFuQkFELHlCQUFLQSxHQUFMQSxVQUFNQSxNQUFXQTtZQUNoQkUsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBRURGLHlCQUFLQSxHQUFMQTtZQUNDRyxNQUFNQSxDQUFDQSxpQkFBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDMUJBLENBQUNBO1FBRURILHlCQUFLQSxHQUFMQSxVQUFNQSxLQUFpQkE7WUFDdEJJLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2pCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFFREoseUJBQUtBLEdBQUxBLFVBQU1BLEtBQVFBO1lBQ2JLLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO2dCQUNYQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUN6QkEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQ0ZMLGdCQUFDQTtJQUFEQSxDQUFDQSxBQXZCRCxJQXVCQztJQXZCRDsrQkF1QkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0IHsgU2luayB9IGZyb20gJy4vV3JpdGFibGVTdHJlYW0nO1xuXG4vLyBTaW5jZSB0aGlzIFNpbmsgaXMgZG9pbmcgbm8gYXN5bmNocm9ub3VzIG9wZXJhdGlvbnMsXG4vLyB1c2UgYSBzaW5nbGUgcmVzb2x2ZWQgcHJvbWlzZSBmb3IgYWxsIHJldHVybmVkIHByb21pc2VzLlxubGV0IHJlc29sdmVkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbi8qKlxuICogQSBXcml0YWJsZVN0cmVhbSBzaW5rIHRoYXQgY29sbGVjdHMgdGhlIGNodW5rcyBpdCByZWNlaXZlcyBhbmRcbiAqIHN0b3JlcyB0aGVtIGludG8gYW4gYXJyYXkuICBVc2UgdGhlIGNodW5rcyBwcm9wZXJ0eSB0byByZXRyaWV2ZVxuICogdGhlIGNvbGxlY3Rpb24gb2YgY2h1bmtzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcnJheVNpbms8VD4gaW1wbGVtZW50cyBTaW5rPFQ+IHtcblxuXHRjaHVua3M6IFRbXTtcblxuXHRhYm9ydChyZWFzb246IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiByZXNvbHZlZDtcblx0fVxuXG5cdGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdHN0YXJ0KGVycm9yOiAoKSA9PiB2b2lkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5jaHVua3MgPSBbXTtcblx0XHRyZXR1cm4gcmVzb2x2ZWQ7XG5cdH1cblxuXHR3cml0ZShjaHVuazogVCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChjaHVuaykge1xuXHRcdFx0dGhpcy5jaHVua3MucHVzaChjaHVuayk7XG5cdFx0fVxuXHRcdHJldHVybiByZXNvbHZlZDtcblx0fVxufVxuIl19