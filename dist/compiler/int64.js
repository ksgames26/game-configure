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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50NjQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvaW50NjQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0dBYUc7OztBQUVILE1BQWEsS0FBSztJQXVFZDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXNCRztJQUNILFlBQW1CLEdBQVcsRUFBRSxJQUFZO1FBQ3hDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWE7UUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQWE7UUFDbEMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQzthQUFNLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQyxDQUFDO2FBQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzQyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFD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QVUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUU1RTs7O0dBR0c7QUFDb0IsZ0JBQVUsR0FBVSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKiAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKiAgQ29weXJpZ2h0IDIwMDkgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiAgaHR0cDovL3d3dy5kYXRheHNlY3VyZS5jb20vanMvY2xvc3VyZS9nb29nLmJjay4yMDEzMTAwNDIzMTIvZG9jcy9jbG9zdXJlX2dvb2dfbWF0aF9sb25nLmpzLnNvdXJjZS5odG1sXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIEludDY0IHtcclxuICAgIC8vIE5PVEU6IHRoZSBjb21waWxlciBzaG91bGQgaW5saW5lIHRoZXNlIGNvbnN0YW50IHZhbHVlcyBiZWxvdyBhbmQgdGhlbiByZW1vdmVcclxuICAgIC8vIHRoZXNlIHZhcmlhYmxlcywgc28gdGhlcmUgc2hvdWxkIGJlIG5vIHJ1bnRpbWUgcGVuYWx0eSBmb3IgdGhlc2UuXHJcbiAgICAvKipcclxuICAgICAqIE51bWJlciB1c2VkIHJlcGVhdGVkIGJlbG93IGluIGNhbGN1bGF0aW9ucy4gIFRoaXMgbXVzdCBhcHBlYXIgYmVmb3JlIHRoZVxyXG4gICAgICogZmlyc3QgY2FsbCB0byBhbnkgZnJvbSogZnVuY3Rpb24gYmVsb3cuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX1RXT19QV1JfMTZfREJMOiBudW1iZXIgPSAxIDw8IDE2O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9UV09fUFdSXzI0X0RCTDogbnVtYmVyID0gMSA8PCAyNDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfVFdPX1BXUl8zMl9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzE2X0RCTCAqIEludDY0Ll9UV09fUFdSXzE2X0RCTDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfVFdPX1BXUl8zMV9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzMyX0RCTCAvIDI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX1RXT19QV1JfNDhfREJMOiBudW1iZXIgPSBJbnQ2NC5fVFdPX1BXUl8zMl9EQkwgKiBJbnQ2NC5fVFdPX1BXUl8xNl9EQkw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVFdPX1BXUl82NF9EQkw6IG51bWJlciA9IEludDY0Ll9UV09fUFdSXzMyX0RCTCAqIEludDY0Ll9UV09fUFdSXzMyX0RCTDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBUV09fUFdSXzYzX0RCTDogbnVtYmVyID0gSW50NjQuVFdPX1BXUl82NF9EQkwgLyAyO1xyXG5cclxuICAgIC8qKiBAdHlwZSB7SW50NjR9ICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFpFUk86IEludDY0ID0gSW50NjQuZnJvbUludCgwKTtcclxuXHJcbiAgICAvKiogQHR5cGUge0ludDY0fSAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBPTkU6IEludDY0ID0gSW50NjQuZnJvbUludCgxKTtcclxuXHJcbiAgICAvKiogQHR5cGUge0ludDY0fSAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBORUdfT05FOiBJbnQ2NCA9IEludDY0LmZyb21JbnQoLTEpO1xyXG5cclxuICAgIC8qKiBAdHlwZSB7SW50NjR9ICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1BWF9WQUxVRTogSW50NjQgPSBJbnQ2NC5mcm9tQml0cygweGZmZmZmZmZmIHwgMCwgMHg3ZmZmZmZmZiB8IDApO1xyXG5cclxuICAgIC8qKiBAdHlwZSB7SW50NjR9ICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1JTl9WQUxVRTogSW50NjQgPSBJbnQ2NC5mcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZSB7SW50NjR9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRXT19QV1JfMjQ6IEludDY0ID0gSW50NjQuZnJvbUludCgxIDw8IDI0KTtcclxuXHJcbiAgICBwcml2YXRlIF9sb3c6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2hpZ2g6IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSA2NC1iaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyLCBnaXZlbiBpdHMgbG93IGFuZCBoaWdoIDMyLWJpdFxyXG4gICAgICogdmFsdWVzIGFzICpzaWduZWQqIGludGVnZXJzLiAgU2VlIHRoZSBmcm9tKiBmdW5jdGlvbnMgYmVsb3cgZm9yIG1vcmVcclxuICAgICAqIGNvbnZlbmllbnQgd2F5cyBvZiBjb25zdHJ1Y3RpbmcgTG9uZ3MuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9uZyBpcyB0aGUgdHdvIGdpdmVuIHNpZ25lZCwgMzItYml0IHZhbHVlcy5cclxuICAgICAqIFdlIHVzZSAzMi1iaXQgcGllY2VzIGJlY2F1c2UgdGhlc2UgYXJlIHRoZSBzaXplIG9mIGludGVnZXJzIG9uIHdoaWNoXHJcbiAgICAgKiBKYXZhc2NyaXB0IHBlcmZvcm1zIGJpdC1vcGVyYXRpb25zLiAgRm9yIG9wZXJhdGlvbnMgbGlrZSBhZGRpdGlvbiBhbmRcclxuICAgICAqIG11bHRpcGxpY2F0aW9uLCB3ZSBzcGxpdCBlYWNoIG51bWJlciBpbnRvIDE2LWJpdCBwaWVjZXMsIHdoaWNoIGNhbiBlYXNpbHkgYmVcclxuICAgICAqIG11bHRpcGxpZWQgd2l0aGluIEphdmFzY3JpcHQncyBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiB3aXRob3V0IG92ZXJmbG93XHJcbiAgICAgKiBvciBjaGFuZ2UgaW4gc2lnbi5cclxuICAgICAqXHJcbiAgICAgKiBJbiB0aGUgYWxnb3JpdGhtcyBiZWxvdywgd2UgZnJlcXVlbnRseSByZWR1Y2UgdGhlIG5lZ2F0aXZlIGNhc2UgdG8gdGhlXHJcbiAgICAgKiBwb3NpdGl2ZSBjYXNlIGJ5IG5lZ2F0aW5nIHRoZSBpbnB1dChzKSBhbmQgdGhlbiBwb3N0LXByb2Nlc3NpbmcgdGhlIHJlc3VsdC5cclxuICAgICAqIE5vdGUgdGhhdCB3ZSBtdXN0IEFMV0FZUyBjaGVjayBzcGVjaWFsbHkgd2hldGhlciB0aG9zZSB2YWx1ZXMgYXJlIE1JTl9WQUxVRVxyXG4gICAgICogKC0yXjYzKSBiZWNhdXNlIC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFIChzaW5jZSAyXjYzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhc1xyXG4gICAgICogYSBwb3NpdGl2ZSBudW1iZXIsIGl0IG92ZXJmbG93cyBiYWNrIGludG8gYSBuZWdhdGl2ZSkuICBOb3QgaGFuZGxpbmcgdGhpc1xyXG4gICAgICogY2FzZSB3b3VsZCBvZnRlbiByZXN1bHQgaW4gaW5maW5pdGUgcmVjdXJzaW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsb3cgIFRoZSBsb3cgKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoICBUaGUgaGlnaCAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nLlxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fbG93ID0gbG93IHwgMDtcclxuICAgICAgICB0aGlzLl9oaWdoID0gaGlnaCB8IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuICgzMi1iaXQpIGludGVnZXIgdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIDMyLWJpdCBpbnRlZ2VyIGluIHF1ZXN0aW9uLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUludCh2YWx1ZTogbnVtYmVyKTogSW50NjQge1xyXG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBJbnQ2NCh2YWx1ZSB8IDAsIHZhbHVlIDwgMCA/IC0xIDogMCk7XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gdmFsdWUsIHByb3ZpZGVkIHRoYXQgaXQgaXMgYSBmaW5pdGVcclxuICAgICAqIG51bWJlci4gIE90aGVyd2lzZSwgemVybyBpcyByZXR1cm5lZC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIGluIHF1ZXN0aW9uLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZTogbnVtYmVyKTogSW50NjQge1xyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gSW50NjQuWkVSTy5jbG9uZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPD0gLUludDY0LlRXT19QV1JfNjNfREJMKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBJbnQ2NC5NSU5fVkFMVUUuY2xvbmUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICsgMSA+PSBJbnQ2NC5UV09fUFdSXzYzX0RCTCkge1xyXG4gICAgICAgICAgICByZXR1cm4gSW50NjQuTUFYX1ZBTFVFLmNsb25lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21OdW1iZXIoLXZhbHVlKS5uZWdhdGUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEludDY0KHZhbHVlICUgSW50NjQuX1RXT19QV1JfMzJfREJMIHwgMCwgKHZhbHVlIC8gSW50NjQuX1RXT19QV1JfMzJfREJMKSB8IDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgNjQtYml0IGludGVnZXIgdGhhdCBjb21lcyBieSBjb25jYXRlbmF0aW5nXHJcbiAgICAgKiB0aGUgZ2l2ZW4gaGlnaCBhbmQgbG93IGJpdHMuICBFYWNoIGlzIGFzc3VtZWQgdG8gdXNlIDMyIGJpdHMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0cyBUaGUgbG93IDMyLWJpdHMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHMgVGhlIGhpZ2ggMzItYml0cy5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZyb21CaXRzKGxvd0JpdHM6IG51bWJlciwgaGlnaEJpdHM6IG51bWJlcik6IEludDY0IHtcclxuICAgICAgICByZXR1cm4gbmV3IEludDY0KGxvd0JpdHMsIGhpZ2hCaXRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBzdHJpbmcsIHdyaXR0ZW4gdXNpbmcgdGhlIGdpdmVuXHJcbiAgICAgKiByYWRpeC5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIExvbmcuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3B0X3JhZGl4IFRoZSByYWRpeCBpbiB3aGljaCB0aGUgdGV4dCBpcyB3cml0dGVuLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyhzdHI6IHN0cmluZywgb3B0X3JhZGl4OiBudW1iZXIpOiBJbnQ2NCB7XHJcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIm51bWJlciBmb3JtYXQgZXJyb3I6IGVtcHR5IHN0cmluZ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhZGl4ID0gb3B0X3JhZGl4IHx8IDEwO1xyXG4gICAgICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInJhZGl4IG91dCBvZiByYW5nZTogXCIgKyByYWRpeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RyLmNoYXJBdCgwKSA9PSBcIi1cIikge1xyXG4gICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbVN0cmluZyhzdHIuc3Vic3RyaW5nKDEpLCByYWRpeCkubmVnYXRlKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHIuaW5kZXhPZihcIi1cIikgPj0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignbnVtYmVyIGZvcm1hdCBlcnJvcjogaW50ZXJpb3IgXCItXCIgY2hhcmFjdGVyOiAnICsgc3RyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERvIHNldmVyYWwgKDgpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cclxuICAgICAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cclxuICAgICAgICBjb25zdCByYWRpeFRvUG93ZXIgPSBJbnQ2NC5mcm9tTnVtYmVyKE1hdGgucG93KHJhZGl4LCA4KSk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSBJbnQ2NC5aRVJPO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSA4KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbig4LCBzdHIubGVuZ3RoIC0gaSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhpLCBpICsgc2l6ZSksIHJhZGl4KTtcclxuICAgICAgICAgICAgaWYgKHNpemUgPCA4KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3dlciA9IEludDY0LmZyb21OdW1iZXIoTWF0aC5wb3cocmFkaXgsIHNpemUpKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWx0aXBseShwb3dlcikuYWRkKEludDY0LmZyb21OdW1iZXIodmFsdWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWx0aXBseShyYWRpeFRvUG93ZXIpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmFkZChJbnQ2NC5mcm9tTnVtYmVyKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQHJldHVybiB7bnVtYmVyfSBUaGUgdmFsdWUsIGFzc3VtaW5nIGl0IGlzIGEgMzItYml0IGludGVnZXIuICovXHJcbiAgICBwdWJsaWMgdG9JbnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG93O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBjbG9zZXN0IGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIHRvIHRoaXMgdmFsdWUuICovXHJcbiAgICBwdWJsaWMgdG9OdW1iZXIoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGlnaCAqIEludDY0Ll9UV09fUFdSXzMyX0RCTCArIHRoaXMuZ2V0TG93Qml0c1Vuc2lnbmVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3B0X3JhZGl4IFRoZSByYWRpeCBpbiB3aGljaCB0aGUgdGV4dCBzaG91bGQgYmUgd3JpdHRlbi5cclxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHRvU3RyaW5nKG9wdF9yYWRpeDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgcmFkaXggPSBvcHRfcmFkaXggfHwgMTA7XHJcbiAgICAgICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicmFkaXggb3V0IG9mIHJhbmdlOiBcIiArIHJhZGl4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzWmVybygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjBcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjaGFuZ2UgdGhlIExvbmcgdmFsdWUgYmVmb3JlIGl0IGNhbiBiZSBuZWdhdGVkLCBzbyB3ZSByZW1vdmVcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBib3R0b20tbW9zdCBkaWdpdCBpbiB0aGlzIGJhc2UgYW5kIHRoZW4gcmVjdXJzZSB0byBkbyB0aGUgcmVzdC5cclxuICAgICAgICAgICAgICAgIGxldCByYWRpeExvbmcgPSBJbnQ2NC5mcm9tTnVtYmVyKHJhZGl4KTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXYgPSB0aGlzLmRpdihyYWRpeExvbmcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbSA9IGRpdi5tdWx0aXBseShyYWRpeExvbmcpLnN1YnRyYWN0KHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpdi50b1N0cmluZyhyYWRpeCkgKyByZW0udG9JbnQoKS50b1N0cmluZyhyYWRpeCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCItXCIgKyB0aGlzLm5lZ2F0ZSgpLnRvU3RyaW5nKHJhZGl4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRG8gc2V2ZXJhbCAoNikgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xyXG4gICAgICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxyXG4gICAgICAgIGxldCByYWRpeFRvUG93ZXIgPSBJbnQ2NC5mcm9tTnVtYmVyKE1hdGgucG93KHJhZGl4LCA2KSk7XHJcblxyXG4gICAgICAgIGxldCByZW06IEludDY0ID0gdGhpcztcclxuICAgICAgICBsZXQgcmVzdWx0ID0gXCJcIjtcclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBsZXQgcmVtRGl2ID0gcmVtLmRpdihyYWRpeFRvUG93ZXIpO1xyXG4gICAgICAgICAgICBsZXQgaW50dmFsID0gcmVtLnN1YnRyYWN0KHJlbURpdi5tdWx0aXBseShyYWRpeFRvUG93ZXIpKS50b0ludCgpO1xyXG4gICAgICAgICAgICBsZXQgZGlnaXRzID0gaW50dmFsLnRvU3RyaW5nKHJhZGl4KTtcclxuXHJcbiAgICAgICAgICAgIHJlbSA9IHJlbURpdjtcclxuICAgICAgICAgICAgaWYgKHJlbS5pc1plcm8oKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpZ2l0cyArIHJlc3VsdDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0cyA9IFwiMFwiICsgZGlnaXRzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gXCJcIiArIGRpZ2l0cyArIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQHJldHVybiB7bnVtYmVyfSBUaGUgaGlnaCAzMi1iaXRzIGFzIGEgc2lnbmVkIHZhbHVlLiAqL1xyXG4gICAgcHVibGljIGdldEhpZ2hCaXRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBsb3cgMzItYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS4gKi9cclxuICAgIHB1YmxpYyBnZXRMb3dCaXRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEByZXR1cm4ge251bWJlcn0gVGhlIGxvdyAzMi1iaXRzIGFzIGFuIHVuc2lnbmVkIHZhbHVlLiAqL1xyXG4gICAgcHVibGljIGdldExvd0JpdHNVbnNpZ25lZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG93ID49IDAgPyB0aGlzLl9sb3cgOiBJbnQ2NC5fVFdPX1BXUl8zMl9EQkwgKyB0aGlzLl9sb3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byByZXByZXNlbnQgdGhlIGFic29sdXRlXHJcbiAgICAgKiAgICAgdmFsdWUgb2YgdGhpcyBMb25nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TnVtQml0c0FicygpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkuZ2V0TnVtQml0c0FicygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuX2hpZ2ggIT0gMCA/IHRoaXMuX2hpZ2ggOiB0aGlzLl9sb3c7XHJcbiAgICAgICAgICAgIGxldCBiaXQgPSAzMTtcclxuICAgICAgICAgICAgZm9yICg7IGJpdCA+IDA7IGJpdC0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHZhbCAmICgxIDw8IGJpdCkpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGlnaCAhPSAwID8gYml0ICsgMzMgOiBiaXQgKyAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIHZhbHVlIGlzIHplcm8uICovXHJcbiAgICBwdWJsaWMgaXNaZXJvKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoID09IDAgJiYgdGhpcy5fbG93ID09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBuZWdhdGl2ZS4gKi9cclxuICAgIHB1YmxpYyBpc05lZ2F0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoIDwgMDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIHZhbHVlIGlzIG9kZC4gKi9cclxuICAgIHB1YmxpYyBpc09kZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2xvdyAmIDEpID09IDE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIHRvIGNvbXBhcmUgYWdhaW5zdC5cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyBMb25nIGVxdWFscyB0aGUgb3RoZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IEludDY0KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpZ2ggPT0gb3RoZXIuX2hpZ2ggJiYgdGhpcy5fbG93ID09IG90aGVyLl9sb3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIHRvIGNvbXBhcmUgYWdhaW5zdC5cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhpcyBMb25nIGRvZXMgbm90IGVxdWFsIHRoZSBvdGhlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG5vdEVxdWFscyhvdGhlcjogSW50NjQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGlnaCAhPSBvdGhlci5faGlnaCB8fCB0aGlzLl9sb3cgIT0gb3RoZXIuX2xvdztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gY29tcGFyZSBhZ2FpbnN0LlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIExvbmcgaXMgbGVzcyB0aGFuIHRoZSBvdGhlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGxlc3NUaGFuKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmUob3RoZXIpIDwgMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gY29tcGFyZSBhZ2FpbnN0LlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIExvbmcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBvdGhlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGxlc3NUaGFuT3JFcXVhbChvdGhlcjogSW50NjQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKG90aGVyKSA8PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoaXMgTG9uZyBpcyBncmVhdGVyIHRoYW4gdGhlIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IEludDY0KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZShvdGhlcikgPiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoaXMgTG9uZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ3JlYXRlclRoYW5PckVxdWFsKG90aGVyOiBJbnQ2NCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmUob3RoZXIpID49IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wYXJlcyB0aGlzIExvbmcgd2l0aCB0aGUgZ2l2ZW4gb25lLlxyXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBjb21wYXJlIGFnYWluc3QuXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciwgYW5kIC0xXHJcbiAgICAgKiAgICAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29tcGFyZShvdGhlcjogSW50NjQpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLmVxdWFscyhvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpO1xyXG4gICAgICAgIGxldCBvdGhlck5lZyA9IG90aGVyLmlzTmVnYXRpdmUoKTtcclxuICAgICAgICBpZiAodGhpc05lZyAmJiAhb3RoZXJOZWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXNOZWcgJiYgb3RoZXJOZWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhdCB0aGlzIHBvaW50LCB0aGUgc2lnbnMgYXJlIHRoZSBzYW1lLCBzbyBzdWJ0cmFjdGlvbiB3aWxsIG5vdCBvdmVyZmxvd1xyXG4gICAgICAgIGlmICh0aGlzLnN1YnRyYWN0KG90aGVyKS5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQHJldHVybiB7SW50NjR9IFRoZSBuZWdhdGlvbiBvZiB0aGlzIHZhbHVlLiAqL1xyXG4gICAgcHVibGljIG5lZ2F0ZSgpOiBJbnQ2NCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXF1YWxzKEludDY0Lk1JTl9WQUxVRSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEludDY0Lk1JTl9WQUxVRS5jbG9uZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vdCgpLmFkZChJbnQ2NC5PTkUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgZ2l2ZW4gTG9uZy5cclxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIExvbmcgdG8gYWRkIHRvIHRoaXMgb25lLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBzdW0gb2YgdGhpcyBhbmQgdGhlIGdpdmVuIExvbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGQob3RoZXI6IEludDY0KTogSW50NjQge1xyXG4gICAgICAgIC8vIERpdmlkZSBlYWNoIG51bWJlciBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIHN1bSB0aGUgY2h1bmtzLlxyXG5cclxuICAgICAgICBsZXQgYTQ4ID0gdGhpcy5faGlnaCA+Pj4gMTY7XHJcbiAgICAgICAgbGV0IGEzMiA9IHRoaXMuX2hpZ2ggJiAweGZmZmY7XHJcbiAgICAgICAgbGV0IGExNiA9IHRoaXMuX2xvdyA+Pj4gMTY7XHJcbiAgICAgICAgbGV0IGEwMCA9IHRoaXMuX2xvdyAmIDB4ZmZmZjtcclxuXHJcbiAgICAgICAgbGV0IGI0OCA9IG90aGVyLl9oaWdoID4+PiAxNjtcclxuICAgICAgICBsZXQgYjMyID0gb3RoZXIuX2hpZ2ggJiAweGZmZmY7XHJcbiAgICAgICAgbGV0IGIxNiA9IG90aGVyLl9sb3cgPj4+IDE2O1xyXG4gICAgICAgIGxldCBiMDAgPSBvdGhlci5fbG93ICYgMHhmZmZmO1xyXG5cclxuICAgICAgICBsZXQgYzQ4ID0gMCxcclxuICAgICAgICAgICAgYzMyID0gMCxcclxuICAgICAgICAgICAgYzE2ID0gMCxcclxuICAgICAgICAgICAgYzAwID0gMDtcclxuICAgICAgICBjMDAgKz0gYTAwICsgYjAwO1xyXG4gICAgICAgIGMxNiArPSBjMDAgPj4+IDE2O1xyXG4gICAgICAgIGMwMCAmPSAweGZmZmY7XHJcbiAgICAgICAgYzE2ICs9IGExNiArIGIxNjtcclxuICAgICAgICBjMzIgKz0gYzE2ID4+PiAxNjtcclxuICAgICAgICBjMTYgJj0gMHhmZmZmO1xyXG4gICAgICAgIGMzMiArPSBhMzIgKyBiMzI7XHJcbiAgICAgICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XHJcbiAgICAgICAgYzMyICY9IDB4ZmZmZjtcclxuICAgICAgICBjNDggKz0gYTQ4ICsgYjQ4O1xyXG4gICAgICAgIGM0OCAmPSAweGZmZmY7XHJcbiAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKChjMTYgPDwgMTYpIHwgYzAwLCAoYzQ4IDw8IDE2KSB8IGMzMik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBnaXZlbiBMb25nLlxyXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyB0byBzdWJ0cmFjdCBmcm9tIHRoaXMuXHJcbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIGdpdmVuIExvbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdWJ0cmFjdChvdGhlcjogSW50NjQpOiBJbnQ2NCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG90aGVyLm5lZ2F0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIGdpdmVuIGxvbmcuXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIHRvIG11bHRpcGx5IHdpdGggdGhpcy5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgb3RoZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtdWx0aXBseShvdGhlcjogSW50NjQpOiBJbnQ2NCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNaZXJvKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEludDY0LlpFUk8uY2xvbmUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG90aGVyLmlzWmVybygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBJbnQ2NC5aRVJPLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3RoZXIuaXNPZGQoKSA/IEludDY0Lk1JTl9WQUxVRSA6IEludDY0LlpFUk8uY2xvbmUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG90aGVyLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlzT2RkKCkgPyBJbnQ2NC5NSU5fVkFMVUUgOiBJbnQ2NC5aRVJPLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgaWYgKG90aGVyLmlzTmVnYXRpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkubXVsdGlwbHkob3RoZXIubmVnYXRlKCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkubXVsdGlwbHkob3RoZXIpLm5lZ2F0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkob3RoZXIubmVnYXRlKCkpLm5lZ2F0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKEludDY0LlRXT19QV1JfMjQpICYmIG90aGVyLmxlc3NUaGFuKEludDY0LlRXT19QV1JfMjQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBJbnQ2NC5mcm9tTnVtYmVyKHRoaXMudG9OdW1iZXIoKSAqIG90aGVyLnRvTnVtYmVyKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGl2aWRlIGVhY2ggbG9uZyBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIGFkZCB1cCA0eDQgcHJvZHVjdHMuXHJcbiAgICAgICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cclxuXHJcbiAgICAgICAgbGV0IGE0OCA9IHRoaXMuX2hpZ2ggPj4+IDE2O1xyXG4gICAgICAgIGxldCBhMzIgPSB0aGlzLl9oaWdoICYgMHhmZmZmO1xyXG4gICAgICAgIGxldCBhMTYgPSB0aGlzLl9sb3cgPj4+IDE2O1xyXG4gICAgICAgIGxldCBhMDAgPSB0aGlzLl9sb3cgJiAweGZmZmY7XHJcblxyXG4gICAgICAgIGxldCBiNDggPSBvdGhlci5faGlnaCA+Pj4gMTY7XHJcbiAgICAgICAgbGV0IGIzMiA9IG90aGVyLl9oaWdoICYgMHhmZmZmO1xyXG4gICAgICAgIGxldCBiMTYgPSBvdGhlci5fbG93ID4+PiAxNjtcclxuICAgICAgICBsZXQgYjAwID0gb3RoZXIuX2xvdyAmIDB4ZmZmZjtcclxuXHJcbiAgICAgICAgbGV0IGM0OCA9IDAsXHJcbiAgICAgICAgICAgIGMzMiA9IDAsXHJcbiAgICAgICAgICAgIGMxNiA9IDAsXHJcbiAgICAgICAgICAgIGMwMCA9IDA7XHJcbiAgICAgICAgYzAwICs9IGEwMCAqIGIwMDtcclxuICAgICAgICBjMTYgKz0gYzAwID4+PiAxNjtcclxuICAgICAgICBjMDAgJj0gMHhmZmZmO1xyXG4gICAgICAgIGMxNiArPSBhMTYgKiBiMDA7XHJcbiAgICAgICAgYzMyICs9IGMxNiA+Pj4gMTY7XHJcbiAgICAgICAgYzE2ICY9IDB4ZmZmZjtcclxuICAgICAgICBjMTYgKz0gYTAwICogYjE2O1xyXG4gICAgICAgIGMzMiArPSBjMTYgPj4+IDE2O1xyXG4gICAgICAgIGMxNiAmPSAweGZmZmY7XHJcbiAgICAgICAgYzMyICs9IGEzMiAqIGIwMDtcclxuICAgICAgICBjNDggKz0gYzMyID4+PiAxNjtcclxuICAgICAgICBjMzIgJj0gMHhmZmZmO1xyXG4gICAgICAgIGMzMiArPSBhMTYgKiBiMTY7XHJcbiAgICAgICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XHJcbiAgICAgICAgYzMyICY9IDB4ZmZmZjtcclxuICAgICAgICBjMzIgKz0gYTAwICogYjMyO1xyXG4gICAgICAgIGM0OCArPSBjMzIgPj4+IDE2O1xyXG4gICAgICAgIGMzMiAmPSAweGZmZmY7XHJcbiAgICAgICAgYzQ4ICs9IGE0OCAqIGIwMCArIGEzMiAqIGIxNiArIGExNiAqIGIzMiArIGEwMCAqIGI0ODtcclxuICAgICAgICBjNDggJj0gMHhmZmZmO1xyXG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cygoYzE2IDw8IDE2KSB8IGMwMCwgKGM0OCA8PCAxNikgfCBjMzIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgZ2l2ZW4gb25lLlxyXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gb3RoZXIgTG9uZyBieSB3aGljaCB0byBkaXZpZGUuXHJcbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gVGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIGdpdmVuIG9uZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRpdihvdGhlcjogSW50NjQpOiBJbnQ2NCB7XHJcbiAgICAgICAgaWYgKG90aGVyLmlzWmVybygpKSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiZGl2aXNpb24gYnkgemVyb1wiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNaZXJvKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEludDY0LlpFUk8uY2xvbmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmVxdWFscyhJbnQ2NC5NSU5fVkFMVUUpKSB7XHJcbiAgICAgICAgICAgIGlmIChvdGhlci5lcXVhbHMoSW50NjQuT05FKSB8fCBvdGhlci5lcXVhbHMoSW50NjQuTkVHX09ORSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ2NC5NSU5fVkFMVUUuY2xvbmUoKTsgLy8gcmVjYWxsIHRoYXQgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUVcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvdGhlci5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0Lk9ORS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgaGF2ZSB8b3RoZXJ8ID49IDIsIHNvIHx0aGlzL290aGVyfCA8IHxNSU5fVkFMVUV8LlxyXG4gICAgICAgICAgICAgICAgbGV0IGhhbGZUaGlzID0gdGhpcy5zaGlmdFJpZ2h0KDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwcHJveCA9IGhhbGZUaGlzLmRpdihvdGhlcikuc2hpZnRMZWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcHJveC5lcXVhbHMoSW50NjQuWkVSTykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3RoZXIuaXNOZWdhdGl2ZSgpID8gSW50NjQuT05FLmNsb25lKCkgOiBJbnQ2NC5ORUdfT05FLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZW0gPSB0aGlzLnN1YnRyYWN0KG90aGVyLm11bHRpcGx5KGFwcHJveCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBhcHByb3guYWRkKHJlbS5kaXYob3RoZXIpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5lcXVhbHMoSW50NjQuTUlOX1ZBTFVFKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gSW50NjQuWkVSTy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGlmIChvdGhlci5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5lZ2F0ZSgpLmRpdihvdGhlci5uZWdhdGUoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZWdhdGUoKS5kaXYob3RoZXIpLm5lZ2F0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2KG90aGVyLm5lZ2F0ZSgpKS5uZWdhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlcGVhdCB0aGUgZm9sbG93aW5nIHVudGlsIHRoZSByZW1haW5kZXIgaXMgbGVzcyB0aGFuIG90aGVyOiAgZmluZCBhXHJcbiAgICAgICAgLy8gZmxvYXRpbmctcG9pbnQgdGhhdCBhcHByb3hpbWF0ZXMgcmVtYWluZGVyIC8gb3RoZXIgKmZyb20gYmVsb3cqLCBhZGQgdGhpc1xyXG4gICAgICAgIC8vIGludG8gdGhlIHJlc3VsdCwgYW5kIHN1YnRyYWN0IGl0IGZyb20gdGhlIHJlbWFpbmRlci4gIEl0IGlzIGNyaXRpY2FsIHRoYXRcclxuICAgICAgICAvLyB0aGUgYXBwcm94aW1hdGUgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSByZWFsIHZhbHVlIHNvIHRoYXQgdGhlXHJcbiAgICAgICAgLy8gcmVtYWluZGVyIG5ldmVyIGJlY29tZXMgbmVnYXRpdmUuXHJcbiAgICAgICAgbGV0IHJlcyA9IEludDY0LlpFUk8uY2xvbmUoKTtcclxuICAgICAgICBsZXQgcmVtOiBJbnQ2NCA9IHRoaXM7XHJcbiAgICAgICAgd2hpbGUgKHJlbS5ncmVhdGVyVGhhbk9yRXF1YWwob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIC8vIEFwcHJveGltYXRlIHRoZSByZXN1bHQgb2YgZGl2aXNpb24uIFRoaXMgbWF5IGJlIGEgbGl0dGxlIGdyZWF0ZXIgb3JcclxuICAgICAgICAgICAgLy8gc21hbGxlciB0aGFuIHRoZSBhY3R1YWwgdmFsdWUuXHJcbiAgICAgICAgICAgIGxldCBhcHByb3ggPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHJlbS50b051bWJlcigpIC8gb3RoZXIudG9OdW1iZXIoKSkpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2Ugd2lsbCB0d2VhayB0aGUgYXBwcm94aW1hdGUgcmVzdWx0IGJ5IGNoYW5naW5nIGl0IGluIHRoZSA0OC10aCBkaWdpdCBvclxyXG4gICAgICAgICAgICAvLyB0aGUgc21hbGxlc3Qgbm9uLWZyYWN0aW9uYWwgZGlnaXQsIHdoaWNoZXZlciBpcyBsYXJnZXIuXHJcbiAgICAgICAgICAgIGxldCBsb2cyID0gTWF0aC5jZWlsKE1hdGgubG9nKGFwcHJveCkgLyBNYXRoLkxOMik7XHJcbiAgICAgICAgICAgIGxldCBkZWx0YSA9IGxvZzIgPD0gNDggPyAxIDogTWF0aC5wb3coMiwgbG9nMiAtIDQ4KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERlY3JlYXNlIHRoZSBhcHByb3hpbWF0aW9uIHVudGlsIGl0IGlzIHNtYWxsZXIgdGhhbiB0aGUgcmVtYWluZGVyLiAgTm90ZVxyXG4gICAgICAgICAgICAvLyB0aGF0IGlmIGl0IGlzIHRvbyBsYXJnZSwgdGhlIHByb2R1Y3Qgb3ZlcmZsb3dzIGFuZCBpcyBuZWdhdGl2ZS5cclxuICAgICAgICAgICAgbGV0IGFwcHJveFJlcyA9IEludDY0LmZyb21OdW1iZXIoYXBwcm94KTtcclxuICAgICAgICAgICAgbGV0IGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWx0aXBseShvdGhlcik7XHJcbiAgICAgICAgICAgIHdoaWxlIChhcHByb3hSZW0uaXNOZWdhdGl2ZSgpIHx8IGFwcHJveFJlbS5ncmVhdGVyVGhhbihyZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBhcHByb3ggLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICBhcHByb3hSZXMgPSBJbnQ2NC5mcm9tTnVtYmVyKGFwcHJveCk7XHJcbiAgICAgICAgICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsdGlwbHkob3RoZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXZSBrbm93IHRoZSBhbnN3ZXIgY2FuJ3QgYmUgemVyby4uLiBhbmQgYWN0dWFsbHksIHplcm8gd291bGQgY2F1c2VcclxuICAgICAgICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uIHNpbmNlIHdlIHdvdWxkIG1ha2Ugbm8gcHJvZ3Jlc3MuXHJcbiAgICAgICAgICAgIGlmIChhcHByb3hSZXMuaXNaZXJvKCkpIHtcclxuICAgICAgICAgICAgICAgIGFwcHJveFJlcyA9IEludDY0Lk9ORS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXMgPSByZXMuYWRkKGFwcHJveFJlcyk7XHJcbiAgICAgICAgICAgIHJlbSA9IHJlbS5zdWJ0cmFjdChhcHByb3hSZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBMb25nIGJ5IHdoaWNoIHRvIG1vZC5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGlzIExvbmcgbW9kdWxvIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtb2R1bG8ob3RoZXI6IEludDY0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3VidHJhY3QodGhpcy5kaXYob3RoZXIpLm11bHRpcGx5KG90aGVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEByZXR1cm4ge0ludDY0fSBUaGUgYml0d2lzZS1OT1Qgb2YgdGhpcyB2YWx1ZS4gKi9cclxuICAgIHB1YmxpYyBub3QoKTogSW50NjQge1xyXG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh+dGhpcy5fbG93LCB+dGhpcy5faGlnaCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlLUFORCBvZiB0aGlzIExvbmcgYW5kIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBUaGUgTG9uZyB3aXRoIHdoaWNoIHRvIEFORC5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGUgYml0d2lzZS1BTkQgb2YgdGhpcyBhbmQgdGhlIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYW5kKG90aGVyOiBJbnQ2NCkge1xyXG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh0aGlzLl9sb3cgJiBvdGhlci5fbG93LCB0aGlzLl9oaWdoICYgb3RoZXIuX2hpZ2gpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYml0d2lzZS1PUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKiBAcGFyYW0ge0ludDY0fSBvdGhlciBUaGUgTG9uZyB3aXRoIHdoaWNoIHRvIE9SLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBiaXR3aXNlLU9SIG9mIHRoaXMgYW5kIHRoZSBvdGhlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG9yKG90aGVyOiBJbnQ2NCk6IEludDY0IHtcclxuICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHModGhpcy5fbG93IHwgb3RoZXIuX2xvdywgdGhpcy5faGlnaCB8IG90aGVyLl9oaWdoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGJpdHdpc2UtWE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIGdpdmVuIG9uZS5cclxuICAgICAqIEBwYXJhbSB7SW50NjR9IG90aGVyIFRoZSBMb25nIHdpdGggd2hpY2ggdG8gWE9SLlxyXG4gICAgICogQHJldHVybiB7SW50NjR9IFRoZSBiaXR3aXNlLVhPUiBvZiB0aGlzIGFuZCB0aGUgb3RoZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB4b3Iob3RoZXI6IEludDY0KTogSW50NjQge1xyXG4gICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyh0aGlzLl9sb3cgXiBvdGhlci5fbG93LCB0aGlzLl9oaWdoIF4gb3RoZXIuX2hpZ2gpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1CaXRzIFRoZSBudW1iZXIgb2YgYml0cyBieSB3aGljaCB0byBzaGlmdC5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGlzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNoaWZ0TGVmdChudW1CaXRzOiBudW1iZXIpOiBJbnQ2NCB7XHJcbiAgICAgICAgbnVtQml0cyAmPSA2MztcclxuICAgICAgICBpZiAobnVtQml0cyA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBsb3cgPSB0aGlzLl9sb3c7XHJcbiAgICAgICAgICAgIGlmIChudW1CaXRzIDwgMzIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5faGlnaDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ2NC5mcm9tQml0cyhsb3cgPDwgbnVtQml0cywgKGhpZ2ggPDwgbnVtQml0cykgfCAobG93ID4+PiAoMzIgLSBudW1CaXRzKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKDAsIGxvdyA8PCAobnVtQml0cyAtIDMyKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1CaXRzIFRoZSBudW1iZXIgb2YgYml0cyBieSB3aGljaCB0byBzaGlmdC5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGlzIHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaGlmdFJpZ2h0KG51bUJpdHM6IG51bWJlcik6IEludDY0IHtcclxuICAgICAgICBudW1CaXRzICY9IDYzO1xyXG4gICAgICAgIGlmIChudW1CaXRzID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLl9oaWdoO1xyXG4gICAgICAgICAgICBpZiAobnVtQml0cyA8IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG93ID0gdGhpcy5fbG93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKChsb3cgPj4+IG51bUJpdHMpIHwgKGhpZ2ggPDwgKDMyIC0gbnVtQml0cykpLCBoaWdoID4+IG51bUJpdHMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKGhpZ2ggPj4gKG51bUJpdHMgLSAzMiksIGhpZ2ggPj0gMCA/IDAgOiAtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudCwgd2l0aFxyXG4gICAgICogdGhlIG5ldyB0b3AgYml0cyBtYXRjaGluZyB0aGUgY3VycmVudCBzaWduIGJpdC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1CaXRzIFRoZSBudW1iZXIgb2YgYml0cyBieSB3aGljaCB0byBzaGlmdC5cclxuICAgICAqIEByZXR1cm4ge0ludDY0fSBUaGlzIHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQsIHdpdGhcclxuICAgICAqIHplcm9zIHBsYWNlZCBpbnRvIHRoZSBuZXcgbGVhZGluZyBiaXRzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2hpZnRSaWdodFVuc2lnbmVkKG51bUJpdHM6IG51bWJlcik6IEludDY0IHtcclxuICAgICAgICBudW1CaXRzICY9IDYzO1xyXG4gICAgICAgIGlmIChudW1CaXRzID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLl9oaWdoO1xyXG4gICAgICAgICAgICBpZiAobnVtQml0cyA8IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG93ID0gdGhpcy5fbG93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEludDY0LmZyb21CaXRzKChsb3cgPj4+IG51bUJpdHMpIHwgKGhpZ2ggPDwgKDMyIC0gbnVtQml0cykpLCBoaWdoID4+PiBudW1CaXRzKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChudW1CaXRzID09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMoaGlnaCwgMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSW50NjQuZnJvbUJpdHMoaGlnaCA+Pj4gKG51bUJpdHMgLSAzMiksIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIEByZXR1cm4ge0ludDY0fSBjbG9uZSBQUUxvbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNsb25lKCk6IEludDY0IHtcclxuICAgICAgICByZXR1cm4gbmV3IEludDY0KHRoaXMuX2xvdywgdGhpcy5faGlnaCk7XHJcbiAgICB9XHJcbn1cclxuIl19