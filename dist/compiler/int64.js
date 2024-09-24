"use strict";
/**
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  Copyright 2009 Google Inc. All Rights Reserved
 *
 *  http://www.dataxsecure.com/js/closure/goog.bck.201310042312/docs/closure_goog_math_long.js.source.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Int64 = void 0;
class Int64 {
    /**
     * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
     * values as *signed* integers.  See the from* functions below for more
     * convenient ways of constructing Longs.
     *
     * The internal representation of a long is the two given signed, 32-bit values.
     * We use 32-bit pieces because these are the size of integers on which
     * Javascript performs bit-operations.  For operations like addition and
     * multiplication, we split each number into 16-bit pieces, which can easily be
     * multiplied within Javascript's floating-point representation without overflow
     * or change in sign.
     *
     * In the algorithms below, we frequently reduce the negative case to the
     * positive case by negating the input(s) and then post-processing the result.
     * Note that we must ALWAYS check specially whether those values are MIN_VALUE
     * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
     * a positive number, it overflows back into a negative).  Not handling this
     * case would often result in infinite recursion.
     *
     * @param {number} low  The low (signed) 32 bits of the long.
     * @param {number} high  The high (signed) 32 bits of the long.
     * @constructor
     */
    constructor(low, high) {
        this._low = low | 0;
        this._high = high | 0;
    }
    /**
     * Returns a Long representing the given (32-bit) integer value.
     * @param {number} value The 32-bit integer in question.
     * @return {Int64} The corresponding Long value.
     */
    static fromInt(value) {
        const obj = new Int64(value | 0, value < 0 ? -1 : 0);
        return obj;
    }
    /**
     * Returns a Long representing the given value, provided that it is a finite
     * number.  Otherwise, zero is returned.
     * @param {number} value The number in question.
     * @return {Int64} The corresponding Long value.
     */
    static fromNumber(value) {
        if (isNaN(value) || !isFinite(value)) {
            return Int64.ZERO.clone();
        }
        else if (value <= -Int64.TWO_PWR_63_DBL) {
            return Int64.MIN_VALUE.clone();
        }
        else if (value + 1 >= Int64.TWO_PWR_63_DBL) {
            return Int64.MAX_VALUE.clone();
        }
        else if (value < 0) {
            return Int64.fromNumber(-value).negate();
        }
        else {
            return new Int64(value % Int64._TWO_PWR_32_DBL | 0, (value / Int64._TWO_PWR_32_DBL) | 0);
        }
    }
    /**
     * Returns a Long representing the 64-bit integer that comes by concatenating
     * the given high and low bits.  Each is assumed to use 32 bits.
     * @param {number} lowBits The low 32-bits.
     * @param {number} highBits The high 32-bits.
     * @return {Int64} The corresponding Long value.
     */
    static fromBits(lowBits, highBits) {
        return new Int64(lowBits, highBits);
    }
    /**
     * Returns a Long representation of the given string, written using the given
     * radix.
     * @param {string} str The textual representation of the Long.
     * @param {number} opt_radix The radix in which the text is written.
     * @return {Int64} The corresponding Long value.
     */
    static fromString(str, opt_radix) {
        if (str.length == 0) {
            throw Error("number format error: empty string");
        }
        const radix = opt_radix || 10;
        if (radix < 2 || 36 < radix) {
            throw Error("radix out of range: " + radix);
        }
        if (str.charAt(0) == "-") {
            return Int64.fromString(str.substring(1), radix).negate();
        }
        else if (str.indexOf("-") >= 0) {
            throw Error('number format error: interior "-" character: ' + str);
        }
        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        const radixToPower = Int64.fromNumber(Math.pow(radix, 8));
        let result = Int64.ZERO;
        for (let i = 0; i < str.length; i += 8) {
            const size = Math.min(8, str.length - i);
            const value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                const power = Int64.fromNumber(Math.pow(radix, size));
                result = result.multiply(power).add(Int64.fromNumber(value));
            }
            else {
                result = result.multiply(radixToPower);
                result = result.add(Int64.fromNumber(value));
            }
        }
        return result;
    }
    /** @return {number} The value, assuming it is a 32-bit integer. */
    toInt() {
        return this._low;
    }
    /** @return {number} The closest floating-point representation to this value. */
    toNumber() {
        return this._high * Int64._TWO_PWR_32_DBL + this.getLowBitsUnsigned();
    }
    /**
     * @param {number} opt_radix The radix in which the text should be written.
     * @return {string} The textual representation of this value.
     */
    toString(opt_radix) {
        let radix = opt_radix || 10;
        if (radix < 2 || 36 < radix) {
            throw Error("radix out of range: " + radix);
        }
        if (this.isZero()) {
            return "0";
        }
        if (this.isNegative()) {
            if (this.equals(Int64.MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                let radixLong = Int64.fromNumber(radix);
                let div = this.div(radixLong);
                let rem = div.multiply(radixLong).subtract(this);
                return div.toString(radix) + rem.toInt().toString(radix);
            }
            else {
                return "-" + this.negate().toString(radix);
            }
        }
        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        let radixToPower = Int64.fromNumber(Math.pow(radix, 6));
        let rem = this;
        let result = "";
        while (true) {
            let remDiv = rem.div(radixToPower);
            let intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
            let digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) {
                return digits + result;
            }
            else {
                while (digits.length < 6) {
                    digits = "0" + digits;
                }
                result = "" + digits + result;
            }
        }
    }
    /** @return {number} The high 32-bits as a signed value. */
    getHighBits() {
        return this._high;
    }
    /** @return {number} The low 32-bits as a signed value. */
    getLowBits() {
        return this._low;
    }
    /** @return {number} The low 32-bits as an unsigned value. */
    getLowBitsUnsigned() {
        return this._low >= 0 ? this._low : Int64._TWO_PWR_32_DBL + this._low;
    }
    /**
     * @return {number} Returns the number of bits needed to represent the absolute
     *     value of this Long.
     */
    getNumBitsAbs() {
        if (this.isNegative()) {
            if (this.equals(Int64.MIN_VALUE)) {
                return 64;
            }
            else {
                return this.negate().getNumBitsAbs();
            }
        }
        else {
            let val = this._high != 0 ? this._high : this._low;
            let bit = 31;
            for (; bit > 0; bit--) {
                if ((val & (1 << bit)) != 0) {
                    break;
                }
            }
            return this._high != 0 ? bit + 33 : bit + 1;
        }
    }
    /** @return {boolean} Whether this value is zero. */
    isZero() {
        return this._high == 0 && this._low == 0;
    }
    /** @return {boolean} Whether this value is negative. */
    isNegative() {
        return this._high < 0;
    }
    /** @return {boolean} Whether this value is odd. */
    isOdd() {
        return (this._low & 1) == 1;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long equals the other.
     */
    equals(other) {
        return this._high == other._high && this._low == other._low;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long does not equal the other.
     */
    notEquals(other) {
        return this._high != other._high || this._low != other._low;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long is less than the other.
     */
    lessThan(other) {
        return this.compare(other) < 0;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long is less than or equal to the other.
     */
    lessThanOrEqual(other) {
        return this.compare(other) <= 0;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long is greater than the other.
     */
    greaterThan(other) {
        return this.compare(other) > 0;
    }
    /**
     * @param {Int64} other Long to compare against.
     * @return {boolean} Whether this Long is greater than or equal to the other.
     */
    greaterThanOrEqual(other) {
        return this.compare(other) >= 0;
    }
    /**
     * Compares this Long with the given one.
     * @param {Int64} other Long to compare against.
     * @return {number} 0 if they are the same, 1 if the this is greater, and -1
     *     if the given one is greater.
     */
    compare(other) {
        if (this.equals(other)) {
            return 0;
        }
        let thisNeg = this.isNegative();
        let otherNeg = other.isNegative();
        if (thisNeg && !otherNeg) {
            return -1;
        }
        if (!thisNeg && otherNeg) {
            return 1;
        }
        // at this point, the signs are the same, so subtraction will not overflow
        if (this.subtract(other).isNegative()) {
            return -1;
        }
        else {
            return 1;
        }
    }
    /** @return {Int64} The negation of this value. */
    negate() {
        if (this.equals(Int64.MIN_VALUE)) {
            return Int64.MIN_VALUE.clone();
        }
        else {
            return this.not().add(Int64.ONE);
        }
    }
    /**
     * Returns the sum of this and the given Long.
     * @param {Int64} other Long to add to this one.
     * @return {Int64} The sum of this and the given Long.
     */
    add(other) {
        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
        let a48 = this._high >>> 16;
        let a32 = this._high & 0xffff;
        let a16 = this._low >>> 16;
        let a00 = this._low & 0xffff;
        let b48 = other._high >>> 16;
        let b32 = other._high & 0xffff;
        let b16 = other._low >>> 16;
        let b00 = other._low & 0xffff;
        let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 + b48;
        c48 &= 0xffff;
        return Int64.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
    }
    /**
     * Returns the difference of this and the given Long.
     * @param {Int64} other Long to subtract from this.
     * @return {Int64} The difference of this and the given Long.
     */
    subtract(other) {
        return this.add(other.negate());
    }
    /**
     * Returns the product of this and the given long.
     * @param {Int64} other Long to multiply with this.
     * @return {Int64} The product of this and the other.
     */
    multiply(other) {
        if (this.isZero()) {
            return Int64.ZERO.clone();
        }
        else if (other.isZero()) {
            return Int64.ZERO.clone();
        }
        if (this.equals(Int64.MIN_VALUE)) {
            return other.isOdd() ? Int64.MIN_VALUE : Int64.ZERO.clone();
        }
        else if (other.equals(Int64.MIN_VALUE)) {
            return this.isOdd() ? Int64.MIN_VALUE : Int64.ZERO.clone();
        }
        if (this.isNegative()) {
            if (other.isNegative()) {
                return this.negate().multiply(other.negate());
            }
            else {
                return this.negate().multiply(other).negate();
            }
        }
        else if (other.isNegative()) {
            return this.multiply(other.negate()).negate();
        }
        // If both longs are small, use float multiplication
        if (this.lessThan(Int64.TWO_PWR_24) && other.lessThan(Int64.TWO_PWR_24)) {
            return Int64.fromNumber(this.toNumber() * other.toNumber());
        }
        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.
        let a48 = this._high >>> 16;
        let a32 = this._high & 0xffff;
        let a16 = this._low >>> 16;
        let a00 = this._low & 0xffff;
        let b48 = other._high >>> 16;
        let b32 = other._high & 0xffff;
        let b16 = other._low >>> 16;
        let b00 = other._low & 0xffff;
        let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xffff;
        return Int64.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
    }
    /**
     * Returns this Long divided by the given one.
     * @param {Int64} other Long by which to divide.
     * @return {Int64} This Long divided by the given one.
     */
    div(other) {
        if (other.isZero()) {
            throw Error("division by zero");
        }
        else if (this.isZero()) {
            return Int64.ZERO.clone();
        }
        if (this.equals(Int64.MIN_VALUE)) {
            if (other.equals(Int64.ONE) || other.equals(Int64.NEG_ONE)) {
                return Int64.MIN_VALUE.clone(); // recall that -MIN_VALUE == MIN_VALUE
            }
            else if (other.equals(Int64.MIN_VALUE)) {
                return Int64.ONE.clone();
            }
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                let halfThis = this.shiftRight(1);
                let approx = halfThis.div(other).shiftLeft(1);
                if (approx.equals(Int64.ZERO)) {
                    return other.isNegative() ? Int64.ONE.clone() : Int64.NEG_ONE.clone();
                }
                else {
                    let rem = this.subtract(other.multiply(approx));
                    let result = approx.add(rem.div(other));
                    return result;
                }
            }
        }
        else if (other.equals(Int64.MIN_VALUE)) {
            return Int64.ZERO.clone();
        }
        if (this.isNegative()) {
            if (other.isNegative()) {
                return this.negate().div(other.negate());
            }
            else {
                return this.negate().div(other).negate();
            }
        }
        else if (other.isNegative()) {
            return this.div(other.negate()).negate();
        }
        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        let res = Int64.ZERO.clone();
        let rem = this;
        while (rem.greaterThanOrEqual(other)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            let approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            let log2 = Math.ceil(Math.log(approx) / Math.LN2);
            let delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
            let approxRes = Int64.fromNumber(approx);
            let approxRem = approxRes.multiply(other);
            while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                approx -= delta;
                approxRes = Int64.fromNumber(approx);
                approxRem = approxRes.multiply(other);
            }
            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero()) {
                approxRes = Int64.ONE.clone();
            }
            res = res.add(approxRes);
            rem = rem.subtract(approxRem);
        }
        return res;
    }
    /**
     * Returns this Long modulo the given one.
     * @param {Int64} other Long by which to mod.
     * @return {Int64} This Long modulo the given one.
     */
    modulo(other) {
        return this.subtract(this.div(other).multiply(other));
    }
    /** @return {Int64} The bitwise-NOT of this value. */
    not() {
        return Int64.fromBits(~this._low, ~this._high);
    }
    /**
     * Returns the bitwise-AND of this Long and the given one.
     * @param {Int64} other The Long with which to AND.
     * @return {Int64} The bitwise-AND of this and the other.
     */
    and(other) {
        return Int64.fromBits(this._low & other._low, this._high & other._high);
    }
    /**
     * Returns the bitwise-OR of this Long and the given one.
     * @param {Int64} other The Long with which to OR.
     * @return {Int64} The bitwise-OR of this and the other.
     */
    or(other) {
        return Int64.fromBits(this._low | other._low, this._high | other._high);
    }
    /**
     * Returns the bitwise-XOR of this Long and the given one.
     * @param {Int64} other The Long with which to XOR.
     * @return {Int64} The bitwise-XOR of this and the other.
     */
    xor(other) {
        return Int64.fromBits(this._low ^ other._low, this._high ^ other._high);
    }
    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Int64} This shifted to the left by the given amount.
     */
    shiftLeft(numBits) {
        numBits &= 63;
        if (numBits == 0) {
            return this;
        }
        else {
            let low = this._low;
            if (numBits < 32) {
                let high = this._high;
                return Int64.fromBits(low << numBits, (high << numBits) | (low >>> (32 - numBits)));
            }
            else {
                return Int64.fromBits(0, low << (numBits - 32));
            }
        }
    }
    /**
     * Returns this Long with bits shifted to the right by the given amount.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Int64} This shifted to the right by the given amount.
     */
    shiftRight(numBits) {
        numBits &= 63;
        if (numBits == 0) {
            return this;
        }
        else {
            let high = this._high;
            if (numBits < 32) {
                let low = this._low;
                return Int64.fromBits((low >>> numBits) | (high << (32 - numBits)), high >> numBits);
            }
            else {
                return Int64.fromBits(high >> (numBits - 32), high >= 0 ? 0 : -1);
            }
        }
    }
    /**
     * Returns this Long with bits shifted to the right by the given amount, with
     * the new top bits matching the current sign bit.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Int64} This shifted to the right by the given amount, with
     * zeros placed into the new leading bits.
     */
    shiftRightUnsigned(numBits) {
        numBits &= 63;
        if (numBits == 0) {
            return this;
        }
        else {
            let high = this._high;
            if (numBits < 32) {
                let low = this._low;
                return Int64.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits);
            }
            else if (numBits == 32) {
                return Int64.fromBits(high, 0);
            }
            else {
                return Int64.fromBits(high >>> (numBits - 32), 0);
            }
        }
    }
    /**
     *  @return {Int64} clone PQLong
     */
    clone() {
        return new Int64(this._low, this._high);
    }
}
exports.Int64 = Int64;
// NOTE: the compiler should inline these constant values below and then remove
// these variables, so there should be no runtime penalty for these.
/**
 * Number used repeated below in calculations.  This must appear before the
 * first call to any from* function below.
 * @type {number}
 * @private
 */
Int64._TWO_PWR_16_DBL = 1 << 16;
/**
 * @type {number}
 * @private
 */
Int64._TWO_PWR_24_DBL = 1 << 24;
/**
 * @type {number}
 * @private
 */
Int64._TWO_PWR_32_DBL = Int64._TWO_PWR_16_DBL * Int64._TWO_PWR_16_DBL;
/**
 * @type {number}
 * @private
 */
Int64._TWO_PWR_31_DBL = Int64._TWO_PWR_32_DBL / 2;
/**
 * @type {number}
 * @private
 */
Int64._TWO_PWR_48_DBL = Int64._TWO_PWR_32_DBL * Int64._TWO_PWR_16_DBL;
/**
 * @type {number}
 * @private
 */
Int64.TWO_PWR_64_DBL = Int64._TWO_PWR_32_DBL * Int64._TWO_PWR_32_DBL;
/**
 * @type {number}
 * @private
 */
Int64.TWO_PWR_63_DBL = Int64.TWO_PWR_64_DBL / 2;
/** @type {Int64} */
Int64.ZERO = Int64.fromInt(0);
/** @type {Int64} */
Int64.ONE = Int64.fromInt(1);
/** @type {Int64} */
Int64.NEG_ONE = Int64.fromInt(-1);
/** @type {Int64} */
Int64.MAX_VALUE = Int64.fromBits(0xffffffff | 0, 0x7fffffff | 0);
/** @type {Int64} */
Int64.MIN_VALUE = Int64.fromBits(0, 0x80000000 | 0);
/**
 * @type {Int64}
 * @private
 */
Int64.TWO_PWR_24 = Int64.fromInt(1 << 24);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50NjQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvaW50NjQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0dBYUc7OztBQUVILE1BQWEsS0FBSztJQXVFZDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXNCRztJQUNILFlBQW1CLEdBQVcsRUFBRSxJQUFZO1FBQ3hDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWE7UUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQWE7UUFDbEMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQzthQUFNLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQyxDQUFDO2FBQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzQyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFD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QVUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUU1RTs7O0dBR0c7QUFDb0IsZ0JBQVUsR0FBVSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICogIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICogIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogIENvcHlyaWdodCAyMDA5IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWRcbiAqXG4gKiAgaHR0cDovL3d3dy5kYXRheHNlY3VyZS5jb20vanMvY2xvc3VyZS9nb29nLmJjay4yMDEzMTAwNDIzMTIvZG9jcy9jbG9zdXJlX2dvb2dfbWF0aF9sb25nLmpzLnNvdXJjZS5odG1sXG4gKi9cblxuZXhwb3J0IGNsYXNzIEludDY0IHtcbiAgICAvLyBOT1RFOiB0aGUgY29tcGlsZXIgc2hvdWxkIGlubGluZSB0aGVzZSBjb25zdGFudCB2YWx1ZXMgYmVsb3cgYW5kIHRoZW4gcmVtb3ZlXG4gICAgLy8gdGhlc2UgdmFyaWFibGVzLCBzbyB0aGVyZSBzaG91bGQgYmUgbm8gcnVudGltZSBwZW5hbHR5IGZvciB0aGVzZS5cbiAgICAvKipcbiAgICAgKiBOdW1iZXIgdXNlZCByZXBlYXRlZCBiZWxvdyBpbiBjYWxjdWxhdGlvbnMuICBUaGlzIG11c3QgYXBwZWFyIGJlZm9yZSB0aGVcbiAgICAgKiBmaXJzdCBjYWxsIHRvIGFueSBmcm9tKiBmdW5jdGlvbiBiZWxvdy5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX1RXT19QV1JfMTZfREJMOiBudW1iZXIgPSAxIDw8IDE2O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9UV09fUFdSXzI0X0RCTDogbnVtYmVyID0gMSA8PCAyNDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfVFdPX1BXUl8zMl9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzE2X0RCTCAqIEludDY0Ll9UV09fUFdSXzE2X0RCTDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfVFdPX1BXUl8zMV9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzMyX0RCTCAvIDI7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX1RXT19QV1JfNDhfREJMOiBudW1iZXIgPSBJbnQ2NC5fVFdPX1BXUl8zMl9EQkwgKiBJbnQ2NC5fVFdPX1BXUl8xNl9EQkw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVFdPX1BXUl82NF9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzMyX0RCTCAqIEludDY0Ll9UV09fUFdSXzMyX0RCTDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBUV09fUFdSXzYzX0RCTDogbnVtYmVyID0gSW50NjQuVFdPX1BXUl82NF9EQkwgLyAyO1xuXG4gICAgLyoqIEB0eXBlIHtJbnQ2NH0gKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFpFUk86IEludDY0ID0gSW50NjQuZnJvbUludCgwKTtcblxuICAgIC8qKiBAdHlwZSB7SW50NjR9ICovXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBPTkU6IEludDY0ID0gSW50NjQuZnJvbUludCgxKTtcblxuICAgIC8qKiBAdHlwZSB7SW50NjR9ICovXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBORUdfT05FOiBJbnQ2NCA9IEludDY0LmZyb21JbnQoLTEpO1xuXG4gICAgLyoqIEB0eXBlIHtJbnQ2NH0gKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1BWF9WQUxVRTogSW50NjQgPSBJbnQ2NC5mcm9tQml0cygweGZmZmZmZmZmIHwgMCwgMHg3ZmZmZmZmZiB8IDApO1xuXG4gICAgLyoqIEB0eXBlIHtJbnQ2NH0gKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1JTl9WQUxVRTogSW50NjQgPSBJbnQ2NC5mcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7SW50NjR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRXT19QV1JfMjQ6IEludDY0ID0gSW50NjQuZnJvbUludCgxIDw8IDI0KTtcblxuICAgIHByaXZhdGUgX2xvdzogbnVtYmVyO1xuICAgIHByaXZhdGUgX2hpZ2g6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSA2NC1iaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyLCBnaXZlbiBpdHMgbG93IGFuZCBoaWdoIDMyLWJpdFxuICAgICAqIHZhbHVlcyBhcyAqc2lnbmVkKiBpbnRlZ2Vycy4gIFNlZSB0aGUgZnJvbSogZnVuY3Rpb25zIGJlbG93IGZvciBtb3JlXG4gICAgICogY29udmVuaWVudCB3YXlzIG9mIGNvbnN0cnVjdGluZyBMb25ncy5cbiAgICAgKlxuICAgICAqIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGxvbmcgaXMgdGhlIHR3byBnaXZlbiBzaWduZWQsIDMyLWJpdCB2YWx1ZXMuXG4gICAgICogV2UgdXNlIDMyLWJpdCBwaWVjZXMgYmVjYXVzZSB0aGVzZSBhcmUgdGhlIHNpemUgb2YgaW50ZWdlcnMgb24gd2hpY2hcbiAgICAgKiBKYXZhc2NyaXB0IHBlcmZvcm1zIGJpdC1vcGVyYXRpb25zLiAgRm9yIG9wZXJhdGlvbnMgbGlrZSBhZGRpdGlvbiBhbmRcbiAgICAgKiBtdWx0aXBsaWNhdGlvbiwgd2Ugc3BsaXQgZWFjaCBudW1iZXIgaW50byAxNi1iaXQgcGllY2VzLCB3aGljaCBjYW4gZWFzaWx5IGJlXG4gICAgICogbXVsdGlwbGllZCB3aXRoaW4gSmF2YXNjcmlwdCdzIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIHdpdGhvdXQgb3ZlcmZsb3dcbiAgICAgKiBvciBjaGFuZ2UgaW4gc2lnbi5cbiAgICAgKlxuICAgICAqIEluIHRoZSBhbGdvcml0aG1zIGJlbG93LCB3ZSBmcmVxdWVudGx5IHJlZHVjZSB0aGUgbmVnYXRpdmUgY2FzZSB0byB0aGVcbiAgICAgKiBwb3NpdGl2ZSBjYXNlIGJ5IG5lZ2F0aW5nIHRoZSBpbnB1dChzKSBhbmQgdGhlbiBwb3N0LXByb2Nlc3NpbmcgdGhlIHJlc3VsdC5cbiAgICAgKiBOb3RlIHRoYXQgd2UgbXVzdCBBTFdBWVMgY2hlY2sgc3BlY2lhbGx5IHdoZXRoZXIgdGhvc2UgdmFsdWVzIGFyZSBNSU5fVkFMVUVcbiAgICAgKiAoLTJeNjMpIGJlY2F1c2UgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUUgKHNpbmNlIDJeNjMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzXG4gICAgICogYSBwb3NpdGl2ZSBudW1iZXIsIGl0IG92ZXJmbG93cyBiYWNrIGludG8gYSBuZWdhdGl2ZSkuICBOb3QgaGFuZGxpbmcgdGhpc1xuICAgICAqIGNhc2Ugd291bGQgb2Z0ZW4gcmVzdWx0IGluIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsb3cgIFRoZSBsb3cgKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaCAgVGhlIGhpZ2ggKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZy5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgY29uc3RydWN0b3IobG93OiBudW1iZXIsIGhpZ2g6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9sb3cgPSBsb3cgfCAwO1xuICAgICAgICB0aGlzLl9oaWdoID0gaGlnaCB8IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiAoMzItYml0KSBpbnRlZ2VyIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgMzItYml0IGludGVnZXIgaW4gcXVlc3Rpb24uXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tSW50KHZhbHVlOiBudW1iZXIpOiBJbnQ2NCB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBJbnQ2NCh2YWx1ZSB8IDAsIHZhbHVlIDwgMCA/IC0xIDogMCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2YWx1ZSwgcHJvdmlkZWQgdGhhdCBpdCBpcyBhIGZpbml0ZVxuICAgICAqIG51bWJlci4gIE90aGVyd2lzZSwgemVybyBpcyByZXR1cm5lZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIG51bWJlciBpbiBxdWVzdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21OdW1iZXIodmFsdWU6IG51bWJlcik6IEludDY0IHtcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gSW50NjQuWkVSTy5jbG9uZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDw9IC1JbnQ2NC5UV09fUFdSXzYzX0RCTCkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0Lk1JTl9WQUxVRS5jbG9uZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICsgMSA+PSBJbnQ2NC5UV09fUFdSXzYzX0RCTCkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0Lk1BWF9WQUxVRS5jbG9uZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21OdW1iZXIoLXZhbHVlKS5uZWdhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW50NjQodmFsdWUgJSBJbnQ2NC5fVFdPX1BXUl8zMl9EQkwgfCAwLCAodmFsdWUgLyBJbnQ2NC5fVFdPX1BXUl8zMl9EQkwpIHwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIDY0LWJpdCBpbnRlZ2VyIHRoYXQgY29tZXMgYnkgY29uY2F0ZW5hdGluZ1xuICAgICAqIHRoZSBnaXZlbiBoaWdoIGFuZCBsb3cgYml0cy4gIEVhY2ggaXMgYXNzdW1lZCB0byB1c2UgMzIgYml0cy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0cyBUaGUgbG93IDMyLWJpdHMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzIFRoZSBoaWdoIDMyLWJpdHMuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tQml0cyhsb3dCaXRzOiBudW1iZXIsIGhpZ2hCaXRzOiBudW1iZXIpOiBJbnQ2NCB7XG4gICAgICAgIHJldHVybiBuZXcgSW50NjQobG93Qml0cywgaGlnaEJpdHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBzdHJpbmcsIHdyaXR0ZW4gdXNpbmcgdGhlIGdpdmVuXG4gICAgICogcmFkaXguXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgTG9uZy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3B0X3JhZGl4IFRoZSByYWRpeCBpbiB3aGljaCB0aGUgdGV4dCBpcyB3cml0dGVuLlxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyhzdHI6IHN0cmluZywgb3B0X3JhZGl4OiBudW1iZXIpOiBJbnQ2NCB7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwibnVtYmVyIGZvcm1hdCBlcnJvcjogZW1wdHkgc3RyaW5nXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmFkaXggPSBvcHRfcmFkaXggfHwgMTA7XG4gICAgICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJyYWRpeCBvdXQgb2YgcmFuZ2U6IFwiICsgcmFkaXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0ci5jaGFyQXQoMCkgPT0gXCItXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBJbnQ2NC5mcm9tU3RyaW5nKHN0ci5zdWJzdHJpbmcoMSksIHJhZGl4KS5uZWdhdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHIuaW5kZXhPZihcIi1cIikgPj0gMCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ251bWJlciBmb3JtYXQgZXJyb3I6IGludGVyaW9yIFwiLVwiIGNoYXJhY3RlcjogJyArIHN0cik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyBzZXZlcmFsICg4KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICAgICAgICBjb25zdCByYWRpeFRvUG93ZXIgPSBJbnQ2NC5mcm9tTnVtYmVyKE1hdGgucG93KHJhZGl4LCA4KSk7XG5cbiAgICAgICAgbGV0IHJlc3VsdCA9IEludDY0LlpFUk87XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSA4KSB7XG4gICAgICAgICAgICBjb25zdCBzaXplID0gTWF0aC5taW4oOCwgc3RyLmxlbmd0aCAtIGkpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKGksIGkgKyBzaXplKSwgcmFkaXgpO1xuICAgICAgICAgICAgaWYgKHNpemUgPCA4KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG93ZXIgPSBJbnQ2NC5mcm9tTnVtYmVyKE1hdGgucG93KHJhZGl4LCBzaXplKSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bHRpcGx5KHBvd2VyKS5hZGQoSW50NjQuZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsdGlwbHkocmFkaXhUb1Bvd2VyKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuYWRkKEludDY0LmZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB2YWx1ZSwgYXNzdW1pbmcgaXQgaXMgYSAzMi1iaXQgaW50ZWdlci4gKi9cbiAgICBwdWJsaWMgdG9JbnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvdztcbiAgICB9XG5cbiAgICAvKiogQHJldHVybiB7bnVtYmVyfSBUaGUgY2xvc2VzdCBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiB0byB0aGlzIHZhbHVlLiAqL1xuICAgIHB1YmxpYyB0b051bWJlcigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faGlnaCAqIEludDY0Ll9UV09fUFdSXzMyX0RCTCArIHRoaXMuZ2V0TG93Qml0c1Vuc2lnbmVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wdF9yYWRpeCBUaGUgcmFkaXggaW4gd2hpY2ggdGhlIHRleHQgc2hvdWxkIGJlIHdyaXR0ZW4uXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZyhvcHRfcmFkaXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGxldCByYWRpeCA9IG9wdF9yYWRpeCB8fCAxMDtcbiAgICAgICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInJhZGl4IG91dCBvZiByYW5nZTogXCIgKyByYWRpeCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc1plcm8oKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gY2hhbmdlIHRoZSBMb25nIHZhbHVlIGJlZm9yZSBpdCBjYW4gYmUgbmVnYXRlZCwgc28gd2UgcmVtb3ZlXG4gICAgICAgICAgICAgICAgLy8gdGhlIGJvdHRvbS1tb3N0IGRpZ2l0IGluIHRoaXMgYmFzZSBhbmQgdGhlbiByZWN1cnNlIHRvIGRvIHRoZSByZXN0LlxuICAgICAgICAgICAgICAgIGxldCByYWRpeExvbmcgPSBJbnQ2NC5mcm9tTnVtYmVyKHJhZGl4KTtcbiAgICAgICAgICAgICAgICBsZXQgZGl2ID0gdGhpcy5kaXYocmFkaXhMb25nKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVtID0gZGl2Lm11bHRpcGx5KHJhZGl4TG9uZykuc3VidHJhY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpdi50b1N0cmluZyhyYWRpeCkgKyByZW0udG9JbnQoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIi1cIiArIHRoaXMubmVnYXRlKCkudG9TdHJpbmcocmFkaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gc2V2ZXJhbCAoNikgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgICAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgICAgICAgbGV0IHJhZGl4VG9Qb3dlciA9IEludDY0LmZyb21OdW1iZXIoTWF0aC5wb3cocmFkaXgsIDYpKTtcblxuICAgICAgICBsZXQgcmVtOiBJbnQ2NCA9IHRoaXM7XG4gICAgICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHJlbURpdiA9IHJlbS5kaXYocmFkaXhUb1Bvd2VyKTtcbiAgICAgICAgICAgIGxldCBpbnR2YWwgPSByZW0uc3VidHJhY3QocmVtRGl2Lm11bHRpcGx5KHJhZGl4VG9Qb3dlcikpLnRvSW50KCk7XG4gICAgICAgICAgICBsZXQgZGlnaXRzID0gaW50dmFsLnRvU3RyaW5nKHJhZGl4KTtcblxuICAgICAgICAgICAgcmVtID0gcmVtRGl2O1xuICAgICAgICAgICAgaWYgKHJlbS5pc1plcm8oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaWdpdHMgKyByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikge1xuICAgICAgICAgICAgICAgICAgICBkaWdpdHMgPSBcIjBcIiArIGRpZ2l0cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gXCJcIiArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBoaWdoIDMyLWJpdHMgYXMgYSBzaWduZWQgdmFsdWUuICovXG4gICAgcHVibGljIGdldEhpZ2hCaXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGlnaDtcbiAgICB9XG5cbiAgICAvKiogQHJldHVybiB7bnVtYmVyfSBUaGUgbG93IDMyLWJpdHMgYXMgYSBzaWduZWQgdmFsdWUuICovXG4gICAgcHVibGljIGdldExvd0JpdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb3c7XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4ge251bWJlcn0gVGhlIGxvdyAzMi1iaXRzIGFzIGFuIHVuc2lnbmVkIHZhbHVlLiAqL1xuICAgIHB1YmxpYyBnZXRMb3dCaXRzVW5zaWduZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb3cgPj0gMCA/IHRoaXMuX2xvdyA6IEludDY0Ll9UV09fUFdSXzMyX0RCTCArIHRoaXMuX2xvdztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byByZXByZXNlbnQgdGhlIGFic29sdXRlXG4gICAgICogICAgIHZhbHVlIG9mIHRoaXMgTG9uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TnVtQml0c0FicygpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDY0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZWdhdGUoKS5nZXROdW1CaXRzQWJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5faGlnaCAhPSAwID8gdGhpcy5faGlnaCA6IHRoaXMuX2xvdztcbiAgICAgICAgICAgIGxldCBiaXQgPSAzMTtcbiAgICAgICAgICAgIGZvciAoOyBiaXQgPiAwOyBiaXQtLSkge1xuICAgICAgICAgICAgICAgIGlmICgodmFsICYgKDEgPDwgYml0KSkgIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGlnaCAhPSAwID8gYml0ICsgMzMgOiBiaXQgKyAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyB2YWx1ZSBpcyB6ZXJvLiAqL1xuICAgIHB1YmxpYyBpc1plcm8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoID09IDAgJiYgdGhpcy5fbG93ID09IDA7XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBuZWdhdGl2ZS4gKi9cbiAgICBwdWJsaWMgaXNOZWdhdGl2ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpZ2ggPCAwO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoaXMgdmFsdWUgaXMgb2RkLiAqL1xuICAgIHB1YmxpYyBpc09kZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9sb3cgJiAxKSA9PSAxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyBMb25nIGVxdWFscyB0aGUgb3RoZXIuXG4gICAgICovXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogSW50NjQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpZ2ggPT0gb3RoZXIuX2hpZ2ggJiYgdGhpcy5fbG93ID09IG90aGVyLl9sb3c7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIExvbmcgZG9lcyBub3QgZXF1YWwgdGhlIG90aGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBub3RFcXVhbHMob3RoZXI6IEludDY0KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoICE9IG90aGVyLl9oaWdoIHx8IHRoaXMuX2xvdyAhPSBvdGhlci5fbG93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyBMb25nIGlzIGxlc3MgdGhhbiB0aGUgb3RoZXIuXG4gICAgICovXG4gICAgcHVibGljIGxlc3NUaGFuKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKG90aGVyKSA8IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIExvbmcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBvdGhlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbGVzc1RoYW5PckVxdWFsKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKG90aGVyKSA8PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyBMb25nIGlzIGdyZWF0ZXIgdGhhbiB0aGUgb3RoZXIuXG4gICAgICovXG4gICAgcHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKG90aGVyKSA+IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIExvbmcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBvdGhlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ3JlYXRlclRoYW5PckVxdWFsKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKG90aGVyKSA+PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHRoaXMgTG9uZyB3aXRoIHRoZSBnaXZlbiBvbmUuXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIsIGFuZCAtMVxuICAgICAqICAgICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXIuXG4gICAgICovXG4gICAgcHVibGljIGNvbXBhcmUob3RoZXI6IEludDY0KTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuZXF1YWxzKG90aGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpO1xuICAgICAgICBsZXQgb3RoZXJOZWcgPSBvdGhlci5pc05lZ2F0aXZlKCk7XG4gICAgICAgIGlmICh0aGlzTmVnICYmICFvdGhlck5lZykge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpc05lZyAmJiBvdGhlck5lZykge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhdCB0aGlzIHBvaW50LCB0aGUgc2lnbnMgYXJlIHRoZSBzYW1lLCBzbyBzdWJ0cmFjdGlvbiB3aWxsIG5vdCBvdmVyZmxvd1xuICAgICAgICBpZiAodGhpcy5zdWJ0cmFjdChvdGhlcikuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHtJbnQ2NH0gVGhlIG5lZ2F0aW9uIG9mIHRoaXMgdmFsdWUuICovXG4gICAgcHVibGljIG5lZ2F0ZSgpOiBJbnQ2NCB7XG4gICAgICAgIGlmICh0aGlzLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XG4gICAgICAgICAgICByZXR1cm4gSW50NjQuTUlOX1ZBTFVFLmNsb25lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub3QoKS5hZGQoSW50NjQuT05FKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgZ2l2ZW4gTG9uZy5cbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIHRvIGFkZCB0byB0aGlzIG9uZS5cbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgZ2l2ZW4gTG9uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkKG90aGVyOiBJbnQ2NCk6IEludDY0IHtcbiAgICAgICAgLy8gRGl2aWRlIGVhY2ggbnVtYmVyIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gc3VtIHRoZSBjaHVua3MuXG5cbiAgICAgICAgbGV0IGE0OCA9IHRoaXMuX2hpZ2ggPj4+IDE2O1xuICAgICAgICBsZXQgYTMyID0gdGhpcy5faGlnaCAmIDB4ZmZmZjtcbiAgICAgICAgbGV0IGExNiA9IHRoaXMuX2xvdyA+Pj4gMTY7XG4gICAgICAgIGxldCBhMDAgPSB0aGlzLl9sb3cgJiAweGZmZmY7XG5cbiAgICAgICAgbGV0IGI0OCA9IG90aGVyLl9oaWdoID4+PiAxNjtcbiAgICAgICAgbGV0IGIzMiA9IG90aGVyLl9oaWdoICYgMHhmZmZmO1xuICAgICAgICBsZXQgYjE2ID0gb3RoZXIuX2xvdyA+Pj4gMTY7XG4gICAgICAgIGxldCBiMDAgPSBvdGhlci5fbG93ICYgMHhmZmZmO1xuXG4gICAgICAgIGxldCBjNDggPSAwLFxuICAgICAgICAgICAgYzMyID0gMCxcbiAgICAgICAgICAgIGMxNiA9IDAsXG4gICAgICAgICAgICBjMDAgPSAwO1xuICAgICAgICBjMDAgKz0gYTAwICsgYjAwO1xuICAgICAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICAgICAgYzAwICY9IDB4ZmZmZjtcbiAgICAgICAgYzE2ICs9IGExNiArIGIxNjtcbiAgICAgICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgICAgIGMxNiAmPSAweGZmZmY7XG4gICAgICAgIGMzMiArPSBhMzIgKyBiMzI7XG4gICAgICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgICAgICBjMzIgJj0gMHhmZmZmO1xuICAgICAgICBjNDggKz0gYTQ4ICsgYjQ4O1xuICAgICAgICBjNDggJj0gMHhmZmZmO1xuICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMoKGMxNiA8PCAxNikgfCBjMDAsIChjNDggPDwgMTYpIHwgYzMyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBnaXZlbiBMb25nLlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gc3VidHJhY3QgZnJvbSB0aGlzLlxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgZ2l2ZW4gTG9uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3VidHJhY3Qob3RoZXI6IEludDY0KTogSW50NjQge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGQob3RoZXIubmVnYXRlKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIGdpdmVuIGxvbmcuXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBtdWx0aXBseSB3aXRoIHRoaXMuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBvdGhlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbXVsdGlwbHkob3RoZXI6IEludDY0KTogSW50NjQge1xuICAgICAgICBpZiAodGhpcy5pc1plcm8oKSkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5pc1plcm8oKSkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XG4gICAgICAgICAgICByZXR1cm4gb3RoZXIuaXNPZGQoKSA/IEludDY0Lk1JTl9WQUxVRSA6IEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNPZGQoKSA/IEludDY0Lk1JTl9WQUxVRSA6IEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgICAgICAgaWYgKG90aGVyLmlzTmVnYXRpdmUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5lZ2F0ZSgpLm11bHRpcGx5KG90aGVyLm5lZ2F0ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkubXVsdGlwbHkob3RoZXIpLm5lZ2F0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG90aGVyLmlzTmVnYXRpdmUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkob3RoZXIubmVnYXRlKCkpLm5lZ2F0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxuICAgICAgICBpZiAodGhpcy5sZXNzVGhhbihJbnQ2NC5UV09fUFdSXzI0KSAmJiBvdGhlci5sZXNzVGhhbihJbnQ2NC5UV09fUFdSXzI0KSkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21OdW1iZXIodGhpcy50b051bWJlcigpICogb3RoZXIudG9OdW1iZXIoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEaXZpZGUgZWFjaCBsb25nIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gYWRkIHVwIDR4NCBwcm9kdWN0cy5cbiAgICAgICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cblxuICAgICAgICBsZXQgYTQ4ID0gdGhpcy5faGlnaCA+Pj4gMTY7XG4gICAgICAgIGxldCBhMzIgPSB0aGlzLl9oaWdoICYgMHhmZmZmO1xuICAgICAgICBsZXQgYTE2ID0gdGhpcy5fbG93ID4+PiAxNjtcbiAgICAgICAgbGV0IGEwMCA9IHRoaXMuX2xvdyAmIDB4ZmZmZjtcblxuICAgICAgICBsZXQgYjQ4ID0gb3RoZXIuX2hpZ2ggPj4+IDE2O1xuICAgICAgICBsZXQgYjMyID0gb3RoZXIuX2hpZ2ggJiAweGZmZmY7XG4gICAgICAgIGxldCBiMTYgPSBvdGhlci5fbG93ID4+PiAxNjtcbiAgICAgICAgbGV0IGIwMCA9IG90aGVyLl9sb3cgJiAweGZmZmY7XG5cbiAgICAgICAgbGV0IGM0OCA9IDAsXG4gICAgICAgICAgICBjMzIgPSAwLFxuICAgICAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgICAgIGMwMCA9IDA7XG4gICAgICAgIGMwMCArPSBhMDAgKiBiMDA7XG4gICAgICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgICAgICBjMDAgJj0gMHhmZmZmO1xuICAgICAgICBjMTYgKz0gYTE2ICogYjAwO1xuICAgICAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICAgICAgYzE2ICY9IDB4ZmZmZjtcbiAgICAgICAgYzE2ICs9IGEwMCAqIGIxNjtcbiAgICAgICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgICAgIGMxNiAmPSAweGZmZmY7XG4gICAgICAgIGMzMiArPSBhMzIgKiBiMDA7XG4gICAgICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgICAgICBjMzIgJj0gMHhmZmZmO1xuICAgICAgICBjMzIgKz0gYTE2ICogYjE2O1xuICAgICAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICAgICAgYzMyICY9IDB4ZmZmZjtcbiAgICAgICAgYzMyICs9IGEwMCAqIGIzMjtcbiAgICAgICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgICAgIGMzMiAmPSAweGZmZmY7XG4gICAgICAgIGM0OCArPSBhNDggKiBiMDAgKyBhMzIgKiBiMTYgKyBhMTYgKiBiMzIgKyBhMDAgKiBiNDg7XG4gICAgICAgIGM0OCAmPSAweGZmZmY7XG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cygoYzE2IDw8IDE2KSB8IGMwMCwgKGM0OCA8PCAxNikgfCBjMzIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIGdpdmVuIG9uZS5cbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIGJ5IHdoaWNoIHRvIGRpdmlkZS5cbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIGdpdmVuIG9uZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGl2KG90aGVyOiBJbnQ2NCk6IEludDY0IHtcbiAgICAgICAgaWYgKG90aGVyLmlzWmVybygpKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImRpdmlzaW9uIGJ5IHplcm9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1plcm8oKSkge1xuICAgICAgICAgICAgcmV0dXJuIEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XG4gICAgICAgICAgICBpZiAob3RoZXIuZXF1YWxzKEludDY0Lk9ORSkgfHwgb3RoZXIuZXF1YWxzKEludDY0Lk5FR19PTkUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0Lk1JTl9WQUxVRS5jbG9uZSgpOyAvLyByZWNhbGwgdGhhdCAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvdGhlci5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ2NC5PTkUuY2xvbmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgaGF2ZSB8b3RoZXJ8ID49IDIsIHNvIHx0aGlzL290aGVyfCA8IHxNSU5fVkFMVUV8LlxuICAgICAgICAgICAgICAgIGxldCBoYWxmVGhpcyA9IHRoaXMuc2hpZnRSaWdodCgxKTtcbiAgICAgICAgICAgICAgICBsZXQgYXBwcm94ID0gaGFsZlRoaXMuZGl2KG90aGVyKS5zaGlmdExlZnQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKGFwcHJveC5lcXVhbHMoSW50NjQuWkVSTykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG90aGVyLmlzTmVnYXRpdmUoKSA/IEludDY0Lk9ORS5jbG9uZSgpIDogSW50NjQuTkVHX09ORS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZW0gPSB0aGlzLnN1YnRyYWN0KG90aGVyLm11bHRpcGx5KGFwcHJveCkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXBwcm94LmFkZChyZW0uZGl2KG90aGVyKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG90aGVyLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XG4gICAgICAgICAgICByZXR1cm4gSW50NjQuWkVSTy5jbG9uZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgICAgICBpZiAob3RoZXIuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkuZGl2KG90aGVyLm5lZ2F0ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkuZGl2KG90aGVyKS5uZWdhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdihvdGhlci5uZWdhdGUoKSkubmVnYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXBlYXQgdGhlIGZvbGxvd2luZyB1bnRpbCB0aGUgcmVtYWluZGVyIGlzIGxlc3MgdGhhbiBvdGhlcjogIGZpbmQgYVxuICAgICAgICAvLyBmbG9hdGluZy1wb2ludCB0aGF0IGFwcHJveGltYXRlcyByZW1haW5kZXIgLyBvdGhlciAqZnJvbSBiZWxvdyosIGFkZCB0aGlzXG4gICAgICAgIC8vIGludG8gdGhlIHJlc3VsdCwgYW5kIHN1YnRyYWN0IGl0IGZyb20gdGhlIHJlbWFpbmRlci4gIEl0IGlzIGNyaXRpY2FsIHRoYXRcbiAgICAgICAgLy8gdGhlIGFwcHJveGltYXRlIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcmVhbCB2YWx1ZSBzbyB0aGF0IHRoZVxuICAgICAgICAvLyByZW1haW5kZXIgbmV2ZXIgYmVjb21lcyBuZWdhdGl2ZS5cbiAgICAgICAgbGV0IHJlcyA9IEludDY0LlpFUk8uY2xvbmUoKTtcbiAgICAgICAgbGV0IHJlbTogSW50NjQgPSB0aGlzO1xuICAgICAgICB3aGlsZSAocmVtLmdyZWF0ZXJUaGFuT3JFcXVhbChvdGhlcikpIHtcbiAgICAgICAgICAgIC8vIEFwcHJveGltYXRlIHRoZSByZXN1bHQgb2YgZGl2aXNpb24uIFRoaXMgbWF5IGJlIGEgbGl0dGxlIGdyZWF0ZXIgb3JcbiAgICAgICAgICAgIC8vIHNtYWxsZXIgdGhhbiB0aGUgYWN0dWFsIHZhbHVlLlxuICAgICAgICAgICAgbGV0IGFwcHJveCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVtLnRvTnVtYmVyKCkgLyBvdGhlci50b051bWJlcigpKSk7XG5cbiAgICAgICAgICAgIC8vIFdlIHdpbGwgdHdlYWsgdGhlIGFwcHJveGltYXRlIHJlc3VsdCBieSBjaGFuZ2luZyBpdCBpbiB0aGUgNDgtdGggZGlnaXQgb3JcbiAgICAgICAgICAgIC8vIHRoZSBzbWFsbGVzdCBub24tZnJhY3Rpb25hbCBkaWdpdCwgd2hpY2hldmVyIGlzIGxhcmdlci5cbiAgICAgICAgICAgIGxldCBsb2cyID0gTWF0aC5jZWlsKE1hdGgubG9nKGFwcHJveCkgLyBNYXRoLkxOMik7XG4gICAgICAgICAgICBsZXQgZGVsdGEgPSBsb2cyIDw9IDQ4ID8gMSA6IE1hdGgucG93KDIsIGxvZzIgLSA0OCk7XG5cbiAgICAgICAgICAgIC8vIERlY3JlYXNlIHRoZSBhcHByb3hpbWF0aW9uIHVudGlsIGl0IGlzIHNtYWxsZXIgdGhhbiB0aGUgcmVtYWluZGVyLiAgTm90ZVxuICAgICAgICAgICAgLy8gdGhhdCBpZiBpdCBpcyB0b28gbGFyZ2UsIHRoZSBwcm9kdWN0IG92ZXJmbG93cyBhbmQgaXMgbmVnYXRpdmUuXG4gICAgICAgICAgICBsZXQgYXBwcm94UmVzID0gSW50NjQuZnJvbU51bWJlcihhcHByb3gpO1xuICAgICAgICAgICAgbGV0IGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWx0aXBseShvdGhlcik7XG4gICAgICAgICAgICB3aGlsZSAoYXBwcm94UmVtLmlzTmVnYXRpdmUoKSB8fCBhcHByb3hSZW0uZ3JlYXRlclRoYW4ocmVtKSkge1xuICAgICAgICAgICAgICAgIGFwcHJveCAtPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBhcHByb3hSZXMgPSBJbnQ2NC5mcm9tTnVtYmVyKGFwcHJveCk7XG4gICAgICAgICAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bHRpcGx5KG90aGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2Uga25vdyB0aGUgYW5zd2VyIGNhbid0IGJlIHplcm8uLi4gYW5kIGFjdHVhbGx5LCB6ZXJvIHdvdWxkIGNhdXNlXG4gICAgICAgICAgICAvLyBpbmZpbml0ZSByZWN1cnNpb24gc2luY2Ugd2Ugd291bGQgbWFrZSBubyBwcm9ncmVzcy5cbiAgICAgICAgICAgIGlmIChhcHByb3hSZXMuaXNaZXJvKCkpIHtcbiAgICAgICAgICAgICAgICBhcHByb3hSZXMgPSBJbnQ2NC5PTkUuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzID0gcmVzLmFkZChhcHByb3hSZXMpO1xuICAgICAgICAgICAgcmVtID0gcmVtLnN1YnRyYWN0KGFwcHJveFJlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIGdpdmVuIG9uZS5cbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIGJ5IHdoaWNoIHRvIG1vZC5cbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhpcyBMb25nIG1vZHVsbyB0aGUgZ2l2ZW4gb25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb2R1bG8ob3RoZXI6IEludDY0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnRyYWN0KHRoaXMuZGl2KG90aGVyKS5tdWx0aXBseShvdGhlcikpO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHtJbnQ2NH0gVGhlIGJpdHdpc2UtTk9UIG9mIHRoaXMgdmFsdWUuICovXG4gICAgcHVibGljIG5vdCgpOiBJbnQ2NCB7XG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh+dGhpcy5fbG93LCB+dGhpcy5faGlnaCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYml0d2lzZS1BTkQgb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIFRoZSBMb25nIHdpdGggd2hpY2ggdG8gQU5ELlxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgYml0d2lzZS1BTkQgb2YgdGhpcyBhbmQgdGhlIG90aGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBhbmQob3RoZXI6IEludDY0KSB7XG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh0aGlzLl9sb3cgJiBvdGhlci5fbG93LCB0aGlzLl9oaWdoICYgb3RoZXIuX2hpZ2gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJpdHdpc2UtT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIFRoZSBMb25nIHdpdGggd2hpY2ggdG8gT1IuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBiaXR3aXNlLU9SIG9mIHRoaXMgYW5kIHRoZSBvdGhlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3Iob3RoZXI6IEludDY0KTogSW50NjQge1xuICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHModGhpcy5fbG93IHwgb3RoZXIuX2xvdywgdGhpcy5faGlnaCB8IG90aGVyLl9oaWdoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlLVhPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBnaXZlbiBvbmUuXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgVGhlIExvbmcgd2l0aCB3aGljaCB0byBYT1IuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBiaXR3aXNlLVhPUiBvZiB0aGlzIGFuZCB0aGUgb3RoZXIuXG4gICAgICovXG4gICAgcHVibGljIHhvcihvdGhlcjogSW50NjQpOiBJbnQ2NCB7XG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh0aGlzLl9sb3cgXiBvdGhlci5fbG93LCB0aGlzLl9oaWdoIF4gb3RoZXIuX2hpZ2gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG51bUJpdHMgVGhlIG51bWJlciBvZiBiaXRzIGJ5IHdoaWNoIHRvIHNoaWZ0LlxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGlzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2hpZnRMZWZ0KG51bUJpdHM6IG51bWJlcik6IEludDY0IHtcbiAgICAgICAgbnVtQml0cyAmPSA2MztcbiAgICAgICAgaWYgKG51bUJpdHMgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbG93ID0gdGhpcy5fbG93O1xuICAgICAgICAgICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5faGlnaDtcbiAgICAgICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMobG93IDw8IG51bUJpdHMsIChoaWdoIDw8IG51bUJpdHMpIHwgKGxvdyA+Pj4gKDMyIC0gbnVtQml0cykpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKDAsIGxvdyA8PCAobnVtQml0cyAtIDMyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbnVtQml0cyBUaGUgbnVtYmVyIG9mIGJpdHMgYnkgd2hpY2ggdG8gc2hpZnQuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoaXMgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2hpZnRSaWdodChudW1CaXRzOiBudW1iZXIpOiBJbnQ2NCB7XG4gICAgICAgIG51bUJpdHMgJj0gNjM7XG4gICAgICAgIGlmIChudW1CaXRzID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLl9oaWdoO1xuICAgICAgICAgICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgICAgICAgICAgIGxldCBsb3cgPSB0aGlzLl9sb3c7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKChsb3cgPj4+IG51bUJpdHMpIHwgKGhpZ2ggPDwgKDMyIC0gbnVtQml0cykpLCBoaWdoID4+IG51bUJpdHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMoaGlnaCA+PiAobnVtQml0cyAtIDMyKSwgaGlnaCA+PSAwID8gMCA6IC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LCB3aXRoXG4gICAgICogdGhlIG5ldyB0b3AgYml0cyBtYXRjaGluZyB0aGUgY3VycmVudCBzaWduIGJpdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbnVtQml0cyBUaGUgbnVtYmVyIG9mIGJpdHMgYnkgd2hpY2ggdG8gc2hpZnQuXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoaXMgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudCwgd2l0aFxuICAgICAqIHplcm9zIHBsYWNlZCBpbnRvIHRoZSBuZXcgbGVhZGluZyBiaXRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaGlmdFJpZ2h0VW5zaWduZWQobnVtQml0czogbnVtYmVyKTogSW50NjQge1xuICAgICAgICBudW1CaXRzICY9IDYzO1xuICAgICAgICBpZiAobnVtQml0cyA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5faGlnaDtcbiAgICAgICAgICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgICAgICAgICAgICBsZXQgbG93ID0gdGhpcy5fbG93O1xuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cygobG93ID4+PiBudW1CaXRzKSB8IChoaWdoIDw8ICgzMiAtIG51bUJpdHMpKSwgaGlnaCA+Pj4gbnVtQml0cyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG51bUJpdHMgPT0gMzIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMoaGlnaCwgMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyhoaWdoID4+PiAobnVtQml0cyAtIDMyKSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgQHJldHVybiB7SW50NjR9IGNsb25lIFBRTG9uZ1xuICAgICAqL1xuICAgIHB1YmxpYyBjbG9uZSgpOiBJbnQ2NCB7XG4gICAgICAgIHJldHVybiBuZXcgSW50NjQodGhpcy5fbG93LCB0aGlzLl9oaWdoKTtcbiAgICB9XG59XG4iXX0=