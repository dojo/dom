var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './decorators', './global'], factory);
    }
})(function (require, exports) {
    var decorators_1 = require('./decorators');
    var global_1 = require('./global');
    var Shim;
    (function (Shim) {
        var DELETED = {};
        function getUID() {
            return Math.floor(Math.random() * 100000000);
        }
        var generateName = (function () {
            var startId = Math.floor(Date.now() % 100000000);
            return function generateName() {
                return '__wm' + getUID() + (startId++ + '__');
            };
        })();
        var WeakMap = (function () {
            function WeakMap(iterable) {
                Object.defineProperty(this, '_name', {
                    value: generateName()
                });
                if (iterable) {
                    for (var _i = 0; _i < iterable.length; _i++) {
                        var _a = iterable[_i], key = _a[0], value = _a[1];
                        this.set(key, value);
                    }
                }
            }
            WeakMap.prototype.delete = function (key) {
                var entry = key[this._name];
                if (entry && entry.key === key && entry.value !== DELETED) {
                    entry.value = DELETED;
                    return true;
                }
                return false;
            };
            WeakMap.prototype.get = function (key) {
                var entry = key[this._name];
                if (entry && entry.key === key && entry.value !== DELETED) {
                    return entry.value;
                }
            };
            WeakMap.prototype.has = function (key) {
                var entry = key[this._name];
                return Boolean(entry && entry.key === key && entry.value !== DELETED);
            };
            WeakMap.prototype.set = function (key, value) {
                if (!key || (typeof key !== 'object' && typeof key !== 'function')) {
                    throw new TypeError('Invalid value used as weak map key');
                }
                var entry = key[this._name];
                if (!entry || entry.key !== key) {
                    entry = Object.create(null, {
                        key: { value: key }
                    });
                    Object.defineProperty(key, this._name, {
                        value: entry
                    });
                }
                entry.value = value;
                return this;
            };
            return WeakMap;
        })();
        Shim.WeakMap = WeakMap;
    })(Shim || (Shim = {}));
    var WeakMap = (function () {
        /* istanbul ignore next */
        function WeakMap(iterable) {
        }
        /* istanbul ignore next */
        WeakMap.prototype.delete = function (key) { throw new Error(); };
        /* istanbul ignore next */
        WeakMap.prototype.get = function (key) { throw new Error(); };
        /* istanbul ignore next */
        WeakMap.prototype.has = function (key) { throw new Error(); };
        /* istanbul ignore next */
        WeakMap.prototype.set = function (key, value) { throw new Error(); };
        WeakMap = __decorate([
            decorators_1.hasClass('weakmap', global_1.default.WeakMap, Shim.WeakMap)
        ], WeakMap);
        return WeakMap;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WeakMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Vha01hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9XZWFrTWFwLnRzIl0sIm5hbWVzIjpbIlNoaW0iLCJTaGltLmdldFVJRCIsImdlbmVyYXRlTmFtZSIsIlNoaW0uV2Vha01hcCIsIlNoaW0uV2Vha01hcC5jb25zdHJ1Y3RvciIsIlNoaW0uV2Vha01hcC5kZWxldGUiLCJTaGltLldlYWtNYXAuZ2V0IiwiU2hpbS5XZWFrTWFwLmhhcyIsIlNoaW0uV2Vha01hcC5zZXQiLCJXZWFrTWFwIiwiV2Vha01hcC5jb25zdHJ1Y3RvciIsIldlYWtNYXAuZGVsZXRlIiwiV2Vha01hcC5nZXQiLCJXZWFrTWFwLmhhcyIsIldlYWtNYXAuc2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFBLDJCQUF5QixjQUFjLENBQUMsQ0FBQTtJQUN4Qyx1QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUIsSUFBTyxJQUFJLENBd0VWO0lBeEVELFdBQU8sSUFBSSxFQUFDLENBQUM7UUFDWkEsSUFBTUEsT0FBT0EsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFPeEJBO1lBQ0NDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBO1FBQzlDQSxDQUFDQTtRQUVERCxJQUFJQSxZQUFZQSxHQUFHQSxDQUFDQTtZQUNuQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUVqRCxNQUFNLENBQUM7Z0JBQ05FLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLEVBQUVBLEdBQUdBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1lBQy9DQSxDQUFDQSxDQUFDO1FBQ0gsQ0FBQyxDQUFDRixFQUFFQSxDQUFDQTtRQUVMQTtZQUdDRyxpQkFBWUEsUUFB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aW1wb3J0IHsgaGFzQ2xhc3MgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5cbm1vZHVsZSBTaGltIHtcblx0Y29uc3QgREVMRVRFRDogYW55ID0ge307XG5cblx0aW50ZXJmYWNlIEVudHJ5PEssIFY+IHtcblx0XHRrZXk6IEs7XG5cdFx0dmFsdWU6IFY7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRVSUQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwKTtcblx0fVxuXG5cdGxldCBnZW5lcmF0ZU5hbWUgPSAoZnVuY3Rpb24gKCkge1xuXHRcdGxldCBzdGFydElkID0gTWF0aC5mbG9vcihEYXRlLm5vdygpICUgMTAwMDAwMDAwKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiBnZW5lcmF0ZU5hbWUoKTogc3RyaW5nIHtcblx0XHRcdHJldHVybiAnX193bScgKyBnZXRVSUQoKSArIChzdGFydElkKysgKyAnX18nKTtcblx0XHR9O1xuXHR9KSgpO1xuXG5cdGV4cG9ydCBjbGFzcyBXZWFrTWFwPEssIFY+IHtcblx0XHRwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG5cblx0XHRjb25zdHJ1Y3RvcihpdGVyYWJsZT86IGFueSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfbmFtZScsIHtcblx0XHRcdFx0dmFsdWU6IGdlbmVyYXRlTmFtZSgpXG5cdFx0XHR9KTtcblx0XHRcdGlmIChpdGVyYWJsZSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IFsga2V5LCB2YWx1ZSBdIG9mIGl0ZXJhYmxlKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRkZWxldGUoa2V5OiBhbnkpOiBib29sZWFuIHtcblx0XHRcdGNvbnN0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmIChlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkge1xuXHRcdFx0XHRlbnRyeS52YWx1ZSA9IERFTEVURUQ7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGdldChrZXk6IGFueSk6IFYge1xuXHRcdFx0Y29uc3QgZW50cnk6IEVudHJ5PEssIFY+ID0ga2V5W3RoaXMuX25hbWVdO1xuXHRcdFx0aWYgKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKSB7XG5cdFx0XHRcdHJldHVybiBlbnRyeS52YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYXMoa2V5OiBhbnkpOiBib29sZWFuIHtcblx0XHRcdGNvbnN0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdHJldHVybiBCb29sZWFuKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKTtcblx0XHR9XG5cblx0XHRzZXQoa2V5OiBhbnksIHZhbHVlPzogYW55KTogU2hpbS5XZWFrTWFwPEssIFY+IHtcblx0XHRcdGlmICgha2V5IHx8ICh0eXBlb2Yga2V5ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Yga2V5ICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHZhbHVlIHVzZWQgYXMgd2VhayBtYXAga2V5Jyk7XG5cdFx0XHR9XG5cdFx0XHRsZXQgZW50cnk6IEVudHJ5PEssIFY+ID0ga2V5W3RoaXMuX25hbWVdO1xuXHRcdFx0aWYgKCFlbnRyeSB8fCBlbnRyeS5rZXkgIT09IGtleSkge1xuXHRcdFx0XHRlbnRyeSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuXHRcdFx0XHRcdGtleTogeyB2YWx1ZToga2V5IH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShrZXksIHRoaXMuX25hbWUsIHtcblx0XHRcdFx0XHR2YWx1ZTogZW50cnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbnRyeS52YWx1ZSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XG59XG5cbkBoYXNDbGFzcygnd2Vha21hcCcsIGdsb2JhbC5XZWFrTWFwLCBTaGltLldlYWtNYXApXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWFrTWFwPEssIFY+IHtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBhbnkpIHt9XG5cblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0ZGVsZXRlKGtleTogSyk6IGJvb2xlYW4geyB0aHJvdyBuZXcgRXJyb3IoKTsgfVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRnZXQoa2V5OiBLKTogViB7IHRocm93IG5ldyBFcnJvcigpOyB9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGhhcyhrZXk6IEspOiBib29sZWFuIHsgdGhyb3cgbmV3IEVycm9yKCk7IH1cblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0c2V0KGtleTogSywgdmFsdWU/OiBWKTogV2Vha01hcDxLLCBWPiB7IHRocm93IG5ldyBFcnJvcigpOyB9XG59XG4iXX0=