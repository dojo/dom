(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has'], factory);
    }
})(function (require, exports) {
    var has_1 = require('./has');
    function hasClass(feature, trueClass, falseClass) {
        return function (target) {
            return (has_1.default(feature) ? trueClass : falseClass);
        };
    }
    exports.hasClass = hasClass;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbImhhc0NsYXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFBLG9CQUFnQixPQUFPLENBQUMsQ0FBQTtJQUV4QixrQkFBeUIsT0FBZSxFQUFFLFNBQW1CLEVBQUUsVUFBb0I7UUFDbEZBLE1BQU1BLENBQUNBLFVBQThCQSxNQUFTQTtZQUM3QyxNQUFNLENBQU8sQ0FBQyxhQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFKZSxnQkFBUSxXQUl2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDbGFzcyhmZWF0dXJlOiBzdHJpbmcsIHRydWVDbGFzczogRnVuY3Rpb24sIGZhbHNlQ2xhc3M6IEZ1bmN0aW9uKTogQ2xhc3NEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gPFQgZXh0ZW5kcyBGdW5jdGlvbj4odGFyZ2V0OiBUKTogVCB7XG5cdFx0cmV0dXJuIDxhbnk+IChoYXMoZmVhdHVyZSkgPyB0cnVlQ2xhc3MgOiBmYWxzZUNsYXNzKTtcblx0fTtcbn1cbiJdfQ==