(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var globalObject = (function () {
        return this;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = globalObject;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dsb2JhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFBLElBQU0sWUFBWSxHQUFRLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDTDtzQkFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBnbG9iYWxPYmplY3Q6IGFueSA9IChmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcbmV4cG9ydCBkZWZhdWx0IGdsb2JhbE9iamVjdDtcbiJdfQ==