(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var QueuingStrategy = (function () {
        function QueuingStrategy(kwArgs) {
            this.highWaterMark = kwArgs.highWaterMark;
        }
        return QueuingStrategy;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVldWluZ1N0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvUXVldWluZ1N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbIlF1ZXVpbmdTdHJhdGVneSIsIlF1ZXVpbmdTdHJhdGVneS5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFFQTtRQUdDQSx5QkFBWUEsTUFBY0E7WUFDekJDLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBO1FBQzNDQSxDQUFDQTtRQUNGRCxzQkFBQ0E7SUFBREEsQ0FBQ0EsQUFORCxJQU1DO0lBTkQ7cUNBTUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmF0ZWd5IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVldWluZ1N0cmF0ZWd5PFQ+IGltcGxlbWVudHMgU3RyYXRlZ3k8VD4ge1xuXHRoaWdoV2F0ZXJNYXJrOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3Ioa3dBcmdzOiBLd0FyZ3MpIHtcblx0XHR0aGlzLmhpZ2hXYXRlck1hcmsgPSBrd0FyZ3MuaGlnaFdhdGVyTWFyaztcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEt3QXJncyB7XG5cdGhpZ2hXYXRlck1hcms6IG51bWJlcjtcbn1cbiJdfQ==