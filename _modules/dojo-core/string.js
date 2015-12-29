(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var escapeRegExpPattern = /[[\]{}()|\/\\^$.*+?]/g;
    var escapeXmlPattern = /[&<]/g;
    var escapeXmlForPattern = /[&<>'"]/g;
    var escapeXmlMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    };
    exports.HIGH_SURROGATE_MIN = 0xD800;
    exports.HIGH_SURROGATE_MAX = 0xDBFF;
    exports.LOW_SURROGATE_MIN = 0xDC00;
    exports.LOW_SURROGATE_MAX = 0xDFFF;
    /**
     * Performs validation and padding operations used by padStart and padEnd.
     */
    function getPadding(name, text, length, character) {
        if (character === void 0) { character = '0'; }
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string.');
        }
        if (character.length !== 1) {
            throw new TypeError('string.' + name + ' requires a valid padding character.');
        }
        if (length < 0 || length === Infinity) {
            throw new RangeError('string.' + name + ' requires a valid length.');
        }
        length -= text.length;
        return length < 1 ? '' : repeat(character, length);
    }
    /**
     * Validates that text is defined, and normalizes position (based on the given default if the input is NaN).
     * Used by startsWith, includes, and endsWith.
     * @return Normalized position.
     */
    function normalizeSubstringArgs(name, text, search, position, isEnd) {
        if (isEnd === void 0) { isEnd = false; }
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string to search against.');
        }
        var length = text.length;
        position = position !== position ? (isEnd ? length : 0) : position;
        return [text, String(search), Math.min(Math.max(position, 0), length)];
    }
    /**
     * Returns the UTF-16 encoded code point value of a given position in a string.
     * @param text The string containing the element whose code point is to be determined
     * @param position Position of an element within the string to retrieve the code point value from
     * @return A non-negative integer representing the UTF-16 encoded code point value
     */
    function codePointAt(text, position) {
        if (position === void 0) { position = 0; }
        // Adapted from https://github.com/mathiasbynens/String.prototype.codePointAt
        if (text == null) {
            throw new TypeError('string.codePointAt requries a valid string.');
        }
        var length = text.length;
        if (position !== position) {
            position = 0;
        }
        if (position < 0 || position >= length) {
            return undefined;
        }
        // Get the first code unit
        var first = text.charCodeAt(position);
        if (first >= exports.HIGH_SURROGATE_MIN && first <= exports.HIGH_SURROGATE_MAX && length > position + 1) {
            // Start of a surrogate pair (high surrogate and there is a next code unit); check for low surrogate
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            var second = text.charCodeAt(position + 1);
            if (second >= exports.LOW_SURROGATE_MIN && second <= exports.LOW_SURROGATE_MAX) {
                return (first - exports.HIGH_SURROGATE_MIN) * 0x400 + second - exports.LOW_SURROGATE_MIN + 0x10000;
            }
        }
        return first;
    }
    exports.codePointAt = codePointAt;
    /**
     * Determines whether a string ends with the given substring.
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param endPosition The index searching should stop before (defaults to text.length)
     * @return Boolean indicating if the search string was found at the end of the given string
     */
    function endsWith(text, search, endPosition) {
        if (endPosition == null && text != null) {
            endPosition = text.length;
        }
        _a = normalizeSubstringArgs('endsWith', text, search, endPosition, true), text = _a[0], search = _a[1], endPosition = _a[2];
        var start = endPosition - search.length;
        if (start < 0) {
            return false;
        }
        return text.slice(start, endPosition) === search;
        var _a;
    }
    exports.endsWith = endsWith;
    /**
     * Escapes a string so that it can safely be passed to the RegExp constructor.
     * @param text The string to be escaped
     * @return The escaped string
     */
    function escapeRegExp(text) {
        return !text ? text : text.replace(escapeRegExpPattern, '\\$&');
    }
    exports.escapeRegExp = escapeRegExp;
    /**
     * Sanitizes a string to protect against tag injection.
     * @param xml The string to be escaped
     * @param forAttribute Whether to also escape ', ", and > in addition to < and &
     * @return The escaped string
     */
    function escapeXml(xml, forAttribute) {
        if (forAttribute === void 0) { forAttribute = true; }
        if (!xml) {
            return xml;
        }
        var pattern = forAttribute ? escapeXmlForPattern : escapeXmlPattern;
        return xml.replace(pattern, function (character) {
            return escapeXmlMap[character];
        });
    }
    exports.escapeXml = escapeXml;
    /**
     * Returns a string created by using the specified sequence of code points.
     * @param codePoints One or more code points
     * @return A string containing the given code points
     */
    function fromCodePoint() {
        var codePoints = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            codePoints[_i - 0] = arguments[_i];
        }
        // Adapted from https://github.com/mathiasbynens/String.fromCodePoint
        var length = arguments.length;
        if (!length) {
            return '';
        }
        var fromCharCode = String.fromCharCode;
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var index = -1;
        var result = '';
        while (++index < length) {
            var codePoint = Number(arguments[index]);
            // Code points must be finite integers within the valid range
            var isValid = isFinite(codePoint) && Math.floor(codePoint) === codePoint &&
                codePoint >= 0 && codePoint <= 0x10FFFF;
            if (!isValid) {
                throw RangeError('string.fromCodePoint: Invalid code point ' + codePoint);
            }
            if (codePoint <= 0xFFFF) {
                // BMP code point
                codeUnits.push(codePoint);
            }
            else {
                // Astral code point; split in surrogate halves
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                var highSurrogate = (codePoint >> 10) + exports.HIGH_SURROGATE_MIN;
                var lowSurrogate = (codePoint % 0x400) + exports.LOW_SURROGATE_MIN;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    }
    exports.fromCodePoint = fromCodePoint;
    /**
     * Determines whether a string includes the given substring (optionally starting from a given index).
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param position The index to begin searching at
     * @return Boolean indicating if the search string was found within the given string
     */
    function includes(text, search, position) {
        if (position === void 0) { position = 0; }
        _a = normalizeSubstringArgs('includes', text, search, position), text = _a[0], search = _a[1], position = _a[2];
        return text.indexOf(search, position) !== -1;
        var _a;
    }
    exports.includes = includes;
    /**
     * Adds padding to the end of a string to ensure it is a certain length.
     * @param text The string to pad
     * @param length The target minimum length of the string
     * @param character The character to pad onto the end of the string
     * @return The string, padded to the given length if necessary
     */
    function padEnd(text, length, character) {
        if (character === void 0) { character = '0'; }
        return text + getPadding('padEnd', text, length, character);
    }
    exports.padEnd = padEnd;
    /**
     * Adds padding to the beginning of a string to ensure it is a certain length.
     * @param text The string to pad
     * @param length The target minimum length of the string
     * @param character The character to pad onto the beginning of the string
     * @return The string, padded to the given length if necessary
     */
    function padStart(text, length, character) {
        if (character === void 0) { character = '0'; }
        return getPadding('padStart', text, length, character) + text;
    }
    exports.padStart = padStart;
    /**
     * A tag function for template strings to get the template string's raw string form.
     * @param callSite Call site object (or a template string in TypeScript, which will transpile to one)
     * @param substitutions Values to substitute within the template string (TypeScript will generate these automatically)
     * @return String containing the raw template string with variables substituted
     *
     * @example
     * // Within TypeScript; logs 'The answer is:\\n42'
     * let answer = 42;
     * console.log(string.raw`The answer is:\n${answer}`);
     *
     * @example
     * // The same example as above, but directly specifying a JavaScript object and substitution
     * console.log(string.raw({ raw: [ 'The answer is:\\n', '' ] }, 42));
     */
    function raw(callSite) {
        var substitutions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            substitutions[_i - 1] = arguments[_i];
        }
        var rawStrings = callSite.raw;
        var result = '';
        var numSubstitutions = substitutions.length;
        if (callSite == null || callSite.raw == null) {
            throw new TypeError('string.raw requires a valid callSite object with a raw value');
        }
        for (var i = 0, length_1 = rawStrings.length; i < length_1; i++) {
            result += rawStrings[i] + (i < numSubstitutions && i < length_1 - 1 ? substitutions[i] : '');
        }
        return result;
    }
    exports.raw = raw;
    /**
     * Returns a string containing the given string repeated the specified number of times.
     * @param text The string to repeat
     * @param count The number of times to repeat the string
     * @return A string containing the input string repeated count times
     */
    function repeat(text, count) {
        if (count === void 0) { count = 0; }
        // Adapted from https://github.com/mathiasbynens/String.prototype.repeat
        if (text == null) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (count !== count) {
            count = 0;
        }
        if (count < 0 || count === Infinity) {
            throw new RangeError('string.repeat requires a non-negative finite count.');
        }
        var result = '';
        while (count) {
            if (count % 2) {
                result += text;
            }
            if (count > 1) {
                text += text;
            }
            count >>= 1;
        }
        return result;
    }
    exports.repeat = repeat;
    /**
     * Determines whether a string begins with the given substring (optionally starting from a given index).
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param position The index to begin searching at
     * @return Boolean indicating if the search string was found at the beginning of the given string
     */
    function startsWith(text, search, position) {
        if (position === void 0) { position = 0; }
        search = String(search);
        _a = normalizeSubstringArgs('startsWith', text, search, position), text = _a[0], search = _a[1], position = _a[2];
        var end = position + search.length;
        if (end > text.length) {
            return false;
        }
        return text.slice(position, end) === search;
        var _a;
    }
    exports.startsWith = startsWith;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmluZy50cyJdLCJuYW1lcyI6WyJnZXRQYWRkaW5nIiwibm9ybWFsaXplU3Vic3RyaW5nQXJncyIsImNvZGVQb2ludEF0IiwiZW5kc1dpdGgiLCJlc2NhcGVSZWdFeHAiLCJlc2NhcGVYbWwiLCJmcm9tQ29kZVBvaW50IiwiaW5jbHVkZXMiLCJwYWRFbmQiLCJwYWRTdGFydCIsInJhdyIsInJlcGVhdCIsInN0YXJ0c1dpdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBRUEsSUFBTSxtQkFBbUIsR0FBRyx1QkFBdUIsQ0FBQztJQUNwRCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUNqQyxJQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztJQUN2QyxJQUFNLFlBQVksR0FBaUI7UUFDbEMsR0FBRyxFQUFFLE9BQU87UUFDWixHQUFHLEVBQUUsTUFBTTtRQUNYLEdBQUcsRUFBRSxNQUFNO1FBQ1gsR0FBRyxFQUFFLFFBQVE7UUFDYixJQUFJLEVBQUUsT0FBTztLQUNiLENBQUM7SUFDVywwQkFBa0IsR0FBRyxNQUFNLENBQUM7SUFDNUIsMEJBQWtCLEdBQUcsTUFBTSxDQUFDO0lBQzVCLHlCQUFpQixHQUFHLE1BQU0sQ0FBQztJQUMzQix5QkFBaUIsR0FBRyxNQUFNLENBQUM7SUFFeEM7O09BRUc7SUFDSCxvQkFBb0IsSUFBWSxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsU0FBdUI7UUFBdkJBLHlCQUF1QkEsR0FBdkJBLGVBQXVCQTtRQUN0RkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLE1BQU1BLElBQUlBLFNBQVNBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLEdBQUdBLDJCQUEyQkEsQ0FBQ0EsQ0FBQ0E7UUFDckVBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEtB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QkFDZkEsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7WUFDREEsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUF2QmUsY0FBTSxTQXVCckIsQ0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNILG9CQUEyQixJQUFZLEVBQUUsTUFBYyxFQUFFLFFBQW9CO1FBQXBCQyx3QkFBb0JBLEdBQXBCQSxZQUFvQkE7UUFDNUVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3hCQSxLQUE2QkEsc0JBQXNCQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxFQUF2RkEsSUFBSUEsVUFBRUEsTUFBTUEsVUFBRUEsUUFBUUEsUUFBaUVBLENBQUNBO1FBRTFGQSxJQUFNQSxHQUFHQSxHQUFHQSxRQUFRQSxHQUFHQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLEtBQUtBLE1BQU1BLENBQUNBOztJQUM3Q0EsQ0FBQ0E7SUFWZSxrQkFBVSxhQVV6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFzaCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IGVzY2FwZVJlZ0V4cFBhdHRlcm4gPSAvW1tcXF17fSgpfFxcL1xcXFxeJC4qKz9dL2c7XG5jb25zdCBlc2NhcGVYbWxQYXR0ZXJuID0gL1smPF0vZztcbmNvbnN0IGVzY2FwZVhtbEZvclBhdHRlcm4gPSAvWyY8PidcIl0vZztcbmNvbnN0IGVzY2FwZVhtbE1hcDogSGFzaDxzdHJpbmc+ID0ge1xuXHQnJic6ICcmYW1wOycsXG5cdCc8JzogJyZsdDsnLFxuXHQnPic6ICcmZ3Q7Jyxcblx0J1wiJzogJyZxdW90OycsXG5cdCdcXCcnOiAnJiMzOTsnXG59O1xuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01JTiA9IDB4RDgwMDtcbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NQVggPSAweERCRkY7XG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NSU4gPSAweERDMDA7XG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NQVggPSAweERGRkY7XG5cbi8qKlxuICogUGVyZm9ybXMgdmFsaWRhdGlvbiBhbmQgcGFkZGluZyBvcGVyYXRpb25zIHVzZWQgYnkgcGFkU3RhcnQgYW5kIHBhZEVuZC5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFkZGluZyhuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIsIGNoYXJhY3Rlcjogc3RyaW5nID0gJzAnKTogc3RyaW5nIHtcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy4nICsgbmFtZSArICcgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdH1cblxuXHRpZiAoY2hhcmFjdGVyLmxlbmd0aCAhPT0gMSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy4nICsgbmFtZSArICcgcmVxdWlyZXMgYSB2YWxpZCBwYWRkaW5nIGNoYXJhY3Rlci4nKTtcblx0fVxuXG5cdGlmIChsZW5ndGggPCAwIHx8IGxlbmd0aCA9PT0gSW5maW5pdHkpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLicgKyBuYW1lICsgJyByZXF1aXJlcyBhIHZhbGlkIGxlbmd0aC4nKTtcblx0fVxuXG5cdGxlbmd0aCAtPSB0ZXh0Lmxlbmd0aDtcblx0cmV0dXJuIGxlbmd0aCA8IDEgPyAnJyA6IHJlcGVhdChjaGFyYWN0ZXIsIGxlbmd0aCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgdGV4dCBpcyBkZWZpbmVkLCBhbmQgbm9ybWFsaXplcyBwb3NpdGlvbiAoYmFzZWQgb24gdGhlIGdpdmVuIGRlZmF1bHQgaWYgdGhlIGlucHV0IGlzIE5hTikuXG4gKiBVc2VkIGJ5IHN0YXJ0c1dpdGgsIGluY2x1ZGVzLCBhbmQgZW5kc1dpdGguXG4gKiBAcmV0dXJuIE5vcm1hbGl6ZWQgcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN1YnN0cmluZ0FyZ3MobmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLFxuXHRcdGlzRW5kOiBib29sZWFuID0gZmFsc2UpOiBbIHN0cmluZywgc3RyaW5nLCBudW1iZXIgXSB7XG5cdGlmICh0ZXh0ID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcuJyArIG5hbWUgKyAnIHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nIHRvIHNlYXJjaCBhZ2FpbnN0LicpO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gdGV4dC5sZW5ndGg7XG5cdHBvc2l0aW9uID0gcG9zaXRpb24gIT09IHBvc2l0aW9uID8gKGlzRW5kID8gbGVuZ3RoIDogMCkgOiBwb3NpdGlvbjtcblx0cmV0dXJuIFsgdGV4dCwgU3RyaW5nKHNlYXJjaCksIE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9uLCAwKSwgbGVuZ3RoKSBdO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgdmFsdWUgb2YgYSBnaXZlbiBwb3NpdGlvbiBpbiBhIHN0cmluZy5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgY29udGFpbmluZyB0aGUgZWxlbWVudCB3aG9zZSBjb2RlIHBvaW50IGlzIHRvIGJlIGRldGVybWluZWRcbiAqIEBwYXJhbSBwb3NpdGlvbiBQb3NpdGlvbiBvZiBhbiBlbGVtZW50IHdpdGhpbiB0aGUgc3RyaW5nIHRvIHJldHJpZXZlIHRoZSBjb2RlIHBvaW50IHZhbHVlIGZyb21cbiAqIEByZXR1cm4gQSBub24tbmVnYXRpdmUgaW50ZWdlciByZXByZXNlbnRpbmcgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHRleHQ6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApIHtcblx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5jb2RlUG9pbnRBdCByZXF1cmllcyBhIHZhbGlkIHN0cmluZy4nKTtcblx0fVxuXHRjb25zdCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDtcblxuXHRpZiAocG9zaXRpb24gIT09IHBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSAwO1xuXHR9XG5cdGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIEdldCB0aGUgZmlyc3QgY29kZSB1bml0XG5cdGNvbnN0IGZpcnN0ID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0aWYgKGZpcnN0ID49IEhJR0hfU1VSUk9HQVRFX01JTiAmJiBmaXJzdCA8PSBISUdIX1NVUlJPR0FURV9NQVggJiYgbGVuZ3RoID4gcG9zaXRpb24gKyAxKSB7XG5cdFx0Ly8gU3RhcnQgb2YgYSBzdXJyb2dhdGUgcGFpciAoaGlnaCBzdXJyb2dhdGUgYW5kIHRoZXJlIGlzIGEgbmV4dCBjb2RlIHVuaXQpOyBjaGVjayBmb3IgbG93IHN1cnJvZ2F0ZVxuXHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdGNvbnN0IHNlY29uZCA9IHRleHQuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpO1xuXHRcdGlmIChzZWNvbmQgPj0gTE9XX1NVUlJPR0FURV9NSU4gJiYgc2Vjb25kIDw9IExPV19TVVJST0dBVEVfTUFYKSB7XG5cdFx0XHRyZXR1cm4gKGZpcnN0IC0gSElHSF9TVVJST0dBVEVfTUlOKSAqIDB4NDAwICsgc2Vjb25kIC0gTE9XX1NVUlJPR0FURV9NSU4gKyAweDEwMDAwO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlyc3Q7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGVuZHMgd2l0aCB0aGUgZ2l2ZW4gc3Vic3RyaW5nLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBsb29rIGZvciB0aGUgc2VhcmNoIHN0cmluZyB3aXRoaW5cbiAqIEBwYXJhbSBzZWFyY2ggVGhlIHN0cmluZyB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0gZW5kUG9zaXRpb24gVGhlIGluZGV4IHNlYXJjaGluZyBzaG91bGQgc3RvcCBiZWZvcmUgKGRlZmF1bHRzIHRvIHRleHQubGVuZ3RoKVxuICogQHJldHVybiBCb29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHNlYXJjaCBzdHJpbmcgd2FzIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIGdpdmVuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgodGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgZW5kUG9zaXRpb24/OiBudW1iZXIpOiBib29sZWFuIHtcblx0aWYgKGVuZFBvc2l0aW9uID09IG51bGwgJiYgdGV4dCAhPSBudWxsKSB7XG5cdFx0ZW5kUG9zaXRpb24gPSB0ZXh0Lmxlbmd0aDtcblx0fVxuXG5cdFsgdGV4dCwgc2VhcmNoLCBlbmRQb3NpdGlvbiBdID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnZW5kc1dpdGgnLCB0ZXh0LCBzZWFyY2gsIGVuZFBvc2l0aW9uLCB0cnVlKTtcblxuXHRjb25zdCBzdGFydCA9IGVuZFBvc2l0aW9uIC0gc2VhcmNoLmxlbmd0aDtcblx0aWYgKHN0YXJ0IDwgMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmRQb3NpdGlvbikgPT09IHNlYXJjaDtcbn1cblxuLyoqXG4gKiBFc2NhcGVzIGEgc3RyaW5nIHNvIHRoYXQgaXQgY2FuIHNhZmVseSBiZSBwYXNzZWQgdG8gdGhlIFJlZ0V4cCBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgdG8gYmUgZXNjYXBlZFxuICogQHJldHVybiBUaGUgZXNjYXBlZCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cCh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gIXRleHQgPyB0ZXh0IDogdGV4dC5yZXBsYWNlKGVzY2FwZVJlZ0V4cFBhdHRlcm4sICdcXFxcJCYnKTtcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZXMgYSBzdHJpbmcgdG8gcHJvdGVjdCBhZ2FpbnN0IHRhZyBpbmplY3Rpb24uXG4gKiBAcGFyYW0geG1sIFRoZSBzdHJpbmcgdG8gYmUgZXNjYXBlZFxuICogQHBhcmFtIGZvckF0dHJpYnV0ZSBXaGV0aGVyIHRvIGFsc28gZXNjYXBlICcsIFwiLCBhbmQgPiBpbiBhZGRpdGlvbiB0byA8IGFuZCAmXG4gKiBAcmV0dXJuIFRoZSBlc2NhcGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlWG1sKHhtbDogc3RyaW5nLCBmb3JBdHRyaWJ1dGU6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0aWYgKCF4bWwpIHtcblx0XHRyZXR1cm4geG1sO1xuXHR9XG5cblx0Y29uc3QgcGF0dGVybiA9IGZvckF0dHJpYnV0ZSA/IGVzY2FwZVhtbEZvclBhdHRlcm4gOiBlc2NhcGVYbWxQYXR0ZXJuO1xuXG5cdHJldHVybiB4bWwucmVwbGFjZShwYXR0ZXJuLCBmdW5jdGlvbiAoY2hhcmFjdGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBlc2NhcGVYbWxNYXBbY2hhcmFjdGVyXTtcblx0fSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBjcmVhdGVkIGJ5IHVzaW5nIHRoZSBzcGVjaWZpZWQgc2VxdWVuY2Ugb2YgY29kZSBwb2ludHMuXG4gKiBAcGFyYW0gY29kZVBvaW50cyBPbmUgb3IgbW9yZSBjb2RlIHBvaW50c1xuICogQHJldHVybiBBIHN0cmluZyBjb250YWluaW5nIHRoZSBnaXZlbiBjb2RlIHBvaW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzOiBudW1iZXJbXSk6IHN0cmluZyB7XG5cdC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcuZnJvbUNvZGVQb2ludFxuXHRjb25zdCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRpZiAoIWxlbmd0aCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdGNvbnN0IGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cdGNvbnN0IE1BWF9TSVpFID0gMHg0MDAwO1xuXHRsZXQgY29kZVVuaXRzOiBudW1iZXJbXSA9IFtdO1xuXHRsZXQgaW5kZXggPSAtMTtcblx0bGV0IHJlc3VsdCA9ICcnO1xuXG5cdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0bGV0IGNvZGVQb2ludCA9IE51bWJlcihhcmd1bWVudHNbaW5kZXhdKTtcblxuXHRcdC8vIENvZGUgcG9pbnRzIG11c3QgYmUgZmluaXRlIGludGVnZXJzIHdpdGhpbiB0aGUgdmFsaWQgcmFuZ2Vcblx0XHRsZXQgaXNWYWxpZCA9IGlzRmluaXRlKGNvZGVQb2ludCkgJiYgTWF0aC5mbG9vcihjb2RlUG9pbnQpID09PSBjb2RlUG9pbnQgJiZcblx0XHRcdGNvZGVQb2ludCA+PSAwICYmIGNvZGVQb2ludCA8PSAweDEwRkZGRjtcblx0XHRpZiAoIWlzVmFsaWQpIHtcblx0XHRcdHRocm93IFJhbmdlRXJyb3IoJ3N0cmluZy5mcm9tQ29kZVBvaW50OiBJbnZhbGlkIGNvZGUgcG9pbnQgJyArIGNvZGVQb2ludCk7XG5cdFx0fVxuXG5cdFx0aWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcblx0XHRcdC8vIEJNUCBjb2RlIHBvaW50XG5cdFx0XHRjb2RlVW5pdHMucHVzaChjb2RlUG9pbnQpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8vIEFzdHJhbCBjb2RlIHBvaW50OyBzcGxpdCBpbiBzdXJyb2dhdGUgaGFsdmVzXG5cdFx0XHQvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcblx0XHRcdGNvZGVQb2ludCAtPSAweDEwMDAwO1xuXHRcdFx0bGV0IGhpZ2hTdXJyb2dhdGUgPSAoY29kZVBvaW50ID4+IDEwKSArIEhJR0hfU1VSUk9HQVRFX01JTjtcblx0XHRcdGxldCBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgTE9XX1NVUlJPR0FURV9NSU47XG5cdFx0XHRjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xuXHRcdH1cblxuXHRcdGlmIChpbmRleCArIDEgPT09IGxlbmd0aCB8fCBjb2RlVW5pdHMubGVuZ3RoID4gTUFYX1NJWkUpIHtcblx0XHRcdHJlc3VsdCArPSBmcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY29kZVVuaXRzKTtcblx0XHRcdGNvZGVVbml0cy5sZW5ndGggPSAwO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIHN0cmluZyBpbmNsdWRlcyB0aGUgZ2l2ZW4gc3Vic3RyaW5nIChvcHRpb25hbGx5IHN0YXJ0aW5nIGZyb20gYSBnaXZlbiBpbmRleCkuXG4gKiBAcGFyYW0gdGV4dCBUaGUgc3RyaW5nIHRvIGxvb2sgZm9yIHRoZSBzZWFyY2ggc3RyaW5nIHdpdGhpblxuICogQHBhcmFtIHNlYXJjaCBUaGUgc3RyaW5nIHRvIHNlYXJjaCBmb3JcbiAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgaW5kZXggdG8gYmVnaW4gc2VhcmNoaW5nIGF0XG4gKiBAcmV0dXJuIEJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgc2VhcmNoIHN0cmluZyB3YXMgZm91bmQgd2l0aGluIHRoZSBnaXZlbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVzKHRleHQ6IHN0cmluZywgc2VhcmNoOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIgPSAwKTogYm9vbGVhbiB7XG5cdFsgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbiBdID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnaW5jbHVkZXMnLCB0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uKTtcblx0cmV0dXJuIHRleHQuaW5kZXhPZihzZWFyY2gsIHBvc2l0aW9uKSAhPT0gLTE7XG59XG5cbi8qKlxuICogQWRkcyBwYWRkaW5nIHRvIHRoZSBlbmQgb2YgYSBzdHJpbmcgdG8gZW5zdXJlIGl0IGlzIGEgY2VydGFpbiBsZW5ndGguXG4gKiBAcGFyYW0gdGV4dCBUaGUgc3RyaW5nIHRvIHBhZFxuICogQHBhcmFtIGxlbmd0aCBUaGUgdGFyZ2V0IG1pbmltdW0gbGVuZ3RoIG9mIHRoZSBzdHJpbmdcbiAqIEBwYXJhbSBjaGFyYWN0ZXIgVGhlIGNoYXJhY3RlciB0byBwYWQgb250byB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAqIEByZXR1cm4gVGhlIHN0cmluZywgcGFkZGVkIHRvIHRoZSBnaXZlbiBsZW5ndGggaWYgbmVjZXNzYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRFbmQodGV4dDogc3RyaW5nLCBsZW5ndGg6IG51bWJlciwgY2hhcmFjdGVyOiBzdHJpbmcgPSAnMCcpOiBzdHJpbmcge1xuXHRyZXR1cm4gdGV4dCArIGdldFBhZGRpbmcoJ3BhZEVuZCcsIHRleHQsIGxlbmd0aCwgY2hhcmFjdGVyKTtcbn1cblxuLyoqXG4gKiBBZGRzIHBhZGRpbmcgdG8gdGhlIGJlZ2lubmluZyBvZiBhIHN0cmluZyB0byBlbnN1cmUgaXQgaXMgYSBjZXJ0YWluIGxlbmd0aC5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSB0YXJnZXQgbWluaW11bSBsZW5ndGggb2YgdGhlIHN0cmluZ1xuICogQHBhcmFtIGNoYXJhY3RlciBUaGUgY2hhcmFjdGVyIHRvIHBhZCBvbnRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICogQHJldHVybiBUaGUgc3RyaW5nLCBwYWRkZWQgdG8gdGhlIGdpdmVuIGxlbmd0aCBpZiBuZWNlc3NhcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhZFN0YXJ0KHRleHQ6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIsIGNoYXJhY3Rlcjogc3RyaW5nID0gJzAnKTogc3RyaW5nIHtcblx0cmV0dXJuIGdldFBhZGRpbmcoJ3BhZFN0YXJ0JywgdGV4dCwgbGVuZ3RoLCBjaGFyYWN0ZXIpICsgdGV4dDtcbn1cblxuLyoqXG4gKiBBIHRhZyBmdW5jdGlvbiBmb3IgdGVtcGxhdGUgc3RyaW5ncyB0byBnZXQgdGhlIHRlbXBsYXRlIHN0cmluZydzIHJhdyBzdHJpbmcgZm9ybS5cbiAqIEBwYXJhbSBjYWxsU2l0ZSBDYWxsIHNpdGUgb2JqZWN0IChvciBhIHRlbXBsYXRlIHN0cmluZyBpbiBUeXBlU2NyaXB0LCB3aGljaCB3aWxsIHRyYW5zcGlsZSB0byBvbmUpXG4gKiBAcGFyYW0gc3Vic3RpdHV0aW9ucyBWYWx1ZXMgdG8gc3Vic3RpdHV0ZSB3aXRoaW4gdGhlIHRlbXBsYXRlIHN0cmluZyAoVHlwZVNjcmlwdCB3aWxsIGdlbmVyYXRlIHRoZXNlIGF1dG9tYXRpY2FsbHkpXG4gKiBAcmV0dXJuIFN0cmluZyBjb250YWluaW5nIHRoZSByYXcgdGVtcGxhdGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHN1YnN0aXR1dGVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFdpdGhpbiBUeXBlU2NyaXB0OyBsb2dzICdUaGUgYW5zd2VyIGlzOlxcXFxuNDInXG4gKiBsZXQgYW5zd2VyID0gNDI7XG4gKiBjb25zb2xlLmxvZyhzdHJpbmcucmF3YFRoZSBhbnN3ZXIgaXM6XFxuJHthbnN3ZXJ9YCk7XG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFRoZSBzYW1lIGV4YW1wbGUgYXMgYWJvdmUsIGJ1dCBkaXJlY3RseSBzcGVjaWZ5aW5nIGEgSmF2YVNjcmlwdCBvYmplY3QgYW5kIHN1YnN0aXR1dGlvblxuICogY29uc29sZS5sb2coc3RyaW5nLnJhdyh7IHJhdzogWyAnVGhlIGFuc3dlciBpczpcXFxcbicsICcnIF0gfSwgNDIpKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZTogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKTogc3RyaW5nIHtcblx0bGV0IHJhd1N0cmluZ3MgPSBjYWxsU2l0ZS5yYXc7XG5cdGxldCByZXN1bHQgPSAnJztcblx0bGV0IG51bVN1YnN0aXR1dGlvbnMgPSBzdWJzdGl0dXRpb25zLmxlbmd0aDtcblxuXHRpZiAoY2FsbFNpdGUgPT0gbnVsbCB8fCBjYWxsU2l0ZS5yYXcgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yYXcgcmVxdWlyZXMgYSB2YWxpZCBjYWxsU2l0ZSBvYmplY3Qgd2l0aCBhIHJhdyB2YWx1ZScpO1xuXHR9XG5cblx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJhd1N0cmluZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gcmF3U3RyaW5nc1tpXSArIChpIDwgbnVtU3Vic3RpdHV0aW9ucyAmJiBpIDwgbGVuZ3RoIC0gMSA/IHN1YnN0aXR1dGlvbnNbaV0gOiAnJyk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgZ2l2ZW4gc3RyaW5nIHJlcGVhdGVkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHRpbWVzLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byByZXBlYXRcbiAqIEBwYXJhbSBjb3VudCBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIHJlcGVhdCB0aGUgc3RyaW5nXG4gKiBAcmV0dXJuIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGlucHV0IHN0cmluZyByZXBlYXRlZCBjb3VudCB0aW1lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0KHRleHQ6IHN0cmluZywgY291bnQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuXHQvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5yZXBlYXRcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdH1cblx0aWYgKGNvdW50ICE9PSBjb3VudCkge1xuXHRcdGNvdW50ID0gMDtcblx0fVxuXHRpZiAoY291bnQgPCAwIHx8IGNvdW50ID09PSBJbmZpbml0eSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBjb3VudC4nKTtcblx0fVxuXG5cdGxldCByZXN1bHQgPSAnJztcblx0d2hpbGUgKGNvdW50KSB7XG5cdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0cmVzdWx0ICs9IHRleHQ7XG5cdFx0fVxuXHRcdGlmIChjb3VudCA+IDEpIHtcblx0XHRcdHRleHQgKz0gdGV4dDtcblx0XHR9XG5cdFx0Y291bnQgPj49IDE7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBzdHJpbmcgYmVnaW5zIHdpdGggdGhlIGdpdmVuIHN1YnN0cmluZyAob3B0aW9uYWxseSBzdGFydGluZyBmcm9tIGEgZ2l2ZW4gaW5kZXgpLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBsb29rIGZvciB0aGUgc2VhcmNoIHN0cmluZyB3aXRoaW5cbiAqIEBwYXJhbSBzZWFyY2ggVGhlIHN0cmluZyB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0gcG9zaXRpb24gVGhlIGluZGV4IHRvIGJlZ2luIHNlYXJjaGluZyBhdFxuICogQHJldHVybiBCb29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHNlYXJjaCBzdHJpbmcgd2FzIGZvdW5kIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGdpdmVuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aCh0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyID0gMCk6IGJvb2xlYW4ge1xuXHRzZWFyY2ggPSBTdHJpbmcoc2VhcmNoKTtcblx0WyB0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uIF0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdzdGFydHNXaXRoJywgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbik7XG5cblx0Y29uc3QgZW5kID0gcG9zaXRpb24gKyBzZWFyY2gubGVuZ3RoO1xuXHRpZiAoZW5kID4gdGV4dC5sZW5ndGgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdGV4dC5zbGljZShwb3NpdGlvbiwgZW5kKSA9PT0gc2VhcmNoO1xufVxuIl19