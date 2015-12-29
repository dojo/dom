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
        define(["require", "exports", './QueuingStrategy'], factory);
    }
})(function (require, exports) {
    var QueuingStrategy_1 = require('./QueuingStrategy');
    var CountQueuingStrategy = (function (_super) {
        __extends(CountQueuingStrategy, _super);
        function CountQueuingStrategy() {
            _super.apply(this, arguments);
        }
        CountQueuingStrategy.prototype.size = function (chunk) {
            return 1;
        };
        return CountQueuingStrategy;
    })(QueuingStrategy_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CountQueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291bnRRdWV1aW5nU3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9Db3VudFF1ZXVpbmdTdHJhdGVneS50cyJdLCJuYW1lcyI6WyJDb3VudFF1ZXVpbmdTdHJhdGVneSIsIkNvdW50UXVldWluZ1N0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiQ291bnRRdWV1aW5nU3RyYXRlZ3kuc2l6ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBLGdDQUE0QixtQkFBbUIsQ0FBQyxDQUFBO0lBRWhEO1FBQXFEQSx3Q0FBa0JBO1FBQXZFQTtZQUFxREMsOEJBQWtCQTtRQUl2RUEsQ0FBQ0E7UUFIQUQsbUNBQUlBLEdBQUpBLFVBQUtBLEtBQVFBO1lBQ1pFLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO1FBQ0ZGLDJCQUFDQTtJQUFEQSxDQUFDQSxBQUpELEVBQXFELHlCQUFlLEVBSW5FO0lBSkQ7MENBSUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBRdWV1aW5nU3RyYXRlZ3kgZnJvbSAnLi9RdWV1aW5nU3RyYXRlZ3knO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb3VudFF1ZXVpbmdTdHJhdGVneTxUPiBleHRlbmRzIFF1ZXVpbmdTdHJhdGVneTxUPiB7XG5cdHNpemUoY2h1bms6IFQpOiBudW1iZXIge1xuXHRcdHJldHVybiAxO1xuXHR9XG59XG4iXX0=