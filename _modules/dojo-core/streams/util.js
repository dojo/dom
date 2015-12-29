(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    /*
    Based on sizeof.js by Stephen Morley
    
    A function to calculate the approximate memory usage of objects
    
    Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
    the terms of the CC0 1.0 Universal legal code:
    
    http://creativecommons.org/publicdomain/zero/1.0/legalcode
    
    Returns the approximate memory usage, in bytes, of the specified object.
    */
    function getApproximateByteSize(object) {
        var objects = [object];
        var size = 0;
        for (var index = 0; index < objects.length; index++) {
            switch (typeof objects[index]) {
                case 'boolean':
                    size += 4;
                    break;
                case 'number':
                    size += 8;
                    break;
                case 'string':
                    size += 2 * objects[index].length;
                    break;
                case 'object':
                    // if the object is not an array, add the sizes of the keys
                    if (Object.prototype.toString.call(objects[index]) !== '[object Array]') {
                        for (var key in objects[index]) {
                            size += 2 * key.length;
                        }
                    }
                    // loop over the keys
                    for (var key in objects[index]) {
                        // determine whether the value has already been processed
                        var processed = false;
                        for (var j = 0; j < objects.length; j++) {
                            if (objects[j] === objects[index][key]) {
                                processed = true;
                                break;
                            }
                        }
                        // queue the value to be processed if appropriate
                        if (!processed) {
                            objects.push(objects[index][key]);
                        }
                    }
            }
        }
        return size;
    }
    exports.getApproximateByteSize = getApproximateByteSize;
    /**
     * Calls the method or returns undefined.
     */
    function invokeOrNoop(O, P, args) {
        if (args === void 0) { args = []; }
        var method = O[P];
        return method ? method.apply(O, args) : undefined;
    }
    exports.invokeOrNoop = invokeOrNoop;
    function normalizeStrategy(_a) {
        var size = _a.size, _b = _a.highWaterMark, highWaterMark = _b === void 0 ? 1 : _b;
        return {
            size: size,
            highWaterMark: highWaterMark > 0 ? highWaterMark : 1
        };
    }
    exports.normalizeStrategy = normalizeStrategy;
    function promiseInvokeOrFallbackOrNoop(object, method1, args1, method2, args2) {
        if (args2 === void 0) { args2 = []; }
        var method;
        try {
            method = object[method1];
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
        if (!method) {
            return promiseInvokeOrNoop(object, method2, args2);
        }
        if (!args1) {
            args1 = [];
        }
        try {
            return Promise_1.default.resolve(method.apply(object, args1));
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
    }
    exports.promiseInvokeOrFallbackOrNoop = promiseInvokeOrFallbackOrNoop;
    /**
     * Returns a promise that resolves the with result of the method call or undefined.
     */
    function promiseInvokeOrNoop(O, P, args) {
        if (args === void 0) { args = []; }
        var method;
        try {
            method = O[P];
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
        if (!method) {
            return Promise_1.default.resolve();
        }
        try {
            return Promise_1.default.resolve(method.apply(O, args));
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
    }
    exports.promiseInvokeOrNoop = promiseInvokeOrNoop;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL3V0aWwudHMiXSwibmFtZXMiOlsiZ2V0QXBwcm94aW1hdGVCeXRlU2l6ZSIsImludm9rZU9yTm9vcCIsIm5vcm1hbGl6ZVN0cmF0ZWd5IiwicHJvbWlzZUludm9rZU9yRmFsbGJhY2tPck5vb3AiLCJwcm9taXNlSW52b2tlT3JOb29wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUNBLHdCQUFvQixZQUFZLENBQUMsQ0FBQTtJQUVqQzs7Ozs7Ozs7Ozs7TUFXRTtJQUNGLGdDQUF1QyxNQUFXO1FBQ2pEQSxJQUFJQSxPQUFPQSxHQUFHQSxDQUFFQSxNQUFNQSxDQUFFQSxDQUFDQTtRQUN6QkEsSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFYkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDckRBLE1BQU1BLENBQUNBLENBQUNBLE9BQU9BLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvQkEsS0FBS0EsU0FBU0E7b0JBQ2JBLElBQUlBLElBQUlBLENBQUNBLENBQUNBO29CQUNWQSxLQUFLQSxDQUFDQTtnQkFFUEEsS0FBS0EsUUFBUUE7b0JBQ1pBLElBQUlBLElBQUlBLENBQUNBLENBQUNBO29CQUNWQSxLQUFLQSxDQUFDQTtnQkFFUEEsS0FBS0EsUUFBUUE7b0JBQ1pBLElBQUlBLElBQUlBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBO29CQUNsQ0EsS0FBS0EsQ0FBQ0E7Z0JBRVBBLEtBQUtBLFFBQVFBO29CQUNaQSwyREFBMkRBO29CQUMzREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FB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Q0E7WUFDYkEsTUFBTUEsQ0FBQ0EsaUJBQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxpQkFBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLENBQ0FBO1FBQUFBLEtBQUtBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ2RBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFwQmUsMkJBQW1CLHNCQW9CbEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmF0ZWd5IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuXG4vKlxuQmFzZWQgb24gc2l6ZW9mLmpzIGJ5IFN0ZXBoZW4gTW9ybGV5XG5cbkEgZnVuY3Rpb24gdG8gY2FsY3VsYXRlIHRoZSBhcHByb3hpbWF0ZSBtZW1vcnkgdXNhZ2Ugb2Ygb2JqZWN0c1xuXG5DcmVhdGVkIGJ5IFN0ZXBoZW4gTW9ybGV5IC0gaHR0cDovL2NvZGUuc3RlcGhlbm1vcmxleS5vcmcvIC0gYW5kIHJlbGVhc2VkIHVuZGVyXG50aGUgdGVybXMgb2YgdGhlIENDMCAxLjAgVW5pdmVyc2FsIGxlZ2FsIGNvZGU6XG5cbmh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL3B1YmxpY2RvbWFpbi96ZXJvLzEuMC9sZWdhbGNvZGVcblxuUmV0dXJucyB0aGUgYXBwcm94aW1hdGUgbWVtb3J5IHVzYWdlLCBpbiBieXRlcywgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcHJveGltYXRlQnl0ZVNpemUob2JqZWN0OiBhbnkpOiBudW1iZXIge1xuXHRsZXQgb2JqZWN0cyA9IFsgb2JqZWN0IF07XG5cdGxldCBzaXplID0gMDtcblxuXHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb2JqZWN0cy5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRzd2l0Y2ggKHR5cGVvZiBvYmplY3RzW2luZGV4XSkge1xuXHRcdFx0Y2FzZSAnYm9vbGVhbic6XG5cdFx0XHRcdHNpemUgKz0gNDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdHNpemUgKz0gODtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdHNpemUgKz0gMiAqIG9iamVjdHNbaW5kZXhdLmxlbmd0aDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdC8vIGlmIHRoZSBvYmplY3QgaXMgbm90IGFuIGFycmF5LCBhZGQgdGhlIHNpemVzIG9mIHRoZSBrZXlzXG5cdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0c1tpbmRleF0pICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQga2V5IGluIG9iamVjdHNbaW5kZXhdKSB7XG5cdFx0XHRcdFx0XHRzaXplICs9IDIgKiBrZXkubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGxvb3Agb3ZlciB0aGUga2V5c1xuXHRcdFx0XHRmb3IgKGxldCBrZXkgaW4gb2JqZWN0c1tpbmRleF0pIHtcblx0XHRcdFx0XHQvLyBkZXRlcm1pbmUgd2hldGhlciB0aGUgdmFsdWUgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWRcblx0XHRcdFx0XHRsZXQgcHJvY2Vzc2VkID0gZmFsc2U7XG5cblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IG9iamVjdHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdGlmIChvYmplY3RzW2pdID09PSBvYmplY3RzW2luZGV4XVtrZXldKSB7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHF1ZXVlIHRoZSB2YWx1ZSB0byBiZSBwcm9jZXNzZWQgaWYgYXBwcm9wcmlhdGVcblx0XHRcdFx0XHRpZiAoIXByb2Nlc3NlZCkge1xuXHRcdFx0XHRcdFx0b2JqZWN0cy5wdXNoKG9iamVjdHNbaW5kZXhdW2tleV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzaXplO1xufVxuXG4vKipcbiAqIENhbGxzIHRoZSBtZXRob2Qgb3IgcmV0dXJucyB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2VPck5vb3AoTzogYW55LCBQOiBzdHJpbmcsIGFyZ3M6IGFueVtdID0gW10pOiBhbnkge1xuXHRjb25zdCBtZXRob2Q6IEZ1bmN0aW9uID0gT1tQXTtcblx0cmV0dXJuIG1ldGhvZCA/IG1ldGhvZC5hcHBseShPLCBhcmdzKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmF0ZWd5PFQ+KHsgc2l6ZSwgaGlnaFdhdGVyTWFyayA9IDEgfTogU3RyYXRlZ3k8VD4pOiBTdHJhdGVneTxUPiB7XG5cdHJldHVybiA8U3RyYXRlZ3kgPFQ+PiB7XG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRoaWdoV2F0ZXJNYXJrOiBoaWdoV2F0ZXJNYXJrID4gMCA/IGhpZ2hXYXRlck1hcmsgOiAxXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNlSW52b2tlT3JGYWxsYmFja09yTm9vcChvYmplY3Q6IGFueSwgbWV0aG9kMTogc3RyaW5nLCBhcmdzMTogYW55W10sIG1ldGhvZDI6IHN0cmluZywgYXJnczI6IGFueVtdID0gW10pOiBQcm9taXNlPGFueT4ge1xuXHRsZXQgbWV0aG9kOiBGdW5jdGlvbjtcblxuXHR0cnkge1xuXHRcdG1ldGhvZCA9IG9iamVjdFttZXRob2QxXTtcblx0fVxuXHRjYXRjaCAoZXJyb3IgKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0fVxuXG5cdGlmICghbWV0aG9kKSB7XG5cdFx0cmV0dXJuIHByb21pc2VJbnZva2VPck5vb3Aob2JqZWN0LCBtZXRob2QyLCBhcmdzMik7XG5cdH1cblxuXHRpZiAoIWFyZ3MxKSB7XG5cdFx0YXJnczEgPSBbXTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShtZXRob2QuYXBwbHkob2JqZWN0LCBhcmdzMSkpO1xuXHR9XG5cdGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRoZSB3aXRoIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwgb3IgdW5kZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzZUludm9rZU9yTm9vcChPOiBhbnksIFA6IHN0cmluZywgYXJnczogYW55W10gPSBbXSk6IFByb21pc2U8YW55PiB7XG5cdGxldCBtZXRob2Q6IGFueTtcblxuXHR0cnkge1xuXHRcdG1ldGhvZCA9IE9bUF07XG5cdH1cblx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0fVxuXG5cdGlmICghbWV0aG9kKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1ldGhvZC5hcHBseShPLCBhcmdzKSk7XG5cdH1cblx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0fVxufVxuIl19