(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './global'], factory);
    }
})(function (require, exports) {
    var global_1 = require('./global');
    exports.EPSILON = 1;
    exports.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    exports.MIN_SAFE_INTEGER = -exports.MAX_SAFE_INTEGER;
    /**
     * Determines whether the passed value is NaN without coersion.
     *
     * @param value The value to test
     * @return true if the value is NaN, false if it is not
     */
    function isNaN(value) {
        return typeof value === 'number' && global_1.default.isNaN(value);
    }
    exports.isNaN = isNaN;
    /**
     * Determines whether the passed value is a finite number without coersion.
     *
     * @param value The value to test
     * @return true if the value is finite, false if it is not
     */
    function isFinite(value) {
        return typeof value === 'number' && global_1.default.isFinite(value);
    }
    exports.isFinite = isFinite;
    /**
     * Determines whether the passed value is an integer.
     *
     * @param value The value to test
     * @return true if the value is an integer, false if it is not
     */
    function isInteger(value) {
        return isFinite(value) && Math.floor(value) === value;
    }
    exports.isInteger = isInteger;
    /**
     * Determines whether the passed value is an integer that is 'safe,' meaning:
     *   1. it can be expressed as an IEEE-754 double precision number
     *   2. it has a one-to-one mapping to a mathematical integer, meaning its
     *      IEEE-754 representation cannot be the result of rounding any other
     *      integer to fit the IEEE-754 representation
     * @param value The value to test
     * @return true if the value is an integer, false if it is not
     */
    function isSafeInteger(value) {
        return isInteger(value) && Math.abs(value) <= exports.MAX_SAFE_INTEGER;
    }
    exports.isSafeInteger = isSafeInteger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL251bWJlci50cyJdLCJuYW1lcyI6WyJpc05hTiIsImlzRmluaXRlIiwiaXNJbnRlZ2VyIiwiaXNTYWZlSW50ZWdlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQSx1QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFakIsZUFBTyxHQUFHLENBQUMsQ0FBQztJQUNaLHdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2Qyx3QkFBZ0IsR0FBRyxDQUFDLHdCQUFnQixDQUFDO0lBRWxEOzs7OztPQUtHO0lBQ0gsZUFBc0IsS0FBVTtRQUMvQkEsTUFBTUEsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsZ0JBQU1BLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3pEQSxDQUFDQTtJQUZlLGFBQUssUUFFcEIsQ0FBQTtJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQXlCLEtBQVU7UUFDbENDLE1BQU1BLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLElBQUlBLGdCQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM1REEsQ0FBQ0E7SUFGZSxnQkFBUSxXQUV2QixDQUFBO0lBRUQ7Ozs7O09BS0c7SUFDSCxtQkFBMEIsS0FBVTtRQUNuQ0MsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRmUsaUJBQVMsWUFFeEIsQ0FBQTtJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsdUJBQThCLEtBQVU7UUFDdkNDLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLHdCQUFnQkEsQ0FBQ0E7SUFDaEVBLENBQUNBO0lBRmUscUJBQWEsZ0JBRTVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcblxuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAxO1xuZXhwb3J0IGNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuZXhwb3J0IGNvbnN0IE1JTl9TQUZFX0lOVEVHRVIgPSAtTUFYX1NBRkVfSU5URUdFUjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBOYU4gd2l0aG91dCBjb2Vyc2lvbi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgTmFOLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFOKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgZ2xvYmFsLmlzTmFOKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBhIGZpbml0ZSBudW1iZXIgd2l0aG91dCBjb2Vyc2lvbi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZmluaXRlLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmluaXRlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgZ2xvYmFsLmlzRmluaXRlKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBhbiBpbnRlZ2VyLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW50ZWdlcih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgJiYgTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFzc2VkIHZhbHVlIGlzIGFuIGludGVnZXIgdGhhdCBpcyAnc2FmZSwnIG1lYW5pbmc6XG4gKiAgIDEuIGl0IGNhbiBiZSBleHByZXNzZWQgYXMgYW4gSUVFRS03NTQgZG91YmxlIHByZWNpc2lvbiBudW1iZXJcbiAqICAgMi4gaXQgaGFzIGEgb25lLXRvLW9uZSBtYXBwaW5nIHRvIGEgbWF0aGVtYXRpY2FsIGludGVnZXIsIG1lYW5pbmcgaXRzXG4gKiAgICAgIElFRUUtNzU0IHJlcHJlc2VudGF0aW9uIGNhbm5vdCBiZSB0aGUgcmVzdWx0IG9mIHJvdW5kaW5nIGFueSBvdGhlclxuICogICAgICBpbnRlZ2VyIHRvIGZpdCB0aGUgSUVFRS03NTQgcmVwcmVzZW50YXRpb25cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2FmZUludGVnZXIodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gaXNJbnRlZ2VyKHZhbHVlKSAmJiBNYXRoLmFicyh2YWx1ZSkgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cbiJdfQ==