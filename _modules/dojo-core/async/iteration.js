(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', '../array'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var array = require('../array');
    /**
     * Processes all items and then applies the callback to each item and eventually returns an object containing the
     * processed values and callback results
     * @param items a list of synchronous/asynchronous values to process
     * @param callback a callback that maps values to synchronous/asynchronous results
     * @return a list of objects holding the synchronous values and synchronous results.
     */
    function processValuesAndCallback(items, callback) {
        return Promise_1.default.all(items)
            .then(function (results) {
            var pass = Array.prototype.map.call(results, callback);
            return Promise_1.default.all(pass)
                .then(function (pass) {
                return { values: results, results: pass };
            });
        });
    }
    /**
     * Finds the index of the next value in a sparse array-like object
     * @param list the sparse array-like object
     * @param offset the starting offset
     * @return {number} the offset of the next index with a value; or -1 if not found
     */
    function findNextValueIndex(list, offset) {
        if (offset === void 0) { offset = -1; }
        offset++;
        for (var length_1 = list.length; offset < length_1; offset++) {
            if (offset in list) {
                return offset;
            }
        }
        return -1;
    }
    function findLastValueIndex(list, offset) {
        offset = (offset === undefined ? list.length : offset) - 1;
        for (; offset >= 0; offset--) {
            if (offset in list) {
                return offset;
            }
        }
        return -1;
    }
    function generalReduce(findNextIndex, items, callback, initialValue) {
        var hasInitialValue = arguments.length > 3;
        return Promise_1.default.all(items)
            .then(function (results) {
            return new Promise_1.default(function (resolve, reject) {
                var i;
                function next(currentValue) {
                    i = findNextIndex(items, i);
                    if (i >= 0) {
                        var result = callback(currentValue, results[i], i, results);
                        if (result.then) {
                            result.then(next, reject);
                        }
                        else {
                            next(result);
                        }
                    }
                    else {
                        resolve(currentValue);
                    }
                }
                ;
                var value;
                if (hasInitialValue) {
                    value = initialValue;
                }
                else {
                    i = findNextIndex(items);
                    if (i < 0) {
                        throw new Error('reduce array with no initial value');
                    }
                    value = results[i];
                }
                next(value);
            });
        });
    }
    function testAndHaltOnCondition(condition, items, callback) {
        return Promise_1.default.all(items).then(function (results) {
            return new Promise_1.default(function (resolve) {
                var result;
                var pendingCount = 0;
                for (var i = 0; i < results.length; i++) {
                    result = callback(results[i], i, results);
                    if (result === condition) {
                        return resolve(result);
                    }
                    else if (result.then) {
                        pendingCount++;
                        result.then(function (result) {
                            if (result === condition) {
                                resolve(result);
                            }
                            pendingCount--;
                            if (pendingCount === 0) {
                                resolve(!condition);
                            }
                        });
                    }
                }
                if (pendingCount === 0) {
                    resolve(!condition);
                }
            });
        });
    }
    /**
     * Test whether all elements in the array pass the provided callback
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous test
     * @return eventually returns true if all values pass; otherwise false
     */
    function every(items, callback) {
        return testAndHaltOnCondition(false, items, callback);
    }
    exports.every = every;
    /**
     * Returns an array of elements which pass the provided callback
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous test
     * @return eventually returns a new array with only values that have passed
     */
    function filter(items, callback) {
        return processValuesAndCallback(items, callback).then(function (_a) {
            var results = _a.results, values = _a.values;
            var arr = [];
            for (var i = 0; i < results.length; i++) {
                results[i] && arr.push(values[i]);
            }
            return arr;
        });
    }
    exports.filter = filter;
    /**
     * Find the first value matching a filter function
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous test
     * @return a promise eventually containing the item or undefined if a match is not found
     */
    function find(items, callback) {
        return findIndex(items, callback).then(function (i) {
            return i >= 0 ? items[i] : undefined;
        });
    }
    exports.find = find;
    /**
     * Find the first index with a value matching the filter function
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous test
     * @return a promise eventually containing the index of the matching item or -1 if a match is not found
     */
    function findIndex(items, callback) {
        // TODO we can improve this by returning immediately
        return processValuesAndCallback(items, callback).then(function (_a) {
            var results = _a.results;
            for (var i = 0; i < results.length; i++) {
                if (results[i]) {
                    return i;
                }
            }
            return -1;
        });
    }
    exports.findIndex = findIndex;
    /**
     * transform a list of items using a mapper function
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous transform function
     * @return a promise eventually containing a collection of each transformed value
     */
    function map(items, callback) {
        return processValuesAndCallback(items, callback)
            .then(function (_a) {
            var results = _a.results;
            return results;
        });
    }
    exports.map = map;
    /**
     * reduce a list of items down to a single value
     * @param items a collection of synchronous/asynchronous values
     * @param callback a synchronous/asynchronous reducer function
     * @param [initialValue] the first value to pass to the callback
     * @return a promise eventually containing a value that is the result of the reduction
     */
    function reduce(items, callback, initialValue) {
        var args = array.from(arguments);
        args.unshift(findNextValueIndex);
        return generalReduce.apply(this, args);
    }
    exports.reduce = reduce;
    function reduceRight(items, callback, initialValue) {
        var args = array.from(arguments);
        args.unshift(findLastValueIndex);
        return generalReduce.apply(this, args);
    }
    exports.reduceRight = reduceRight;
    function series(items, operation) {
        return generalReduce(findNextValueIndex, items, function (previousValue, currentValue, index, array) {
            var result = operation(currentValue, index, array);
            if (result.then) {
                return result.then(function (value) {
                    previousValue.push(value);
                    return previousValue;
                });
            }
            previousValue.push(result);
            return previousValue;
        }, []);
    }
    exports.series = series;
    function some(items, callback) {
        return testAndHaltOnCondition(true, items, callback);
    }
    exports.some = some;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FzeW5jL2l0ZXJhdGlvbi50cyJdLCJuYW1lcyI6WyJwcm9jZXNzVmFsdWVzQW5kQ2FsbGJhY2siLCJmaW5kTmV4dFZhbHVlSW5kZXgiLCJmaW5kTGFzdFZhbHVlSW5kZXgiLCJnZW5lcmFsUmVkdWNlIiwibmV4dCIsInRlc3RBbmRIYWx0T25Db25kaXRpb24iLCJldmVyeSIsImZpbHRlciIsImZpbmQiLCJmaW5kSW5kZXgiLCJtYXAiLCJyZWR1Y2UiLCJyZWR1Y2VSaWdodCIsInNlcmllcyIsInNvbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsd0JBQWtDLFlBQVksQ0FBQyxDQUFBO0lBQy9DLElBQVksS0FBSyxXQUFNLFVBQVUsQ0FBQyxDQUFBO0lBR2xDOzs7Ozs7T0FNRztJQUNILGtDQUF3QyxLQUF5QixFQUFFLFFBQXNCO1FBQ3hGQSxNQUFNQSxDQUFDQSxpQkFBT0EsQ0FBQ0EsR0FBR0EsQ0FBSUEsS0FBS0EsQ0FBQ0E7YUFDMUJBLElBQUlBLENBQUNBLFVBQVVBLE9BQU9BO1lBQ3RCLElBQUksSUFBSSxHQUF1QixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLEdBQUcsQ0FBSSxJQUFJLENBQUM7aUJBQ3pCLElBQUksQ0FBZ0MsVUFBVSxJQUFJO2dCQUNsRCxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFRDs7Ozs7T0FLRztJQUNILDRCQUErQixJQUFrQixFQUFFLE1BQW1CO1FBQW5CQyxzQkFBbUJBLEdBQW5CQSxVQUFrQkEsQ0FBQ0E7UUFDckVBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ1RBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLFFBQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLEdBQUdBLFFBQU1BLEVBQUVBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBO1lBQzFEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQ2ZBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ1hBLENBQUNBO0lBRUQsNEJBQStCLElBQWtCLEVBQUUsTUFBZTtRQUNqRUMsTUFBTUEsR0FBR0EsQ0FBQ0EsTUFBTUEsS0FBS0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLE1BQU1BLElBQUlBLENBQUNBLEVBQUVBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBO1lBQzlCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQ2ZBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ1hBLENBQUNBO0lBRUQsdUJBQTZCLGFBQWdFLEVBQUUsS0FBeUIsRUFBRSxRQUF1QixFQUFFLFlBQWdCO1FBQ2xLQyxJQUFNQSxlQUFlQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3Q0EsTUFBTUEsQ0FBQ0EsaUJBQU9BLENBQUNBLEdBQUdBLENBQUlBLEtBQUtBLENBQUNBO2FBQzFCQSxJQUFJQSxDQUFDQSxVQUFVQSxPQUFPQTtZQUN0QixNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07Z0JBQzNDLElBQUksQ0FBUyxDQUFDO2dCQUNkLGNBQWMsWUFBZTtvQkFDNUJDLENBQUNBLEdBQUdBLGFBQWFBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO29CQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ1pBLElBQU1BLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLFlBQVlBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO3dCQUU5REEsRUFBRUEsQ0FBQ0EsQ0FBaUJBLE1BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNuQkEsTUFBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7d0JBQzNDQSxDQUFDQTt3QkFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ0xBLElBQUlBLENBQUtBLE1BQU1BLENBQUNBLENBQUNBO3dCQUNsQkEsQ0FBQ0E7b0JBQ0ZBLENBQUNBO29CQUNEQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDTEEsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3ZCQSxDQUFDQTtnQkFDRkEsQ0FBQ0E7Z0JBQUEsQ0FBQztnQkFFRixJQUFJLEtBQVEsQ0FBQztnQkFDYixFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUNyQixLQUFLLEdBQUcsWUFBWSxDQUFDO2dCQUN0QixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLENBQUMsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRXpCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztvQkFDdkQsQ0FBQztvQkFDRCxLQUFLLEdBQVMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixDQUFDO2dCQUNELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDRCxDQUFDQTtJQUNMQSxDQUFDQTtJQUVELGdDQUFtQyxTQUFrQixFQUFFLEtBQXlCLEVBQUUsUUFBcUI7UUFDdEdFLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxHQUFHQSxDQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxPQUFPQTtZQUNsRCxNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFVLFVBQVMsT0FBTztnQkFDM0MsSUFBSSxNQUFxQyxDQUFDO2dCQUMxQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3pDLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDMUMsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3hCLENBQUM7b0JBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFzQixNQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDNUMsWUFBWSxFQUFFLENBQUM7d0JBQ00sTUFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLE1BQU07NEJBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUMxQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2pCLENBQUM7NEJBQ0QsWUFBWSxFQUFFLENBQUM7NEJBQ2YsRUFBRSxDQUFDLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hCLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNyQixDQUFDO3dCQUNGLENBQUMsQ0FBQyxDQUFDO29CQUNKLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFRDs7Ozs7T0FLRztJQUNILGVBQXlCLEtBQXlCLEVBQUUsUUFBcUI7UUFDeEVDLE1BQU1BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRmUsYUFBSyxRQUVwQixDQUFBO0lBRUQ7Ozs7O09BS0c7SUFDSCxnQkFBMEIsS0FBeUIsRUFBRSxRQUFxQjtRQUN6RUMsTUFBTUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFNQSxVQUFVQSxFQUFtQkE7Z0JBQWpCLE9BQU8sZUFBRSxNQUFNO1lBQ3JGLElBQUksR0FBRyxHQUFRLEVBQUUsQ0FBQztZQUNsQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN6QyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNaLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFSZSxjQUFNLFNBUXJCLENBQUE7SUFFRDs7Ozs7T0FLRztJQUNILGNBQXdCLEtBQXlCLEVBQUUsUUFBcUI7UUFDdkVDLE1BQU1BLENBQUNBLFNBQVNBLENBQUlBLEtBQUtBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBO1lBQ3BELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDdEMsQ0FBQyxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUplLFlBQUksT0FJbkIsQ0FBQTtJQUVEOzs7OztPQUtHO0lBQ0gsbUJBQTZCLEtBQXlCLEVBQUUsUUFBcUI7UUFDNUVDLG9EQUFvREE7UUFDcERBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBU0EsVUFBVUEsRUFBV0E7Z0JBQVQsT0FBTztZQUNoRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNWLENBQUM7WUFDRixDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQVZlLGlCQUFTLFlBVXhCLENBQUE7SUFFRDs7Ozs7T0FLRztJQUNILGFBQTBCLEtBQXlCLEVBQUUsUUFBc0I7UUFDMUVDLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBT0EsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0E7YUFDbkRBLElBQUlBLENBQU1BLFVBQVVBLEVBQVdBO2dCQUFULE9BQU87WUFDN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNoQixDQUFDLENBQUNBLENBQUNBO0lBQ05BLENBQUNBO0lBTGUsV0FBRyxNQUtsQixDQUFBO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsZ0JBQTZCLEtBQXlCLEVBQUUsUUFBdUIsRUFBRSxZQUFnQjtRQUNoR0MsSUFBSUEsSUFBSUEsR0FBa0JBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ2hEQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBQ2pDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFKZSxjQUFNLFNBSXJCLENBQUE7SUFFRCxxQkFBa0MsS0FBeUIsRUFBRSxRQUF1QixFQUFFLFlBQWdCO1FBQ3JHQyxJQUFJQSxJQUFJQSxHQUFrQkEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDaERBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQUplLG1CQUFXLGNBSTFCLENBQUE7SUFFRCxnQkFBNkIsS0FBeUIsRUFBRSxTQUF1QjtRQUM5RUMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxLQUFLQSxFQUFFQSxVQUFVQSxhQUFhQSxFQUFFQSxZQUFZQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQTtZQUNsRyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVyRCxFQUFFLENBQUMsQ0FBZ0IsTUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBZ0IsTUFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUs7b0JBQ2pELGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFCLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUN0QixDQUFDLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO0lBQ1JBLENBQUNBO0lBZGUsY0FBTSxTQWNyQixDQUFBO0lBRUQsY0FBd0IsS0FBNEIsRUFBRSxRQUFxQjtRQUMxRUMsTUFBTUEsQ0FBQ0Esc0JBQXNCQSxDQUFJQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUN6REEsQ0FBQ0E7SUFGZSxZQUFJLE9BRW5CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSwgeyBUaGVuYWJsZSB9IGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0ICogYXMgYXJyYXkgZnJvbSAnLi4vYXJyYXknO1xuaW1wb3J0IHsgQXJyYXlMaWtlIH0gZnJvbSAnLi4vYXJyYXknO1xuXG4vKipcbiAqIFByb2Nlc3NlcyBhbGwgaXRlbXMgYW5kIHRoZW4gYXBwbGllcyB0aGUgY2FsbGJhY2sgdG8gZWFjaCBpdGVtIGFuZCBldmVudHVhbGx5IHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlXG4gKiBwcm9jZXNzZWQgdmFsdWVzIGFuZCBjYWxsYmFjayByZXN1bHRzXG4gKiBAcGFyYW0gaXRlbXMgYSBsaXN0IG9mIHN5bmNocm9ub3VzL2FzeW5jaHJvbm91cyB2YWx1ZXMgdG8gcHJvY2Vzc1xuICogQHBhcmFtIGNhbGxiYWNrIGEgY2FsbGJhY2sgdGhhdCBtYXBzIHZhbHVlcyB0byBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgcmVzdWx0c1xuICogQHJldHVybiBhIGxpc3Qgb2Ygb2JqZWN0cyBob2xkaW5nIHRoZSBzeW5jaHJvbm91cyB2YWx1ZXMgYW5kIHN5bmNocm9ub3VzIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NWYWx1ZXNBbmRDYWxsYmFjazxULCBVPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBjYWxsYmFjazogTWFwcGVyPFQsIFU+KTogUHJvbWlzZTx7IHZhbHVlczogVFtdOyByZXN1bHRzOiBVW10gfT4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGw8VD4oaXRlbXMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcblx0XHRcdGxldCBwYXNzOiAoVSB8IFByb21pc2U8VT4pW10gPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwocmVzdWx0cywgY2FsbGJhY2spO1xuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsPFU+KHBhc3MpXG5cdFx0XHRcdC50aGVuPHsgdmFsdWVzOiBUW107IHJlc3VsdHM6IFVbXSB9PihmdW5jdGlvbiAocGFzcykge1xuXHRcdFx0XHRcdHJldHVybiB7IHZhbHVlczogcmVzdWx0cywgcmVzdWx0czogcGFzcyB9O1xuXHRcdFx0XHR9KTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgdmFsdWUgaW4gYSBzcGFyc2UgYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBsaXN0IHRoZSBzcGFyc2UgYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBvZmZzZXQgdGhlIHN0YXJ0aW5nIG9mZnNldFxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgb2Zmc2V0IG9mIHRoZSBuZXh0IGluZGV4IHdpdGggYSB2YWx1ZTsgb3IgLTEgaWYgbm90IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGZpbmROZXh0VmFsdWVJbmRleDxUPihsaXN0OiBBcnJheUxpa2U8VD4sIG9mZnNldDogbnVtYmVyID0gLTEpOiBudW1iZXIge1xuXHRvZmZzZXQrKztcblx0Zm9yIChsZXQgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IG9mZnNldCA8IGxlbmd0aDsgb2Zmc2V0KyspIHtcblx0XHRpZiAob2Zmc2V0IGluIGxpc3QpIHtcblx0XHRcdHJldHVybiBvZmZzZXQ7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZmluZExhc3RWYWx1ZUluZGV4PFQ+KGxpc3Q6IEFycmF5TGlrZTxUPiwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyIHtcblx0b2Zmc2V0ID0gKG9mZnNldCA9PT0gdW5kZWZpbmVkID8gbGlzdC5sZW5ndGggOiBvZmZzZXQpIC0gMTtcblx0Zm9yICg7IG9mZnNldCA+PSAwOyBvZmZzZXQtLSkge1xuXHRcdGlmIChvZmZzZXQgaW4gbGlzdCkge1xuXHRcdFx0cmV0dXJuIG9mZnNldDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBnZW5lcmFsUmVkdWNlPFQsIFU+KGZpbmROZXh0SW5kZXg6IChsaXN0OiBBcnJheUxpa2U8YW55Piwgb2Zmc2V0PzogbnVtYmVyKSA9PiBudW1iZXIsIGl0ZW1zOiAoVCB8IFByb21pc2U8VD4pW10sIGNhbGxiYWNrOiBSZWR1Y2VyPFQsIFU+LCBpbml0aWFsVmFsdWU/OiBVKTogUHJvbWlzZTxVPiB7XG5cdGNvbnN0IGhhc0luaXRpYWxWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzO1xuXHRyZXR1cm4gUHJvbWlzZS5hbGw8VD4oaXRlbXMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdGxldCBpOiBudW1iZXI7XG5cdFx0XHRcdGZ1bmN0aW9uIG5leHQoY3VycmVudFZhbHVlOiBVKTogdm9pZCB7XG5cdFx0XHRcdFx0aSA9IGZpbmROZXh0SW5kZXgoaXRlbXMsIGkpO1xuXHRcdFx0XHRcdGlmIChpID49IDApIHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGNhbGxiYWNrKGN1cnJlbnRWYWx1ZSwgcmVzdWx0c1tpXSwgaSwgcmVzdWx0cyk7XG5cblx0XHRcdFx0XHRcdGlmICggKDxUaGVuYWJsZTxVPj4gcmVzdWx0KS50aGVuKSB7XG5cdFx0XHRcdFx0XHRcdCg8VGhlbmFibGU8VT4+IHJlc3VsdCkudGhlbihuZXh0LCByZWplY3QpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG5leHQoPFU+IHJlc3VsdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShjdXJyZW50VmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgdmFsdWU6IFU7XG5cdFx0XHRcdGlmIChoYXNJbml0aWFsVmFsdWUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpID0gZmluZE5leHRJbmRleChpdGVtcyk7XG5cblx0XHRcdFx0XHRpZiAoaSA8IDApIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigncmVkdWNlIGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YWx1ZSA9IDxhbnk+IHJlc3VsdHNbaV07XG5cdFx0XHRcdH1cblx0XHRcdFx0bmV4dCh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcbn1cblxuZnVuY3Rpb24gdGVzdEFuZEhhbHRPbkNvbmRpdGlvbjxUPihjb25kaXRpb246IGJvb2xlYW4sIGl0ZW1zOiAoVCB8IFByb21pc2U8VD4pW10sIGNhbGxiYWNrOiBGaWx0ZXJlcjxUPik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGw8VD4oaXRlbXMpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oZnVuY3Rpb24ocmVzb2x2ZSkge1xuXHRcdFx0bGV0IHJlc3VsdDogKGJvb2xlYW4gfCBUaGVuYWJsZTxib29sZWFuPik7XG5cdFx0XHRsZXQgcGVuZGluZ0NvdW50ID0gMDtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRyZXN1bHQgPSBjYWxsYmFjayhyZXN1bHRzW2ldLCBpLCByZXN1bHRzKTtcblx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gY29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICgoPFRoZW5hYmxlPGJvb2xlYW4+PiByZXN1bHQpLnRoZW4pIHtcblx0XHRcdFx0XHRwZW5kaW5nQ291bnQrKztcblx0XHRcdFx0XHQoPFRoZW5hYmxlPGJvb2xlYW4+PiByZXN1bHQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gY29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBlbmRpbmdDb3VudC0tO1xuXHRcdFx0XHRcdFx0aWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCFjb25kaXRpb24pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG5cdFx0XHRcdHJlc29sdmUoIWNvbmRpdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBhbGwgZWxlbWVudHMgaW4gdGhlIGFycmF5IHBhc3MgdGhlIHByb3ZpZGVkIGNhbGxiYWNrXG4gKiBAcGFyYW0gaXRlbXMgYSBjb2xsZWN0aW9uIG9mIHN5bmNocm9ub3VzL2FzeW5jaHJvbm91cyB2YWx1ZXNcbiAqIEBwYXJhbSBjYWxsYmFjayBhIHN5bmNocm9ub3VzL2FzeW5jaHJvbm91cyB0ZXN0XG4gKiBAcmV0dXJuIGV2ZW50dWFsbHkgcmV0dXJucyB0cnVlIGlmIGFsbCB2YWx1ZXMgcGFzczsgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBldmVyeTxUPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBjYWxsYmFjazogRmlsdGVyZXI8VD4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0cmV0dXJuIHRlc3RBbmRIYWx0T25Db25kaXRpb24oZmFsc2UsIGl0ZW1zLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBlbGVtZW50cyB3aGljaCBwYXNzIHRoZSBwcm92aWRlZCBjYWxsYmFja1xuICogQHBhcmFtIGl0ZW1zIGEgY29sbGVjdGlvbiBvZiBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdmFsdWVzXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdGVzdFxuICogQHJldHVybiBldmVudHVhbGx5IHJldHVybnMgYSBuZXcgYXJyYXkgd2l0aCBvbmx5IHZhbHVlcyB0aGF0IGhhdmUgcGFzc2VkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXI8VD4oaXRlbXM6IChUIHwgUHJvbWlzZTxUPilbXSwgY2FsbGJhY2s6IEZpbHRlcmVyPFQ+KTogUHJvbWlzZTxUW10+IHtcblx0cmV0dXJuIHByb2Nlc3NWYWx1ZXNBbmRDYWxsYmFjayhpdGVtcywgY2FsbGJhY2spLnRoZW48VFtdPihmdW5jdGlvbiAoeyByZXN1bHRzLCB2YWx1ZXMgfSkge1xuXHRcdGxldCBhcnI6IFRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzdWx0c1tpXSAmJiBhcnIucHVzaCh2YWx1ZXNbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJyO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSBmaXJzdCB2YWx1ZSBtYXRjaGluZyBhIGZpbHRlciBmdW5jdGlvblxuICogQHBhcmFtIGl0ZW1zIGEgY29sbGVjdGlvbiBvZiBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdmFsdWVzXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdGVzdFxuICogQHJldHVybiBhIHByb21pc2UgZXZlbnR1YWxseSBjb250YWluaW5nIHRoZSBpdGVtIG9yIHVuZGVmaW5lZCBpZiBhIG1hdGNoIGlzIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZDxUPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBjYWxsYmFjazogRmlsdGVyZXI8VD4pOiBQcm9taXNlPFQ+IHtcblx0cmV0dXJuIGZpbmRJbmRleDxUPihpdGVtcywgY2FsbGJhY2spLnRoZW4oZnVuY3Rpb24gKGkpIHtcblx0XHRyZXR1cm4gaSA+PSAwID8gaXRlbXNbaV0gOiB1bmRlZmluZWQ7XG5cdH0pO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlIGZpcnN0IGluZGV4IHdpdGggYSB2YWx1ZSBtYXRjaGluZyB0aGUgZmlsdGVyIGZ1bmN0aW9uXG4gKiBAcGFyYW0gaXRlbXMgYSBjb2xsZWN0aW9uIG9mIHN5bmNocm9ub3VzL2FzeW5jaHJvbm91cyB2YWx1ZXNcbiAqIEBwYXJhbSBjYWxsYmFjayBhIHN5bmNocm9ub3VzL2FzeW5jaHJvbm91cyB0ZXN0XG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBldmVudHVhbGx5IGNvbnRhaW5pbmcgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGluZyBpdGVtIG9yIC0xIGlmIGEgbWF0Y2ggaXMgbm90IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW5kZXg8VD4oaXRlbXM6IChUIHwgUHJvbWlzZTxUPilbXSwgY2FsbGJhY2s6IEZpbHRlcmVyPFQ+KTogUHJvbWlzZTxudW1iZXI+IHtcblx0Ly8gVE9ETyB3ZSBjYW4gaW1wcm92ZSB0aGlzIGJ5IHJldHVybmluZyBpbW1lZGlhdGVseVxuXHRyZXR1cm4gcHJvY2Vzc1ZhbHVlc0FuZENhbGxiYWNrKGl0ZW1zLCBjYWxsYmFjaykudGhlbjxudW1iZXI+KGZ1bmN0aW9uICh7IHJlc3VsdHMgfSkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHJlc3VsdHNbaV0pIHtcblx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fSk7XG59XG5cbi8qKlxuICogdHJhbnNmb3JtIGEgbGlzdCBvZiBpdGVtcyB1c2luZyBhIG1hcHBlciBmdW5jdGlvblxuICogQHBhcmFtIGl0ZW1zIGEgY29sbGVjdGlvbiBvZiBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdmFsdWVzXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdHJhbnNmb3JtIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBldmVudHVhbGx5IGNvbnRhaW5pbmcgYSBjb2xsZWN0aW9uIG9mIGVhY2ggdHJhbnNmb3JtZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcDxULCBVPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBjYWxsYmFjazogTWFwcGVyPFQsIFU+KTogUHJvbWlzZTxVW10+IHtcblx0cmV0dXJuIHByb2Nlc3NWYWx1ZXNBbmRDYWxsYmFjazxULCBVPihpdGVtcywgY2FsbGJhY2spXG5cdFx0XHQudGhlbjxVW10+KGZ1bmN0aW9uICh7IHJlc3VsdHMgfSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcblx0XHRcdH0pO1xufVxuXG4vKipcbiAqIHJlZHVjZSBhIGxpc3Qgb2YgaXRlbXMgZG93biB0byBhIHNpbmdsZSB2YWx1ZVxuICogQHBhcmFtIGl0ZW1zIGEgY29sbGVjdGlvbiBvZiBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgdmFsdWVzXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBzeW5jaHJvbm91cy9hc3luY2hyb25vdXMgcmVkdWNlciBmdW5jdGlvblxuICogQHBhcmFtIFtpbml0aWFsVmFsdWVdIHRoZSBmaXJzdCB2YWx1ZSB0byBwYXNzIHRvIHRoZSBjYWxsYmFja1xuICogQHJldHVybiBhIHByb21pc2UgZXZlbnR1YWxseSBjb250YWluaW5nIGEgdmFsdWUgdGhhdCBpcyB0aGUgcmVzdWx0IG9mIHRoZSByZWR1Y3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZTxULCBVPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBjYWxsYmFjazogUmVkdWNlcjxULCBVPiwgaW5pdGlhbFZhbHVlPzogVSk6IFByb21pc2U8VT4ge1xuXHRsZXQgYXJnczogYW55W10gPSA8YW55W10+IGFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0YXJncy51bnNoaWZ0KGZpbmROZXh0VmFsdWVJbmRleCk7XG5cdHJldHVybiBnZW5lcmFsUmVkdWNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlUmlnaHQ8VCwgVT4oaXRlbXM6IChUIHwgUHJvbWlzZTxUPilbXSwgY2FsbGJhY2s6IFJlZHVjZXI8VCwgVT4sIGluaXRpYWxWYWx1ZT86IFUpOiBQcm9taXNlPFU+IHtcblx0bGV0IGFyZ3M6IGFueVtdID0gPGFueVtdPiBhcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdGFyZ3MudW5zaGlmdChmaW5kTGFzdFZhbHVlSW5kZXgpO1xuXHRyZXR1cm4gZ2VuZXJhbFJlZHVjZS5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmllczxULCBVPihpdGVtczogKFQgfCBQcm9taXNlPFQ+KVtdLCBvcGVyYXRpb246IE1hcHBlcjxULCBVPik6IFByb21pc2U8VVtdPiB7XG5cdHJldHVybiBnZW5lcmFsUmVkdWNlKGZpbmROZXh0VmFsdWVJbmRleCwgaXRlbXMsIGZ1bmN0aW9uIChwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUsIGluZGV4LCBhcnJheSkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IG9wZXJhdGlvbihjdXJyZW50VmFsdWUsIGluZGV4LCBhcnJheSk7XG5cblx0XHRpZiAoKDxUaGVuYWJsZTxVPj4gcmVzdWx0KS50aGVuKSB7XG5cdFx0XHRyZXR1cm4gKDxUaGVuYWJsZTxVPj4gcmVzdWx0KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRwcmV2aW91c1ZhbHVlLnB1c2godmFsdWUpO1xuXHRcdFx0XHRyZXR1cm4gcHJldmlvdXNWYWx1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHByZXZpb3VzVmFsdWUucHVzaChyZXN1bHQpO1xuXHRcdHJldHVybiBwcmV2aW91c1ZhbHVlO1xuXHR9LCBbXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lPFQ+KGl0ZW1zOiBBcnJheTxUIHwgUHJvbWlzZTxUPj4sIGNhbGxiYWNrOiBGaWx0ZXJlcjxUPik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRyZXR1cm4gdGVzdEFuZEhhbHRPbkNvbmRpdGlvbjxUPih0cnVlLCBpdGVtcywgY2FsbGJhY2spO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlcmVyPFQ+IGV4dGVuZHMgTWFwcGVyPFQsIGJvb2xlYW4+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFwcGVyPFQsIFU+IHtcblx0KHZhbHVlOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKTogKFUgfCBUaGVuYWJsZTxVPik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkdWNlcjxULCBVPiB7XG5cdChwcmV2aW91c1ZhbHVlOiBVLCBjdXJyZW50VmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pOiAoVSB8IFRoZW5hYmxlPFU+KTtcbn1cbiJdfQ==