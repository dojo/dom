(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    /**
     * A registry of values tagged with matchers.
     */
    var Registry = (function () {
        /**
         * Construct a new Registry, optionally containing a given default value.
         */
        function Registry(defaultValue) {
            this._defaultValue = defaultValue;
            this._entries = [];
        }
        /**
         * Return the first entry in this registry that matches the given arguments. If no entry matches and the registry
         * was created with a default value, that value will be returned. Otherwise, an exception is thrown.
         *
         * @param ...args Arguments that will be used to select a matching value.
         * @returns the matching value, or a default value if one exists.
         */
        Registry.prototype.match = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var entries = this._entries.slice(0);
            var entry;
            for (var i = 0; (entry = entries[i]); ++i) {
                if (entry.test.apply(null, args)) {
                    return entry.value;
                }
            }
            if (this._defaultValue !== undefined) {
                return this._defaultValue;
            }
            throw new Error('No match found');
        };
        /**
         * Register a test + value pair with this registry.
         *
         * @param test The test that will be used to determine if the registered value matches a set of arguments.
         * @param value A value being registered.
         * @param first If true, the newly registered test and value will be the first entry in the registry.
         */
        Registry.prototype.register = function (test, value, first) {
            var entries = this._entries;
            var entry = {
                test: test,
                value: value
            };
            entries[(first ? 'unshift' : 'push')](entry);
            return {
                destroy: function () {
                    this.destroy = function () { };
                    var i = 0;
                    while ((i = entries.indexOf(entry, i)) > -1) {
                        entries.splice(i, 1);
                    }
                    test = value = entries = entry = null;
                }
            };
        };
        return Registry;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Registry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUmVnaXN0cnkudHMiXSwibmFtZXMiOlsiUmVnaXN0cnkiLCJSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlJlZ2lzdHJ5Lm1hdGNoIiwiUmVnaXN0cnkucmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBV0E7O09BRUc7SUFDSDtRQUlDQTs7V0FFR0E7UUFDSEEsa0JBQVlBLFlBQWdCQTtZQUMzQkMsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsWUFBWUEsQ0FBQ0E7WUFDbENBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVERDs7Ozs7O1dBTUdBO1FBQ0hBLHdCQUFLQSxHQUFMQTtZQUFNRSxjQUFjQTtpQkFBZEEsV0FBY0EsQ0FBZEEsc0JBQWNBLENBQWRBLElBQWNBO2dCQUFkQSw2QkFBY0E7O1lBQ25CQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsSUFBSUEsS0FBZUEsQ0FBQ0E7WUFFcEJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO2dCQUMzQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2xDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFDcEJBLENBQUNBO1lBQ0ZBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDM0JBLENBQUNBO1lBRURBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLENBQUNBO1FBRURGOzs7Ozs7V0FNR0E7UUFDSEEsMkJBQVFBLEdBQVJBLFVBQVNBLElBQVVBLEVBQUVBLEtBQVFBLEVBQUVBLEtBQWVBO1lBQzdDRyxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUM1QkEsSUFBSUEsS0FBS0EsR0FBYUE7Z0JBQ3JCQSxJQUFJQSxFQUFFQSxJQUFJQTtnQkFDVkEsS0FBS0EsRUFBRUEsS0FBS0E7YUFDWkEsQ0FBQ0E7WUFFS0EsT0FBUUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsU0FBU0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFFckRBLE1BQU1BLENBQUNBO2dCQUNOQSxPQUFPQSxFQUFFQTtvQkFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGNBQW1CLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNWLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM3QyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEIsQ0FBQztvQkFDRCxJQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUN2QyxDQUFDO2FBQ0RBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0ZILGVBQUNBO0lBQURBLENBQUNBLEFBL0RELElBK0RDO0lBL0REOzhCQStEQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBBbiBlbnRyeSBpbiBhIFJlZ2lzdHJ5LiBFYWNoIEVudHJ5IGNvbnRhaW5zIGEgdGVzdCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgRW50cnkgaXMgYXBwbGljYWJsZSwgYW5kIGEgdmFsdWUgZm9yIHRoZVxuICogZW50cnkuXG4gKi9cbmludGVyZmFjZSBFbnRyeTxUPiB7XG5cdHRlc3Q6IFRlc3Q7XG5cdHZhbHVlOiBUO1xufVxuXG4vKipcbiAqIEEgcmVnaXN0cnkgb2YgdmFsdWVzIHRhZ2dlZCB3aXRoIG1hdGNoZXJzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeTxUPiB7XG5cdHByb3RlY3RlZCBfZGVmYXVsdFZhbHVlOiBUO1xuXHRwcml2YXRlIF9lbnRyaWVzOiBFbnRyeTxUPltdO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSBuZXcgUmVnaXN0cnksIG9wdGlvbmFsbHkgY29udGFpbmluZyBhIGdpdmVuIGRlZmF1bHQgdmFsdWUuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkZWZhdWx0VmFsdWU/OiBUKSB7XG5cdFx0dGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlO1xuXHRcdHRoaXMuX2VudHJpZXMgPSBbXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGZpcnN0IGVudHJ5IGluIHRoaXMgcmVnaXN0cnkgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBhcmd1bWVudHMuIElmIG5vIGVudHJ5IG1hdGNoZXMgYW5kIHRoZSByZWdpc3RyeVxuXHQgKiB3YXMgY3JlYXRlZCB3aXRoIGEgZGVmYXVsdCB2YWx1ZSwgdGhhdCB2YWx1ZSB3aWxsIGJlIHJldHVybmVkLiBPdGhlcndpc2UsIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24uXG5cdCAqXG5cdCAqIEBwYXJhbSAuLi5hcmdzIEFyZ3VtZW50cyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYSBtYXRjaGluZyB2YWx1ZS5cblx0ICogQHJldHVybnMgdGhlIG1hdGNoaW5nIHZhbHVlLCBvciBhIGRlZmF1bHQgdmFsdWUgaWYgb25lIGV4aXN0cy5cblx0ICovXG5cdG1hdGNoKC4uLmFyZ3M6IGFueVtdKTogVCB7XG5cdFx0bGV0IGVudHJpZXMgPSB0aGlzLl9lbnRyaWVzLnNsaWNlKDApO1xuXHRcdGxldCBlbnRyeTogRW50cnk8VD47XG5cblx0XHRmb3IgKGxldCBpID0gMDsgKGVudHJ5ID0gZW50cmllc1tpXSk7ICsraSkge1xuXHRcdFx0aWYgKGVudHJ5LnRlc3QuYXBwbHkobnVsbCwgYXJncykpIHtcblx0XHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2RlZmF1bHRWYWx1ZTtcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoJ05vIG1hdGNoIGZvdW5kJyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgYSB0ZXN0ICsgdmFsdWUgcGFpciB3aXRoIHRoaXMgcmVnaXN0cnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0ZXN0IFRoZSB0ZXN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgcmVnaXN0ZXJlZCB2YWx1ZSBtYXRjaGVzIGEgc2V0IG9mIGFyZ3VtZW50cy5cblx0ICogQHBhcmFtIHZhbHVlIEEgdmFsdWUgYmVpbmcgcmVnaXN0ZXJlZC5cblx0ICogQHBhcmFtIGZpcnN0IElmIHRydWUsIHRoZSBuZXdseSByZWdpc3RlcmVkIHRlc3QgYW5kIHZhbHVlIHdpbGwgYmUgdGhlIGZpcnN0IGVudHJ5IGluIHRoZSByZWdpc3RyeS5cblx0ICovXG5cdHJlZ2lzdGVyKHRlc3Q6IFRlc3QsIHZhbHVlOiBULCBmaXJzdD86IGJvb2xlYW4pOiBIYW5kbGUge1xuXHRcdGxldCBlbnRyaWVzID0gdGhpcy5fZW50cmllcztcblx0XHRsZXQgZW50cnk6IEVudHJ5PFQ+ID0ge1xuXHRcdFx0dGVzdDogdGVzdCxcblx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdH07XG5cblx0XHQoPGFueT4gZW50cmllcylbKGZpcnN0ID8gJ3Vuc2hpZnQnIDogJ3B1c2gnKV0oZW50cnkpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCk6IHZvaWQge307XG5cdFx0XHRcdGxldCBpID0gMDtcblx0XHRcdFx0d2hpbGUgKChpID0gZW50cmllcy5pbmRleE9mKGVudHJ5LCBpKSkgPiAtMSkge1xuXHRcdFx0XHRcdGVudHJpZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRlc3QgPSB2YWx1ZSA9IGVudHJpZXMgPSBlbnRyeSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgdGhhdCBhIHRlc3QgZnVuY3Rpb24gbXVzdCBpbXBsZW1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVzdCB7XG5cdCguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW47XG59XG4iXX0=