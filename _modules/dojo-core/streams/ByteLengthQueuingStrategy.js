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
        define(["require", "exports", './QueuingStrategy', './util'], factory);
    }
})(function (require, exports) {
    var QueuingStrategy_1 = require('./QueuingStrategy');
    var util_1 = require('./util');
    var ByteLengthQueuingStrategy = (function (_super) {
        __extends(ByteLengthQueuingStrategy, _super);
        function ByteLengthQueuingStrategy() {
            _super.apply(this, arguments);
        }
        ByteLengthQueuingStrategy.prototype.size = function (chunk) {
            if (chunk.byteLength !== undefined) {
                return chunk.byteLength;
            }
            else {
                return util_1.getApproximateByteSize(chunk);
            }
        };
        return ByteLengthQueuingStrategy;
    })(QueuingStrategy_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ByteLengthQueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL0J5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3kudHMiXSwibmFtZXMiOlsiQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneSIsIkJ5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5LnNpemUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQSxnQ0FBNEIsbUJBQW1CLENBQUMsQ0FBQTtJQUNoRCxxQkFBdUMsUUFBUSxDQUFDLENBQUE7SUFFaEQ7UUFBMERBLDZDQUFrQkE7UUFBNUVBO1lBQTBEQyw4QkFBa0JBO1FBUzVFQSxDQUFDQTtRQVJBRCx3Q0FBSUEsR0FBSkEsVUFBS0EsS0FBUUE7WUFDWkUsRUFBRUEsQ0FBQ0EsQ0FBUUEsS0FBTUEsQ0FBQ0EsVUFBVUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVDQSxNQUFNQSxDQUFRQSxLQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUNqQ0EsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0xBLE1BQU1BLENBQUNBLDZCQUFzQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQ0ZGLGdDQUFDQTtJQUFEQSxDQUFDQSxBQVRELEVBQTBELHlCQUFlLEVBU3hFO0lBVEQ7K0NBU0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBRdWV1aW5nU3RyYXRlZ3kgZnJvbSAnLi9RdWV1aW5nU3RyYXRlZ3knO1xuaW1wb3J0IHsgZ2V0QXBwcm94aW1hdGVCeXRlU2l6ZSB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3k8VD4gZXh0ZW5kcyBRdWV1aW5nU3RyYXRlZ3k8VD4ge1xuXHRzaXplKGNodW5rOiBUKTogbnVtYmVyIHtcblx0XHRpZiAoKDxhbnk+IGNodW5rKS5ieXRlTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAoPGFueT4gY2h1bmspLmJ5dGVMZW5ndGg7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIGdldEFwcHJveGltYXRlQnl0ZVNpemUoY2h1bmspO1xuXHRcdH1cblx0fVxufVxuIl19