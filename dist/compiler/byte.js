"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Byte = void 0;
const int64_1 = require("./int64");
/**
 * 类提供用于优化读取、写入以及处理二进制数据的方法和属性
 *
 * @export
 * @class Byte
 */
class Byte {
    /**
     * <p>获取当前主机的字节序。</p>
     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
     *  <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
     * @return 当前系统的字节序。
     */
    static getSystemEndian() {
        if (!this._sysEndian) {
            let buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            this._sysEndian = new Int16Array(buffer)[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
        }
        return this._sysEndian;
    }
    /**
     * 创建一个 <code>Byte</code> 类的实例。
     * @param	data	用于指定初始化的元素数目，或者用于初始化的TypedArray对象、ArrayBuffer对象。
     * 如果为 null ，则预分配一定的内存空间，
     * 当可用空间不足时，优先使用这部分内存，如果还不够，则重新分配所需内存。
     */
    constructor(data = void 0) {
        /**
         * 是否为小端数据
         *
         * @protected
         * @type {boolean}
         * @memberof Byte
         */
        this._xd_ = true;
        this._allocated_ = 8;
        this._pos_ = 0;
        this._length = 0;
        if (data) {
            this._u8d_ = new Uint8Array(data);
            this._d_ = new DataView(this._u8d_.buffer);
            this._length = this._d_.byteLength;
        }
        else {
            this.___resizeBuffer(this._allocated_);
        }
    }
    /**
     * 获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
     */
    get buffer() {
        let rstBuffer = this._d_.buffer;
        if (rstBuffer.byteLength == this.length)
            return rstBuffer;
        return rstBuffer.slice(0, this.length);
    }
    /**
     * <p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>LITTLE_ENDIAN</code> 。</p>
     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
     *  <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
     */
    get endian() {
        return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
    }
    set endian(endianStr) {
        this._xd_ = endianStr == Byte.LITTLE_ENDIAN;
    }
    /**
     * <p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
     * <p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
     * <p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
     */
    set length(value) {
        if (this._allocated_ < value)
            this.___resizeBuffer((this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2))));
        else if (this._allocated_ > value)
            this.___resizeBuffer((this._allocated_ = value));
        this._length = value;
    }
    get length() {
        return this._length;
    }
    /** @private */
    ___resizeBuffer(len) {
        try {
            let newByteView = new Uint8Array(len);
            if (this._u8d_ != null) {
                if (this._u8d_.length <= len)
                    newByteView.set(this._u8d_);
                else
                    newByteView.set(this._u8d_.subarray(0, len));
            }
            this._u8d_ = newByteView;
            this._d_ = new DataView(newByteView.buffer);
        }
        catch (err) {
            throw "___resizeBuffer err:" + len;
        }
    }
    /**
     * <p>常用于解析固定格式的字节流。</p>
     * <p>先从字节流的当前字节偏移位置处读取一个 <code>Uint32</code> 值，然后以此值为长度，读取此长度的字符串。</p>
     * @return 读取的字符串。
     */
    getString() {
        return this.rUTF(this.getUint32());
    }
    //LITTLE_ENDIAN only now;
    /**
     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Float32Array 对象。
     */
    getFloat32Array(start, len) {
        let end = start + len;
        end = end > this._length ? this._length : end;
        let v = new Float32Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    /**
     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Uint8Array 对象。
     */
    getUint8Array(start, len) {
        let end = start + len;
        end = end > this._length ? this._length : end;
        let v = new Uint8Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    /**
     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。
     * @param	start	开始读取的字节偏移量位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Uint8Array 对象。
     */
    getInt16Array(start, len) {
        let end = start + len;
        end = end > this._length ? this._length : end;
        let v = new Int16Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    /**
     * 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
     * @return 单精度（32 位）浮点数。
     */
    getFloat32() {
        if (this._pos_ + 4 > this._length)
            throw "getFloat32 error - Out of bounds";
        let v = this._d_.getFloat32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }
    /**
     * 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
     * 同getFloat32()
     * @return 单精度（32 位）浮点数。
     */
    getFloat() {
        if (this._pos_ + 4 > this._length)
            throw "getFloat32 error - Out of bounds";
        let v = this._d_.getFloat32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
     * @return 双精度（64 位）浮点数。
     */
    getFloat64() {
        if (this._pos_ + 8 > this._length)
            throw "getFloat64 error - Out of bounds";
        let v = this._d_.getFloat64(this._pos_, this._xd_);
        this._pos_ += 8;
        return v;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
     * 同getFloat64()
     * @return 双精度（64 位）浮点数。
     */
    getDouble() {
        if (this._pos_ + 8 > this._length)
            throw "getFloat64 error - Out of bounds";
        let v = this._d_.getFloat64(this._pos_, this._xd_);
        this._pos_ += 8;
        return v;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
     * @param	value	单精度（32 位）浮点数。
     */
    writeFloat32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setFloat32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
     * 同writeFloat32()
     * @param	value	单精度（32 位）浮点数。
     */
    writeFloat(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setFloat32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
     * @param	value	双精度（64 位）浮点数。
     */
    writeFloat64(value) {
        this.ensureWrite(this._pos_ + 8);
        this._d_.setFloat64(this._pos_, value, this._xd_);
        this._pos_ += 8;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
     * 同writeFloat64()
     * @param	value	双精度（64 位）浮点数。
     */
    writeDouble(value) {
        this.ensureWrite(this._pos_ + 8);
        this._d_.setFloat64(this._pos_, value, this._xd_);
        this._pos_ += 8;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 Int32 值。
     * @return Int32 值。
     */
    getInt32() {
        if (this._pos_ + 4 > this._length)
            throw "getInt32 error - Out of bounds";
        let float = this._d_.getInt32(this._pos_, this._xd_);
        this._pos_ += 4;
        return float;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
     * @return Uint32 值。
     */
    getUint32() {
        if (this._pos_ + 4 > this._length)
            throw "getUint32 error - Out of bounds";
        let v = this._d_.getUint32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
     * @param	value	需要写入的 Int32 值。
     */
    writeInt32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setInt32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入 Uint32 值。
     * @param	value	需要写入的 Uint32 值。
     */
    writeUint32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setUint32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 Int16 值。
     * @return Int16 值。
     */
    getInt16() {
        if (this._pos_ + 2 > this._length)
            throw "getInt16 error - Out of bounds";
        let us = this._d_.getInt16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
     * @return Uint16 值。
     */
    getUint16() {
        if (this._pos_ + 2 > this._length)
            throw "getUint16 error - Out of bounds";
        let us = this._d_.getUint16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }
    /**
     * 获取一个int64
     *
     * @return {Int64}  Int64
     * @memberof Byte
     */
    getInt64() {
        let lo = 0;
        let hi = 0;
        const view = new Uint8Array(this._d_.buffer);
        let offset = this._pos_;
        if (this.endian == Byte.LITTLE_ENDIAN) {
            lo = view[offset + 2] << 16;
            lo |= view[offset + 1] << 8;
            lo |= view[offset];
            lo += (view[offset + 3] << 24) >>> 0;
            offset += 4;
            hi = view[offset + 2] << 16;
            hi |= view[offset + 1] << 8;
            hi |= view[offset];
            hi += (view[offset + 3] << 24) >>> 0;
        }
        else {
            hi = view[offset + 1] << 16;
            hi |= view[offset + 2] << 8;
            hi |= view[offset + 3];
            hi += (view[offset] << 24) >>> 0;
            offset += 4;
            lo = view[offset + 1] << 16;
            lo |= view[offset + 2] << 8;
            lo |= view[offset + 3];
            lo += (view[offset] << 24) >>> 0;
        }
        let value = new int64_1.Int64(lo, hi);
        this._pos_ += 8;
        return value;
    }
    /**
     * 写入Int64
     *
     * @param {Int64} value
     * @memberof Byte
     */
    writeInt64(value) {
        let offset = this._pos_;
        this.ensureWrite(offset + 8);
        let lo = value.getLowBits();
        let hi = value.getHighBits();
        let view = new Uint8Array(this._d_.buffer);
        if (this.endian == Byte.LITTLE_ENDIAN) {
            view[offset + 3] = (lo >>> 24) & 0xff;
            view[offset + 2] = (lo >>> 16) & 0xff;
            view[offset + 1] = (lo >>> 8) & 0xff;
            view[offset] = lo & 0xff;
            offset += 4;
            view[offset + 3] = (hi >>> 24) & 0xff;
            view[offset + 2] = (hi >>> 16) & 0xff;
            view[offset + 1] = (hi >>> 8) & 0xff;
            view[offset] = hi & 0xff;
        }
        else {
            view[offset] = (hi >>> 24) & 0xff;
            view[offset + 1] = (hi >>> 16) & 0xff;
            view[offset + 2] = (hi >>> 8) & 0xff;
            view[offset + 3] = hi & 0xff;
            offset += 4;
            view[offset] = (lo >>> 24) & 0xff;
            view[offset + 1] = (lo >>> 16) & 0xff;
            view[offset + 2] = (lo >>> 8) & 0xff;
            view[offset + 3] = lo & 0xff;
        }
        this._pos_ += 8;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
     * @param	value	需要写入的Uint16 值。
     */
    writeUint16(value) {
        this.ensureWrite(this._pos_ + 2);
        this._d_.setUint16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }
    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
     * @param	value	需要写入的 Int16 值。
     */
    writeInt16(value) {
        this.ensureWrite(this._pos_ + 2);
        this._d_.setInt16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }
    /**
     * 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
     * @return Uint8 值。
     */
    getUint8() {
        if (this._pos_ + 1 > this._length)
            throw "getUint8 error - Out of bounds";
        return this._d_.getUint8(this._pos_++);
    }
    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
     * @param	value	需要写入的 Uint8 值。
     */
    writeUint8(value) {
        this.ensureWrite(this._pos_ + 1);
        this._d_.setUint8(this._pos_, value);
        this._pos_++;
    }
    /**
     * @private
     * 从字节流的指定字节偏移量位置处读取一个 Uint8 值。
     * @param	pos	字节读取位置。
     * @return Uint8 值。
     */
    _getUInt8(pos) {
        return this._d_.getUint8(pos);
    }
    /**
     * @private
     * 从字节流的指定字节偏移量位置处读取一个 Uint16 值。
     * @param	pos	字节读取位置。
     * @return Uint16 值。
     */
    _getUint16(pos) {
        return this._d_.getUint16(pos, this._xd_);
    }
    /**
     * @private
     * 读取指定长度的 UTF 型字符串。
     * @param	len 需要读取的长度。
     * @return 读取的字符串。
     */
    rUTF(len) {
        let v = "", max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
        let u = this._u8d_;
        while (this._pos_ < max) {
            c = u[this._pos_++];
            if (c < 0x80) {
                if (c != 0) {
                    v += f(c);
                }
            }
            else if (c < 0xe0) {
                v += f(((c & 0x3f) << 6) | (u[this._pos_++] & 0x7f));
            }
            else if (c < 0xf0) {
                c2 = u[this._pos_++];
                v += f(((c & 0x1f) << 12) | ((c2 & 0x7f) << 6) | (u[this._pos_++] & 0x7f));
            }
            else {
                c2 = u[this._pos_++];
                c3 = u[this._pos_++];
                v += f(((c & 0x0f) << 18) | ((c2 & 0x7f) << 12) | ((c3 << 6) & 0x7f) | (u[this._pos_++] & 0x7f));
            }
        }
        return v;
    }
    // River: 自定义的字符串读取,项目相关的内容
    /**
     * @private
     * 读取 <code>len</code> 参数指定的长度的字符串。
     * @param	len	要读取的字符串的长度。
     * @return 指定长度的字符串。
     */
    getCustomString(len) {
        let v = "", ulen = 0, c, c2, f = String.fromCharCode;
        let u = this._u8d_;
        while (len > 0) {
            c = u[this._pos_];
            if (c < 0x80) {
                v += f(c);
                this._pos_++;
                len--;
            }
            else {
                ulen = c - 0x80;
                this._pos_++;
                len -= ulen;
                while (ulen > 0) {
                    c = u[this._pos_++];
                    c2 = u[this._pos_++];
                    v += f((c2 << 8) | c);
                    ulen--;
                }
            }
        }
        return v;
    }
    /**
     * 移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
     */
    get pos() {
        return this._pos_;
    }
    set pos(value) {
        this._pos_ = value;
    }
    /**
     * 可从字节流的当前位置到末尾读取的数据的字节数。
     */
    get bytesAvailable() {
        return this._length - this._pos_;
    }
    /**
     * 清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
     */
    clear() {
        this._pos_ = 0;
        this.length = 0;
    }
    /**
     * @private
     * 获取此对象的 ArrayBuffer 引用。
     * @return
     */
    __getBuffer() {
        // this._d_.buffer.byteLength = this.length;
        return this._d_.buffer;
    }
    /**
     * <p>将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的字为字符串添加前缀。</p>
     * <p>对应的读取方法为： getUTFBytes 。</p>
     * @param value 要写入的字符串。
     */
    writeUTFBytes(value) {
        // utf8-decode
        value = value + "";
        for (let i = 0, sz = value.length; i < sz; i++) {
            let c = value.charCodeAt(i);
            if (c <= 0x7f) {
                this.writeByte(c);
            }
            else if (c <= 0x7ff) {
                //优化为直接写入多个字节，而不必重复调用writeByte，免去额外的调用和逻辑开销。
                this.ensureWrite(this._pos_ + 2);
                this._u8d_.set([0xc0 | (c >> 6), 0x80 | (c & 0x3f)], this._pos_);
                this._pos_ += 2;
            }
            else if (c <= 0xffff) {
                this.ensureWrite(this._pos_ + 3);
                this._u8d_.set([0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)], this._pos_);
                this._pos_ += 3;
            }
            else {
                this.ensureWrite(this._pos_ + 4);
                this._u8d_.set([0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)], this._pos_);
                this._pos_ += 4;
            }
        }
    }
    /**
     * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
     * <p>对应的读取方法为： getUTFString 。</p>
     * @param	value 要写入的字符串值。
     */
    writeUTFString(value) {
        let tPos = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        let dPos = this.pos - tPos - 2;
        if (dPos >= 65536) {
            throw "writeUTFString byte len more than 65536";
        }
        this._d_.setUint16(tPos, dPos, this._xd_);
    }
    /**
     * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
     * <p>对应的读取方法为： getUTFString 。</p>
     * @param	value 要写入的字符串值。
     */
    writeUTF8String(value) {
        let tPos = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        let dPos = this.pos - tPos - 2;
        if (dPos >= 65536) {
            throw "writeUTFString byte len more than 65536";
        }
        this._d_.setUint16(tPos, dPos, this._xd_);
    }
    /**
     * @private
     * 读取 UTF-8 字符串。
     * @return 读取的字符串。
     */
    readUTFString() {
        return this.readUTFBytes(this.getUint16());
    }
    /**
     * @private
     * 读取 UTF-8 字符串。
     * @return 读取的字符串。
     */
    readUTF8String() {
        return this.readUTFBytes(this.getUint16());
    }
    /**
     * @private
     * 读取 UTF-8 字符串。
     * @return 读取的字符串。
     */
    getUTF8String() {
        return this.readUTFBytes(this.getUint16());
    }
    /**
     * <p>从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。</p>
     * <p>对应的写入方法为： writeUTFString 。</p>
     * @return 读取的字符串。
     */
    getUTFString() {
        return this.readUTFString();
    }
    /**
     * @private
     * 读字符串，必须是 writeUTFBytes 方法写入的字符串。
     * @param len	要读的buffer长度，默认将读取缓冲区全部数据。
     * @return 读取的字符串。
     */
    readUTFBytes(len = -1) {
        if (len == 0)
            return "";
        let lastBytes = this.bytesAvailable;
        if (len > lastBytes)
            throw "readUTFBytes error - Out of bounds";
        len = len > 0 ? len : lastBytes;
        return this.rUTF(len);
    }
    /**
     * <p>从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。</p>
     * <p>一般读取的是由 writeUTFBytes 方法写入的字符串。</p>
     * @param len	要读的buffer长度，默认将读取缓冲区全部数据。
     * @return 读取的字符串。
     */
    getUTFBytes(len = -1) {
        return this.readUTFBytes(len);
    }
    /**
     * <p>在字节流中写入一个字节。</p>
     * <p>使用参数的低 8 位。忽略高 24 位。</p>
     * @param	value
     */
    writeByte(value) {
        this.ensureWrite(this._pos_ + 1);
        this._d_.setInt8(this._pos_, value);
        this._pos_ += 1;
    }
    /**
     * @private
     * 从字节流中读取带符号的字节。
     */
    readByte() {
        if (this._pos_ + 1 > this._length)
            throw "readByte error - Out of bounds";
        return this._d_.getInt8(this._pos_++);
    }
    /**
     * <p>从字节流中读取带符号的字节。</p>
     * <p>返回值的范围是从 -128 到 127。</p>
     * @return 介于 -128 和 127 之间的整数。
     */
    getByte() {
        return this.readByte();
    }
    /**
     * <p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
     * @param	lengthToEnsure	指定的长度。
     */
    ensureWrite(lengthToEnsure) {
        if (this._length < lengthToEnsure)
            this._length = lengthToEnsure;
        if (this._allocated_ < lengthToEnsure)
            this.length = lengthToEnsure;
    }
    /**
     * <p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
     * <p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
     * <p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
     * $NEXTBIG 由于没有判断length和arraybuffer的合法性，当开发者填写了错误的length值时，会导致写入多余的空白数据甚至内存溢出，为了避免影响开发者正在使用此方法的功能，下个重大版本会修复这些问题。
     * @param	arraybuffer	需要写入的 Arraybuffer 对象。
     * @param	offset		Arraybuffer 对象的索引的偏移量（以字节为单位）
     * @param	length		从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
     */
    writeArrayBuffer(arraybuffer, offset = 0, length = 0) {
        if (offset < 0 || length < 0)
            throw "writeArrayBuffer error - Out of bounds";
        if (length == 0)
            length = arraybuffer.byteLength - offset;
        //$ALERT 这里会分配用户指定的内存空间，这可能导致分配多余的内存空间，甚至导致内存溢出。应该进行有效性检查。如果用户想要分配多余的空间，应该使用set length。
        this.ensureWrite(this._pos_ + length);
        let uint8array = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
    /**
     * <p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
     * <p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
     * <p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
     * $NEXTBIG 由于没有判断length和arraybuffer的合法性，当开发者填写了错误的length值时，会导致写入多余的空白数据甚至内存溢出，为了避免影响开发者正在使用此方法的功能，下个重大版本会修复这些问题。
     * @param	arraybuffer	需要写入的 Arraybuffer 对象。
     * @param	offset		Arraybuffer 对象的索引的偏移量（以字节为单位）
     * @param	length		从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
     */
    writeBytes(arraybuffer, offset = 0, length = 0) {
        if (offset < 0 || length < 0)
            throw "writeArrayBuffer error - Out of bounds";
        if (length == 0)
            length = arraybuffer.byteLength - offset;
        //$ALERT 这里会分配用户指定的内存空间，这可能导致分配多余的内存空间，甚至导致内存溢出。应该进行有效性检查。如果用户想要分配多余的空间，应该使用set length。
        this.ensureWrite(this._pos_ + length);
        let uint8array = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
}
exports.Byte = Byte;
/**
 * 大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
 *
 * @static
 * @type {string}
 * @memberof Byte
 */
Byte.BIG_ENDIAN = "bigEndian";
/**
 * 小端字节序，地址低位存储值的低位，地址高位存储值的高位
 *
 * @static
 * @type {string}
 * @memberof Byte
 */
Byte.LITTLE_ENDIAN = "littleEndian";
Byte._sysEndian = void 0;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnl0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9jb21waWxlci9ieXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFnQztBQUdoQzs7Ozs7R0FLRztBQUNILE1BQWEsSUFBSTtJQXlDYjs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsZUFBZTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25CLElBQUksTUFBTSxHQUFRLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQy9GLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBbUIsT0FBOEIsS0FBSyxDQUFDO1FBNUN2RDs7Ozs7O1dBTUc7UUFDTyxTQUFJLEdBQVksSUFBSSxDQUFDO1FBQ3ZCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBVXRCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQTBCMUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFP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QyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzlDLElBQUksQ0FBQyxHQUFpQixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsS0FBYSxFQUFFLEdBQVc7UUFDM0MsSUFBSSxHQUFHLEdBQVcsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBZSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsS0FBYSxFQUFFLEdBQVc7UUFDM0MsSUFBSSxHQUFHLEdBQVcsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBZSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixD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QUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFdBQVcsQ0FBQyxLQUFhO1FBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFVBQVUsQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFFBQVE7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztRQUMxRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksU0FBUyxDQUFDLEdBQVc7UUFDeEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxVQUFVLENBQUMsR0FBVztRQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssSUFBSSxDQUFDLEdBQVc7UUFDcEIsSUFBSSxDQUFDLEdBQVcsRUFBRSxFQUNkLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFDOUIsQ0FBUyxFQUNULEVBQVUsRUFDVixFQUFVLEVBQ1YsQ0FBQyxHQUFhLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDdEMsSUFBSSxDQUFDLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDVCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDO2lCQUFNLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUNsQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6RCxDQUFDO2lCQUFNLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUNsQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUM7aUJBQU0sQ0FBQztnQkFDSixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckcsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCwyQkFB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QUcsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDO1lBQUUsTUFBTSx3Q0FBd0MsQ0FBQztRQUM3RSxJQUFJLE1BQU0sSUFBSSxDQUFDO1lBQUUsTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzFELHVGQUF1RjtRQUN2RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxVQUFVLEdBQWUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQztJQUN6QixDQUFDOztBQWp3Qkwsb0JBa3dCQztBQWp3Qkc7Ozs7OztHQU1HO0FBQ1csZUFBVSxHQUFXLFdBQVcsQUFBdEIsQ0FBdUI7QUFFL0M7Ozs7OztHQU1HO0FBQ1csa0JBQWEsR0FBVyxjQUFjLEFBQXpCLENBQTBCO0FBc0J0QyxlQUFVLEdBQXFCLEtBQUssQ0FBQyxBQUEzQixDQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEludDY0IH0gZnJvbSBcIi4vaW50NjRcIjtcclxuXHJcbnR5cGUgTnVsbGFibGU8VD4gPSBUIHwgdW5kZWZpbmVkIHwgbnVsbDtcclxuLyoqXHJcbiAqIOexu+aPkOS+m+eUqOS6juS8mOWMluivu+WPluOAgeWGmeWFpeS7peWPiuWkhOeQhuS6jOi/m+WItuaVsOaNrueahOaWueazleWSjOWxnuaAp1xyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEBjbGFzcyBCeXRlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnl0ZSB7XHJcbiAgICAvKipcclxuICAgICAqIOWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAglxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIEJJR19FTkRJQU46IHN0cmluZyA9IFwiYmlnRW5kaWFuXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsI/nq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTkvY7kvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTpq5jkvY1cclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIEJ5dGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBMSVRUTEVfRU5ESUFOOiBzdHJpbmcgPSBcImxpdHRsZUVuZGlhblwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5Li65bCP56uv5pWw5o2uXHJcbiAgICAgKlxyXG4gICAgICogQHByb3RlY3RlZFxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3hkXzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9hbGxvY2F0ZWRfOiBudW1iZXIgPSA4O1xyXG4gICAgLyoqXHJcbiAgICAgKiDljp/lp4vmlbDmja5cclxuICAgICAqXHJcbiAgICAgKiBAcHJvdGVjdGVkXHJcbiAgICAgKiBAdHlwZSB7Kn1cclxuICAgICAqIEBtZW1iZXJvZiBCeXRlXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZF8hOiBEYXRhVmlldztcclxuICAgIHByb3RlY3RlZCBfdThkXyE6IFVpbnQ4QXJyYXk7XHJcbiAgICBwcm90ZWN0ZWQgX3Bvc186IG51bWJlciA9IDA7XHJcbiAgICBwcm90ZWN0ZWQgX2xlbmd0aDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgc3RhdGljIF9zeXNFbmRpYW46IE51bGxhYmxlPHN0cmluZz4gPSB2b2lkIDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiA8cD7ojrflj5blvZPliY3kuLvmnLrnmoTlrZfoioLluo/jgII8L3A+XHJcbiAgICAgKiA8cD7kuLvmnLrlrZfoioLluo/vvIzmmK8gQ1BVIOWtmOaUvuaVsOaNrueahOS4pOenjeS4jeWQjOmhuuW6j++8jOWMheaLrOWwj+err+Wtl+iKguW6j+WSjOWkp+err+Wtl+iKguW6j+OAgjwvcD5cclxuICAgICAqIDxwPiA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDvvJrlpKfnq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTpq5jkvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTkvY7kvY3jgILmnInml7bkuZ/np7DkuYvkuLrnvZHnu5zlrZfoioLluo/jgII8YnIvPlxyXG4gICAgICogIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cclxuICAgICAqIEByZXR1cm4g5b2T5YmN57O757uf55qE5a2X6IqC5bqP44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U3lzdGVtRW5kaWFuKCk6IFN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zeXNFbmRpYW4pIHtcclxuICAgICAgICAgICAgbGV0IGJ1ZmZlcjogYW55ID0gbmV3IEFycmF5QnVmZmVyKDIpO1xyXG4gICAgICAgICAgICBuZXcgRGF0YVZpZXcoYnVmZmVyKS5zZXRJbnQxNigwLCAyNTYsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLl9zeXNFbmRpYW4gPSBuZXcgSW50MTZBcnJheShidWZmZXIpWzBdID09PSAyNTYgPyBCeXRlLkxJVFRMRV9FTkRJQU4gOiBCeXRlLkJJR19FTkRJQU47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zeXNFbmRpYW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rkuIDkuKogPGNvZGU+Qnl0ZTwvY29kZT4g57G755qE5a6e5L6L44CCXHJcbiAgICAgKiBAcGFyYW1cdGRhdGFcdOeUqOS6juaMh+WumuWIneWni+WMlueahOWFg+e0oOaVsOebru+8jOaIluiAheeUqOS6juWIneWni+WMlueahFR5cGVkQXJyYXnlr7nosaHjgIFBcnJheUJ1ZmZlcuWvueixoeOAglxyXG4gICAgICog5aaC5p6c5Li6IG51bGwg77yM5YiZ6aKE5YiG6YWN5LiA5a6a55qE5YaF5a2Y56m66Ze077yMXHJcbiAgICAgKiDlvZPlj6/nlKjnqbrpl7TkuI3otrPml7bvvIzkvJjlhYjkvb/nlKjov5npg6jliIblhoXlrZjvvIzlpoLmnpzov5jkuI3lpJ/vvIzliJnph43mlrDliIbphY3miYDpnIDlhoXlrZjjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGRhdGE6IE51bGxhYmxlPEFycmF5QnVmZmVyPiA9IHZvaWQgMCkge1xyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3U4ZF8gPSBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5fZF8gPSBuZXcgRGF0YVZpZXcodGhpcy5fdThkXy5idWZmZXIpO1xyXG4gICAgICAgICAgICB0aGlzLl9sZW5ndGggPSB0aGlzLl9kXy5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX19fcmVzaXplQnVmZmVyKHRoaXMuX2FsbG9jYXRlZF8pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluatpOWvueixoeeahCBBcnJheUJ1ZmZlciDmlbDmja7vvIzmlbDmja7lj6rljIXlkKvmnInmlYjmlbDmja7pg6jliIbjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBidWZmZXIoKTogQXJyYXlCdWZmZXIge1xyXG4gICAgICAgIGxldCByc3RCdWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5fZF8uYnVmZmVyO1xyXG4gICAgICAgIGlmIChyc3RCdWZmZXIuYnl0ZUxlbmd0aCA9PSB0aGlzLmxlbmd0aCkgcmV0dXJuIHJzdEJ1ZmZlcjtcclxuICAgICAgICByZXR1cm4gcnN0QnVmZmVyLnNsaWNlKDAsIHRoaXMubGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPiA8Y29kZT5CeXRlPC9jb2RlPiDlrp7kvovnmoTlrZfoioLluo/jgILlj5blgLzkuLrvvJo8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDmiJYgPGNvZGU+TElUVExFX0VORElBTjwvY29kZT4g44CCPC9wPlxyXG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgILpgJrov4cgPGNvZGU+Z2V0U3lzdGVtRW5kaWFuPC9jb2RlPiDlj6/ku6Xojrflj5blvZPliY3ns7vnu5/nmoTlrZfoioLluo/jgII8L3A+XHJcbiAgICAgKiA8cD4gPGNvZGU+QklHX0VORElBTjwvY29kZT4g77ya5aSn56uv5a2X6IqC5bqP77yM5Zyw5Z2A5L2O5L2N5a2Y5YKo5YC855qE6auY5L2N77yM5Zyw5Z2A6auY5L2N5a2Y5YKo5YC855qE5L2O5L2N44CC5pyJ5pe25Lmf56ew5LmL5Li6572R57uc5a2X6IqC5bqP44CCPGJyLz5cclxuICAgICAqICA8Y29kZT5MSVRUTEVfRU5ESUFOPC9jb2RlPiDvvJrlsI/nq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTkvY7kvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTpq5jkvY3jgII8L3A+XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZW5kaWFuKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3hkXyA/IEJ5dGUuTElUVExFX0VORElBTiA6IEJ5dGUuQklHX0VORElBTjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGVuZGlhbihlbmRpYW5TdHI6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3hkXyA9IGVuZGlhblN0ciA9PSBCeXRlLkxJVFRMRV9FTkRJQU47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiA8cD4gPGNvZGU+Qnl0ZTwvY29kZT4g5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCPC9wPlxyXG4gICAgICogPHA+5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65aSn5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5YiZ55So6Zu25aGr5YWF5a2X6IqC5pWw57uE55qE5Y+z5L6n77yb5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65bCP5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5bCG5Lya5oiq5pat6K+l5a2X6IqC5pWw57uE44CCPC9wPlxyXG4gICAgICogPHA+5aaC5p6c6KaB6K6+572u55qE6ZW/5bqm5aSn5LqO5b2T5YmN5bey5YiG6YWN55qE5YaF5a2Y56m66Ze055qE5a2X6IqC6ZW/5bqm77yM5YiZ6YeN5paw5YiG6YWN5YaF5a2Y56m66Ze077yM5aSn5bCP5Li65Lul5LiL5Lik6ICF6L6D5aSn6ICF77ya6KaB6K6+572u55qE6ZW/5bqm44CB5b2T5YmN5bey5YiG6YWN55qE6ZW/5bqm55qEMuWAje+8jOW5tuWwhuWOn+acieaVsOaNruaLt+i0neWIsOaWsOeahOWGheWtmOepuumXtOS4re+8m+WmguaenOimgeiuvue9rueahOmVv+W6puWwj+S6juW9k+WJjeW3suWIhumFjeeahOWGheWtmOepuumXtOeahOWtl+iKgumVv+W6pu+8jOS5n+S8mumHjeaWsOWIhumFjeWGheWtmOepuumXtO+8jOWkp+Wwj+S4uuimgeiuvue9rueahOmVv+W6pu+8jOW5tuWwhuWOn+acieaVsOaNruS7juWktOaIquaWreS4uuimgeiuvue9rueahOmVv+W6puWtmOWFpeaWsOeahOWGheWtmOepuumXtOS4reOAgjwvcD5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9hbGxvY2F0ZWRfIDwgdmFsdWUpXHJcbiAgICAgICAgICAgIHRoaXMuX19fcmVzaXplQnVmZmVyKCh0aGlzLl9hbGxvY2F0ZWRfID0gTWF0aC5mbG9vcihNYXRoLm1heCh2YWx1ZSwgdGhpcy5fYWxsb2NhdGVkXyAqIDIpKSkpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2FsbG9jYXRlZF8gPiB2YWx1ZSkgdGhpcy5fX19yZXNpemVCdWZmZXIoKHRoaXMuX2FsbG9jYXRlZF8gPSB2YWx1ZSkpO1xyXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQHByaXZhdGUgKi9cclxuICAgIHByaXZhdGUgX19fcmVzaXplQnVmZmVyKGxlbjogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IG5ld0J5dGVWaWV3OiBhbnkgPSBuZXcgVWludDhBcnJheShsZW4pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdThkXyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdThkXy5sZW5ndGggPD0gbGVuKSBuZXdCeXRlVmlldy5zZXQodGhpcy5fdThkXyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIG5ld0J5dGVWaWV3LnNldCh0aGlzLl91OGRfLnN1YmFycmF5KDAsIGxlbikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3U4ZF8gPSBuZXdCeXRlVmlldztcclxuICAgICAgICAgICAgdGhpcy5fZF8gPSBuZXcgRGF0YVZpZXcobmV3Qnl0ZVZpZXcuYnVmZmVyKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJfX19yZXNpemVCdWZmZXIgZXJyOlwiICsgbGVuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPuW4uOeUqOS6juino+aekOWbuuWumuagvOW8j+eahOWtl+iKgua1geOAgjwvcD5cclxuICAgICAqIDxwPuWFiOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+S9jee9ruWkhOivu+WPluS4gOS4qiA8Y29kZT5VaW50MzI8L2NvZGU+IOWAvO+8jOeEtuWQjuS7peatpOWAvOS4uumVv+W6pu+8jOivu+WPluatpOmVv+W6pueahOWtl+espuS4suOAgjwvcD5cclxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yVVRGKHRoaXMuZ2V0VWludDMyKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vTElUVExFX0VORElBTiBvbmx5IG5vdztcclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+RmxvYXQzMkFycmF5PC9jb2RlPiDlr7nosaHlubbov5Tlm57mraTlr7nosaHjgIJcclxuICAgICAqIEBwYXJhbVx0c3RhcnRcdOW8gOWni+S9jee9ruOAglxyXG4gICAgICogQHBhcmFtXHRsZW5cdFx06ZyA6KaB6K+75Y+W55qE5a2X6IqC6ZW/5bqm44CC5aaC5p6c6KaB6K+75Y+W55qE6ZW/5bqm6LaF6L+H5Y+v6K+75Y+W6IyD5Zu077yM5YiZ5Y+q6L+U5Zue5Y+v6K+76IyD5Zu05YaF55qE5YC844CCXHJcbiAgICAgKiBAcmV0dXJuICDor7vlj5bnmoQgRmxvYXQzMkFycmF5IOWvueixoeOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RmxvYXQzMkFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogYW55IHtcclxuICAgICAgICBsZXQgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcclxuICAgICAgICBlbmQgPSBlbmQgPiB0aGlzLl9sZW5ndGggPyB0aGlzLl9sZW5ndGggOiBlbmQ7XHJcbiAgICAgICAgbGV0IHY6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fZF8uYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpKTtcclxuICAgICAgICB0aGlzLl9wb3NfID0gZW5kO1xyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+VWludDhBcnJheTwvY29kZT4g5a+56LGh5bm26L+U5Zue5q2k5a+56LGh44CCXHJcbiAgICAgKiBAcGFyYW1cdHN0YXJ0XHTlvIDlp4vkvY3nva7jgIJcclxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxyXG4gICAgICogQHJldHVybiAg6K+75Y+W55qEIFVpbnQ4QXJyYXkg5a+56LGh44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRVaW50OEFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XHJcbiAgICAgICAgbGV0IGVuZDogbnVtYmVyID0gc3RhcnQgKyBsZW47XHJcbiAgICAgICAgZW5kID0gZW5kID4gdGhpcy5fbGVuZ3RoID8gdGhpcy5fbGVuZ3RoIDogZW5kO1xyXG4gICAgICAgIGxldCB2OiBVaW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5fZF8uYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpKTtcclxuICAgICAgICB0aGlzLl9wb3NfID0gZW5kO1xyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+SW50MTZBcnJheTwvY29kZT4g5a+56LGh5bm26L+U5Zue5q2k5a+56LGh44CCXHJcbiAgICAgKiBAcGFyYW1cdHN0YXJ0XHTlvIDlp4vor7vlj5bnmoTlrZfoioLlgY/np7vph4/kvY3nva7jgIJcclxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxyXG4gICAgICogQHJldHVybiAg6K+75Y+W55qEIFVpbnQ4QXJyYXkg5a+56LGh44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbnQxNkFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogYW55IHtcclxuICAgICAgICBsZXQgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcclxuICAgICAgICBlbmQgPSBlbmQgPiB0aGlzLl9sZW5ndGggPyB0aGlzLl9sZW5ndGggOiBlbmQ7XHJcbiAgICAgICAgbGV0IHY6IEludDE2QXJyYXkgPSBuZXcgSW50MTZBcnJheSh0aGlzLl9kXy5idWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCkpO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gPSBlbmQ7XHJcbiAgICAgICAgcmV0dXJuIHY7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vkvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXHJcbiAgICAgKiBAcmV0dXJuIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RmxvYXQzMigpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgNCA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRGbG9hdDMyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xyXG4gICAgICAgIGxldCB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e75L2N572u5aSE6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICog5ZCMZ2V0RmxvYXQzMigpXHJcbiAgICAgKiBAcmV0dXJuIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RmxvYXQoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQzMiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICBsZXQgdjogbnVtYmVyID0gdGhpcy5fZF8uZ2V0RmxvYXQzMih0aGlzLl9wb3NfLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcclxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRGbG9hdDY0KCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA4ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEZsb2F0NjQgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XHJcbiAgICAgICAgbGV0IHY6IG51bWJlciA9IHRoaXMuX2RfLmdldEZsb2F0NjQodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcclxuICAgICAgICB0aGlzLl9wb3NfICs9IDg7XHJcbiAgICAgICAgcmV0dXJuIHY7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXHJcbiAgICAgKiDlkIxnZXRGbG9hdDY0KClcclxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXREb3VibGUoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDggPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQ2NCBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICBsZXQgdjogbnVtYmVyID0gdGhpcy5fZF8uZ2V0RmxvYXQ2NCh0aGlzLl9wb3NfLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcclxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVGbG9hdDMyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcclxuICAgICAgICB0aGlzLl9kXy5zZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcclxuICAgICAqIOWQjHdyaXRlRmxvYXQzMigpXHJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdyaXRlRmxvYXQodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xyXG4gICAgICAgIHRoaXMuX2RfLnNldEZsb2F0MzIodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICogQHBhcmFtXHR2YWx1ZVx05Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZUZsb2F0NjQodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDgpO1xyXG4gICAgICAgIHRoaXMuX2RfLnNldEZsb2F0NjQodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICog5ZCMd3JpdGVGbG9hdDY0KClcclxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVEb3VibGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDgpO1xyXG4gICAgICAgIHRoaXMuX2RfLnNldEZsb2F0NjQodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIEludDMyIOWAvOOAglxyXG4gICAgICogQHJldHVybiBJbnQzMiDlgLzjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEludDMyKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEludDMyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xyXG4gICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gdGhpcy5fZF8uZ2V0SW50MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcclxuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XHJcbiAgICAgICAgcmV0dXJuIGZsb2F0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQzMiDlgLzjgIJcclxuICAgICAqIEByZXR1cm4gVWludDMyIOWAvOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0VWludDMyKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldFVpbnQzMiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICBsZXQgdjogbnVtYmVyID0gdGhpcy5fZF8uZ2V0VWludDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5oyH5a6a55qEIEludDMyIOWAvOOAglxyXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEIEludDMyIOWAvOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVJbnQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50MzIodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWlIFVpbnQzMiDlgLzjgIJcclxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBVaW50MzIg5YC844CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZVVpbnQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBJbnQxNiDlgLzjgIJcclxuICAgICAqIEByZXR1cm4gSW50MTYg5YC844CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbnQxNigpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMiA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRJbnQxNiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICBsZXQgdXM6IG51bWJlciA9IHRoaXMuX2RfLmdldEludDE2KHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xyXG4gICAgICAgIHJldHVybiB1cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50MTYg5YC844CCXHJcbiAgICAgKiBAcmV0dXJuIFVpbnQxNiDlgLzjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFVpbnQxNigpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMiA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50MTYgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XHJcbiAgICAgICAgbGV0IHVzOiBudW1iZXIgPSB0aGlzLl9kXy5nZXRVaW50MTYodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcclxuICAgICAgICB0aGlzLl9wb3NfICs9IDI7XHJcbiAgICAgICAgcmV0dXJuIHVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5LiA5LiqaW50NjRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtJbnQ2NH0gIEludDY0XHJcbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SW50NjQoKTogSW50NjQge1xyXG4gICAgICAgIGxldCBsbyA9IDA7XHJcbiAgICAgICAgbGV0IGhpID0gMDtcclxuICAgICAgICBjb25zdCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5fZF8uYnVmZmVyKTtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5fcG9zXztcclxuICAgICAgICBpZiAodGhpcy5lbmRpYW4gPT0gQnl0ZS5MSVRUTEVfRU5ESUFOKSB7XHJcbiAgICAgICAgICAgIGxvID0gdmlld1tvZmZzZXQgKyAyXSA8PCAxNjtcclxuICAgICAgICAgICAgbG8gfD0gdmlld1tvZmZzZXQgKyAxXSA8PCA4O1xyXG4gICAgICAgICAgICBsbyB8PSB2aWV3W29mZnNldF07XHJcbiAgICAgICAgICAgIGxvICs9ICh2aWV3W29mZnNldCArIDNdIDw8IDI0KSA+Pj4gMDtcclxuICAgICAgICAgICAgb2Zmc2V0ICs9IDQ7XHJcbiAgICAgICAgICAgIGhpID0gdmlld1tvZmZzZXQgKyAyXSA8PCAxNjtcclxuICAgICAgICAgICAgaGkgfD0gdmlld1tvZmZzZXQgKyAxXSA8PCA4O1xyXG4gICAgICAgICAgICBoaSB8PSB2aWV3W29mZnNldF07XHJcbiAgICAgICAgICAgIGhpICs9ICh2aWV3W29mZnNldCArIDNdIDw8IDI0KSA+Pj4gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaSA9IHZpZXdbb2Zmc2V0ICsgMV0gPDwgMTY7XHJcbiAgICAgICAgICAgIGhpIHw9IHZpZXdbb2Zmc2V0ICsgMl0gPDwgODtcclxuICAgICAgICAgICAgaGkgfD0gdmlld1tvZmZzZXQgKyAzXTtcclxuICAgICAgICAgICAgaGkgKz0gKHZpZXdbb2Zmc2V0XSA8PCAyNCkgPj4+IDA7XHJcbiAgICAgICAgICAgIG9mZnNldCArPSA0O1xyXG4gICAgICAgICAgICBsbyA9IHZpZXdbb2Zmc2V0ICsgMV0gPDwgMTY7XHJcbiAgICAgICAgICAgIGxvIHw9IHZpZXdbb2Zmc2V0ICsgMl0gPDwgODtcclxuICAgICAgICAgICAgbG8gfD0gdmlld1tvZmZzZXQgKyAzXTtcclxuICAgICAgICAgICAgbG8gKz0gKHZpZXdbb2Zmc2V0XSA8PCAyNCkgPj4+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2YWx1ZSA9IG5ldyBJbnQ2NChsbywgaGkpO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhpnlhaVJbnQ2NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SW50NjR9IHZhbHVlXHJcbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVJbnQ2NCh2YWx1ZTogSW50NjQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5fcG9zXztcclxuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKG9mZnNldCArIDgpO1xyXG4gICAgICAgIGxldCBsbyA9IHZhbHVlLmdldExvd0JpdHMoKTtcclxuICAgICAgICBsZXQgaGkgPSB2YWx1ZS5nZXRIaWdoQml0cygpO1xyXG4gICAgICAgIGxldCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5fZF8uYnVmZmVyKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZW5kaWFuID09IEJ5dGUuTElUVExFX0VORElBTikge1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDNdID0gKGxvID4+PiAyNCkgJiAweGZmO1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDJdID0gKGxvID4+PiAxNikgJiAweGZmO1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDFdID0gKGxvID4+PiA4KSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0XSA9IGxvICYgMHhmZjtcclxuICAgICAgICAgICAgb2Zmc2V0ICs9IDQ7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgM10gPSAoaGkgPj4+IDI0KSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgMl0gPSAoaGkgPj4+IDE2KSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgMV0gPSAoaGkgPj4+IDgpICYgMHhmZjtcclxuICAgICAgICAgICAgdmlld1tvZmZzZXRdID0gaGkgJiAweGZmO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0XSA9IChoaSA+Pj4gMjQpICYgMHhmZjtcclxuICAgICAgICAgICAgdmlld1tvZmZzZXQgKyAxXSA9IChoaSA+Pj4gMTYpICYgMHhmZjtcclxuICAgICAgICAgICAgdmlld1tvZmZzZXQgKyAyXSA9IChoaSA+Pj4gOCkgJiAweGZmO1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDNdID0gaGkgJiAweGZmO1xyXG4gICAgICAgICAgICBvZmZzZXQgKz0gNDtcclxuICAgICAgICAgICAgdmlld1tvZmZzZXRdID0gKGxvID4+PiAyNCkgJiAweGZmO1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDFdID0gKGxvID4+PiAxNikgJiAweGZmO1xyXG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDJdID0gKGxvID4+PiA4KSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgM10gPSBsbyAmIDB4ZmY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBVaW50MTYg5YC844CCXHJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoRVaW50MTYg5YC844CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZVVpbnQxNih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMik7XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDE2KHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBJbnQxNiDlgLzjgIJcclxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBJbnQxNiDlgLzjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdyaXRlSW50MTYodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDIpO1xyXG4gICAgICAgIHRoaXMuX2RfLnNldEludDE2KHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xyXG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50OCDlgLzjgIJcclxuICAgICAqIEByZXR1cm4gVWludDgg5YC844CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRVaW50OCgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMSA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50OCBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZF8uZ2V0VWludDgodGhpcy5fcG9zXysrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBVaW50OCDlgLzjgIJcclxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBVaW50OCDlgLzjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdyaXRlVWludDgodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDEpO1xyXG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQ4KHRoaXMuX3Bvc18sIHZhbHVlKTtcclxuICAgICAgICB0aGlzLl9wb3NfKys7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog5LuO5a2X6IqC5rWB55qE5oyH5a6a5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQ4IOWAvOOAglxyXG4gICAgICogQHBhcmFtXHRwb3NcdOWtl+iKguivu+WPluS9jee9ruOAglxyXG4gICAgICogQHJldHVybiBVaW50OCDlgLzjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIF9nZXRVSW50OChwb3M6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmdldFVpbnQ4KHBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog5LuO5a2X6IqC5rWB55qE5oyH5a6a5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQxNiDlgLzjgIJcclxuICAgICAqIEBwYXJhbVx0cG9zXHTlrZfoioLor7vlj5bkvY3nva7jgIJcclxuICAgICAqIEByZXR1cm4gVWludDE2IOWAvOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgX2dldFVpbnQxNihwb3M6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmdldFVpbnQxNihwb3MsIHRoaXMuX3hkXyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog6K+75Y+W5oyH5a6a6ZW/5bqm55qEIFVURiDlnovlrZfnrKbkuLLjgIJcclxuICAgICAqIEBwYXJhbVx0bGVuIOmcgOimgeivu+WPlueahOmVv+W6puOAglxyXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByVVRGKGxlbjogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdjogc3RyaW5nID0gXCJcIixcclxuICAgICAgICAgICAgbWF4OiBudW1iZXIgPSB0aGlzLl9wb3NfICsgbGVuLFxyXG4gICAgICAgICAgICBjOiBudW1iZXIsXHJcbiAgICAgICAgICAgIGMyOiBudW1iZXIsXHJcbiAgICAgICAgICAgIGMzOiBudW1iZXIsXHJcbiAgICAgICAgICAgIGY6IEZ1bmN0aW9uID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcclxuICAgICAgICBsZXQgdTogYW55ID0gdGhpcy5fdThkXztcclxuICAgICAgICB3aGlsZSAodGhpcy5fcG9zXyA8IG1heCkge1xyXG4gICAgICAgICAgICBjID0gdVt0aGlzLl9wb3NfKytdO1xyXG4gICAgICAgICAgICBpZiAoYyA8IDB4ODApIHtcclxuICAgICAgICAgICAgICAgIGlmIChjICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2ICs9IGYoYyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8IDB4ZTApIHtcclxuICAgICAgICAgICAgICAgIHYgKz0gZigoKGMgJiAweDNmKSA8PCA2KSB8ICh1W3RoaXMuX3Bvc18rK10gJiAweDdmKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8IDB4ZjApIHtcclxuICAgICAgICAgICAgICAgIGMyID0gdVt0aGlzLl9wb3NfKytdO1xyXG4gICAgICAgICAgICAgICAgdiArPSBmKCgoYyAmIDB4MWYpIDw8IDEyKSB8ICgoYzIgJiAweDdmKSA8PCA2KSB8ICh1W3RoaXMuX3Bvc18rK10gJiAweDdmKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjMiA9IHVbdGhpcy5fcG9zXysrXTtcclxuICAgICAgICAgICAgICAgIGMzID0gdVt0aGlzLl9wb3NfKytdO1xyXG4gICAgICAgICAgICAgICAgdiArPSBmKCgoYyAmIDB4MGYpIDw8IDE4KSB8ICgoYzIgJiAweDdmKSA8PCAxMikgfCAoKGMzIDw8IDYpICYgMHg3ZikgfCAodVt0aGlzLl9wb3NfKytdICYgMHg3ZikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJpdmVyOiDoh6rlrprkuYnnmoTlrZfnrKbkuLLor7vlj5Ys6aG555uu55u45YWz55qE5YaF5a65XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiDor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTplb/luqbnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqIEBwYXJhbVx0bGVuXHTopoHor7vlj5bnmoTlrZfnrKbkuLLnmoTplb/luqbjgIJcclxuICAgICAqIEByZXR1cm4g5oyH5a6a6ZW/5bqm55qE5a2X56ym5Liy44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDdXN0b21TdHJpbmcobGVuOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCB2OiBzdHJpbmcgPSBcIlwiLFxyXG4gICAgICAgICAgICB1bGVuOiBudW1iZXIgPSAwLFxyXG4gICAgICAgICAgICBjOiBudW1iZXIsXHJcbiAgICAgICAgICAgIGMyOiBudW1iZXIsXHJcbiAgICAgICAgICAgIGY6IEZ1bmN0aW9uID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcclxuICAgICAgICBsZXQgdTogYW55ID0gdGhpcy5fdThkXztcclxuICAgICAgICB3aGlsZSAobGVuID4gMCkge1xyXG4gICAgICAgICAgICBjID0gdVt0aGlzLl9wb3NfXTtcclxuICAgICAgICAgICAgaWYgKGMgPCAweDgwKSB7XHJcbiAgICAgICAgICAgICAgICB2ICs9IGYoYyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfKys7XHJcbiAgICAgICAgICAgICAgICBsZW4tLTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHVsZW4gPSBjIC0gMHg4MDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18rKztcclxuICAgICAgICAgICAgICAgIGxlbiAtPSB1bGVuO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHVsZW4gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYyA9IHVbdGhpcy5fcG9zXysrXTtcclxuICAgICAgICAgICAgICAgICAgICBjMiA9IHVbdGhpcy5fcG9zXysrXTtcclxuICAgICAgICAgICAgICAgICAgICB2ICs9IGYoKGMyIDw8IDgpIHwgYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdWxlbi0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+WKqOaIlui/lOWbniBCeXRlIOWvueixoeeahOivu+WGmeaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAguS4i+S4gOasoeiwg+eUqOivu+WPluaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+ivu+WPlu+8jOaIluiAheS4i+S4gOasoeiwg+eUqOWGmeWFpeaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+WGmeWFpeOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHBvcygpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NfO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcG9zKHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9wb3NfID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlj6/ku47lrZfoioLmtYHnmoTlvZPliY3kvY3nva7liLDmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBieXRlc0F2YWlsYWJsZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGggLSB0aGlzLl9wb3NfO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riF6Zmk5a2X6IqC5pWw57uE55qE5YaF5a6577yM5bm25bCGIGxlbmd0aCDlkowgcG9zIOWxnuaAp+mHjee9ruS4uiAw44CC6LCD55So5q2k5pa55rOV5bCG6YeK5pS+IEJ5dGUg5a6e5L6L5Y2g55So55qE5YaF5a2Y44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9wb3NfID0gMDtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog6I635Y+W5q2k5a+56LGh55qEIEFycmF5QnVmZmVyIOW8leeUqOOAglxyXG4gICAgICogQHJldHVyblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgX19nZXRCdWZmZXIoKTogQXJyYXlCdWZmZXIge1xyXG4gICAgICAgIC8vIHRoaXMuX2RfLmJ1ZmZlci5ieXRlTGVuZ3RoID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILnsbvkvLzkuo4gd3JpdGVVVEYoKSDmlrnms5XvvIzkvYYgd3JpdGVVVEZCeXRlcygpIOS4jeS9v+eUqCAxNiDkvY3plb/luqbnmoTlrZfkuLrlrZfnrKbkuLLmt7vliqDliY3nvIDjgII8L3A+XHJcbiAgICAgKiA8cD7lr7nlupTnmoTor7vlj5bmlrnms5XkuLrvvJogZ2V0VVRGQnl0ZXMg44CCPC9wPlxyXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVVVEZCeXRlcyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgLy8gdXRmOC1kZWNvZGVcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCJcIjtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBzejogbnVtYmVyID0gdmFsdWUubGVuZ3RoOyBpIDwgc3o7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYzogbnVtYmVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjIDw9IDB4N2YpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVCeXRlKGMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPD0gMHg3ZmYpIHtcclxuICAgICAgICAgICAgICAgIC8v5LyY5YyW5Li655u05o6l5YaZ5YWl5aSa5Liq5a2X6IqC77yM6ICM5LiN5b+F6YeN5aSN6LCD55Sod3JpdGVCeXRl77yM5YWN5Y676aKd5aSW55qE6LCD55So5ZKM6YC76L6R5byA6ZSA44CCXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3U4ZF8uc2V0KFsweGMwIHwgKGMgPj4gNiksIDB4ODAgfCAoYyAmIDB4M2YpXSwgdGhpcy5fcG9zXyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8PSAweGZmZmYpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdThkXy5zZXQoWzB4ZTAgfCAoYyA+PiAxMiksIDB4ODAgfCAoKGMgPj4gNikgJiAweDNmKSwgMHg4MCB8IChjICYgMHgzZildLCB0aGlzLl9wb3NfKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdThkXy5zZXQoXHJcbiAgICAgICAgICAgICAgICAgICAgWzB4ZjAgfCAoYyA+PiAxOCksIDB4ODAgfCAoKGMgPj4gMTIpICYgMHgzZiksIDB4ODAgfCAoKGMgPj4gNikgJiAweDNmKSwgMHg4MCB8IChjICYgMHgzZildLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18sXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogPHA+5bCGIFVURi04IOWtl+espuS4suWGmeWFpeWtl+iKgua1geOAguWFiOWGmeWFpeS7peWtl+iKguihqOekuueahCBVVEYtOCDlrZfnrKbkuLLplb/luqbvvIjkvZzkuLogMTYg5L2N5pW05pWw77yJ77yM54S25ZCO5YaZ5YWl6KGo56S65a2X56ym5Liy5a2X56ym55qE5a2X6IqC44CCPC9wPlxyXG4gICAgICogPHA+5a+55bqU55qE6K+75Y+W5pa55rOV5Li677yaIGdldFVURlN0cmluZyDjgII8L3A+XHJcbiAgICAgKiBAcGFyYW1cdHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvOOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVVVEZTdHJpbmcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxldCB0UG9zOiBudW1iZXIgPSB0aGlzLnBvcztcclxuICAgICAgICB0aGlzLndyaXRlVWludDE2KDEpO1xyXG4gICAgICAgIHRoaXMud3JpdGVVVEZCeXRlcyh2YWx1ZSk7XHJcbiAgICAgICAgbGV0IGRQb3M6IG51bWJlciA9IHRoaXMucG9zIC0gdFBvcyAtIDI7XHJcbiAgICAgICAgaWYgKGRQb3MgPj0gNjU1MzYpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJ3cml0ZVVURlN0cmluZyBieXRlIGxlbiBtb3JlIHRoYW4gNjU1MzZcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDE2KHRQb3MsIGRQb3MsIHRoaXMuX3hkXyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiA8cD7lsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioLjgII8L3A+XHJcbiAgICAgKiA8cD7lr7nlupTnmoTor7vlj5bmlrnms5XkuLrvvJogZ2V0VVRGU3RyaW5nIOOAgjwvcD5cclxuICAgICAqIEBwYXJhbVx0dmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC844CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZVVURjhTdHJpbmcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxldCB0UG9zOiBudW1iZXIgPSB0aGlzLnBvcztcclxuICAgICAgICB0aGlzLndyaXRlVWludDE2KDEpO1xyXG4gICAgICAgIHRoaXMud3JpdGVVVEZCeXRlcyh2YWx1ZSk7XHJcbiAgICAgICAgbGV0IGRQb3M6IG51bWJlciA9IHRoaXMucG9zIC0gdFBvcyAtIDI7XHJcbiAgICAgICAgaWYgKGRQb3MgPj0gNjU1MzYpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJ3cml0ZVVURlN0cmluZyBieXRlIGxlbiBtb3JlIHRoYW4gNjU1MzZcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDE2KHRQb3MsIGRQb3MsIHRoaXMuX3hkXyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog6K+75Y+WIFVURi04IOWtl+espuS4suOAglxyXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlYWRVVEZTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXModGhpcy5nZXRVaW50MTYoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICog6K+75Y+WIFVURi04IOWtl+espuS4suOAglxyXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlYWRVVEY4U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKHRoaXMuZ2V0VWludDE2KCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIOivu+WPliBVVEYtOCDlrZfnrKbkuLLjgIJcclxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRVVEY4U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKHRoaXMuZ2V0VWludDE2KCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogPHA+5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIFVURi04IOWtl+espuS4suOAguWBh+WumuWtl+espuS4sueahOWJjee8gOaYr+S4gOS4quaXoOespuWPt+eahOefreaVtOWei++8iOS7peatpOWtl+iKguihqOekuuimgeivu+WPlueahOmVv+W6pu+8ieOAgjwvcD5cclxuICAgICAqIDxwPuWvueW6lOeahOWGmeWFpeaWueazleS4uu+8miB3cml0ZVVURlN0cmluZyDjgII8L3A+XHJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0VVRGU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURlN0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIOivu+Wtl+espuS4su+8jOW/hemhu+aYryB3cml0ZVVURkJ5dGVzIOaWueazleWGmeWFpeeahOWtl+espuS4suOAglxyXG4gICAgICogQHBhcmFtIGxlblx06KaB6K+755qEYnVmZmVy6ZW/5bqm77yM6buY6K6k5bCG6K+75Y+W57yT5Yay5Yy65YWo6YOo5pWw5o2u44CCXHJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVhZFVURkJ5dGVzKGxlbjogbnVtYmVyID0gLTEpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChsZW4gPT0gMCkgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgbGV0IGxhc3RCeXRlczogbnVtYmVyID0gdGhpcy5ieXRlc0F2YWlsYWJsZTtcclxuICAgICAgICBpZiAobGVuID4gbGFzdEJ5dGVzKSB0aHJvdyBcInJlYWRVVEZCeXRlcyBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcclxuICAgICAgICBsZW4gPSBsZW4gPiAwID8gbGVuIDogbGFzdEJ5dGVzO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJVVEYobGVuKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPuS7juWtl+iKgua1geS4reivu+WPluS4gOS4queUsSBsZW5ndGgg5Y+C5pWw5oyH5a6a55qE6ZW/5bqm55qEIFVURi04IOWtl+iKguW6j+WIl++8jOW5tui/lOWbnuS4gOS4quWtl+espuS4suOAgjwvcD5cclxuICAgICAqIDxwPuS4gOiIrOivu+WPlueahOaYr+eUsSB3cml0ZVVURkJ5dGVzIOaWueazleWGmeWFpeeahOWtl+espuS4suOAgjwvcD5cclxuICAgICAqIEBwYXJhbSBsZW5cdOimgeivu+eahGJ1ZmZlcumVv+W6pu+8jOm7mOiupOWwhuivu+WPlue8k+WGsuWMuuWFqOmDqOaVsOaNruOAglxyXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFVURkJ5dGVzKGxlbjogbnVtYmVyID0gLTEpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRVVEZCeXRlcyhsZW4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogPHA+5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqC44CCPC9wPlxyXG4gICAgICogPHA+5L2/55So5Y+C5pWw55qE5L2OIDgg5L2N44CC5b+955Wl6auYIDI0IOS9jeOAgjwvcD5cclxuICAgICAqIEBwYXJhbVx0dmFsdWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdyaXRlQnl0ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMSk7XHJcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50OCh0aGlzLl9wb3NfLCB2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKguOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVhZEJ5dGUoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDEgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwicmVhZEJ5dGUgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmdldEludDgodGhpcy5fcG9zXysrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPuS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKguOAgjwvcD5cclxuICAgICAqIDxwPui/lOWbnuWAvOeahOiMg+WbtOaYr+S7jiAtMTI4IOWIsCAxMjfjgII8L3A+XHJcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMTI4IOWSjCAxMjcg5LmL6Ze055qE5pW05pWw44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRCeXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZEJ5dGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIDxwPuS/neivgeivpeWtl+iKgua1geeahOWPr+eUqOmVv+W6puS4jeWwj+S6jiA8Y29kZT5sZW5ndGhUb0Vuc3VyZTwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5YC844CCPC9wPlxyXG4gICAgICogQHBhcmFtXHRsZW5ndGhUb0Vuc3VyZVx05oyH5a6a55qE6ZW/5bqm44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBlbnN1cmVXcml0ZShsZW5ndGhUb0Vuc3VyZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCA8IGxlbmd0aFRvRW5zdXJlKSB0aGlzLl9sZW5ndGggPSBsZW5ndGhUb0Vuc3VyZTtcclxuICAgICAgICBpZiAodGhpcy5fYWxsb2NhdGVkXyA8IGxlbmd0aFRvRW5zdXJlKSB0aGlzLmxlbmd0aCA9IGxlbmd0aFRvRW5zdXJlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogPHA+5bCG5oyH5a6aIGFycmF5YnVmZmVyIOWvueixoeS4reeahOS7pSBvZmZzZXQg5Li66LW35aeL5YGP56e76YeP77yMIGxlbmd0aCDkuLrplb/luqbnmoTlrZfoioLluo/liJflhpnlhaXlrZfoioLmtYHjgII8L3A+XHJcbiAgICAgKiA8cD7lpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yM6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrvvJvlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMuuOAgjwvcD5cclxuICAgICAqIDxwPuWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDlsI/kuo4w77yM5pys5Ye95pWw5bCG5oqb5Ye65byC5bi444CCPC9wPlxyXG4gICAgICogJE5FWFRCSUcg55Sx5LqO5rKh5pyJ5Yik5patbGVuZ3Ro5ZKMYXJyYXlidWZmZXLnmoTlkIjms5XmgKfvvIzlvZPlvIDlj5HogIXloavlhpnkuobplJnor6/nmoRsZW5ndGjlgLzml7bvvIzkvJrlr7zoh7TlhpnlhaXlpJrkvZnnmoTnqbrnmb3mlbDmja7nlJroh7PlhoXlrZjmuqLlh7rvvIzkuLrkuobpgb/lhY3lvbHlk43lvIDlj5HogIXmraPlnKjkvb/nlKjmraTmlrnms5XnmoTlip/og73vvIzkuIvkuKrph43lpKfniYjmnKzkvJrkv67lpI3ov5nkupvpl67popjjgIJcclxuICAgICAqIEBwYXJhbVx0YXJyYXlidWZmZXJcdOmcgOimgeWGmeWFpeeahCBBcnJheWJ1ZmZlciDlr7nosaHjgIJcclxuICAgICAqIEBwYXJhbVx0b2Zmc2V0XHRcdEFycmF5YnVmZmVyIOWvueixoeeahOe0ouW8leeahOWBj+enu+mHj++8iOS7peWtl+iKguS4uuWNleS9je+8iVxyXG4gICAgICogQHBhcmFtXHRsZW5ndGhcdFx05LuOIEFycmF5YnVmZmVyIOWvueixoeWGmeWFpeWIsCBCeXRlIOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8iVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd3JpdGVBcnJheUJ1ZmZlcihhcnJheWJ1ZmZlcjogQXJyYXlCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKG9mZnNldCA8IDAgfHwgbGVuZ3RoIDwgMCkgdGhyb3cgXCJ3cml0ZUFycmF5QnVmZmVyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xyXG4gICAgICAgIGlmIChsZW5ndGggPT0gMCkgbGVuZ3RoID0gYXJyYXlidWZmZXIuYnl0ZUxlbmd0aCAtIG9mZnNldDtcclxuICAgICAgICAvLyRBTEVSVCDov5nph4zkvJrliIbphY3nlKjmiLfmjIflrprnmoTlhoXlrZjnqbrpl7TvvIzov5nlj6/og73lr7zoh7TliIbphY3lpJrkvZnnmoTlhoXlrZjnqbrpl7TvvIznlJroh7Plr7zoh7TlhoXlrZjmuqLlh7rjgILlupTor6Xov5vooYzmnInmlYjmgKfmo4Dmn6XjgILlpoLmnpznlKjmiLfmg7PopoHliIbphY3lpJrkvZnnmoTnqbrpl7TvvIzlupTor6Xkvb/nlKhzZXQgbGVuZ3Ro44CCXHJcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgbGVuZ3RoKTtcclxuICAgICAgICBsZXQgdWludDhhcnJheTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtcclxuICAgICAgICB0aGlzLl91OGRfLnNldCh1aW50OGFycmF5LnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSwgdGhpcy5fcG9zXyk7XHJcbiAgICAgICAgdGhpcy5fcG9zXyArPSBsZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiA8cD7lsIbmjIflrpogYXJyYXlidWZmZXIg5a+56LGh5Lit55qE5LulIG9mZnNldCDkuLrotbflp4vlgY/np7vph4/vvIwgbGVuZ3RoIOS4uumVv+W6pueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1geOAgjwvcD5cclxuICAgICAqIDxwPuWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvIzor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuu+8m+WmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy644CCPC9wPlxyXG4gICAgICogPHA+5aaC5p6cIG9mZnNldCDmiJYgbGVuZ3RoIOWwj+S6jjDvvIzmnKzlh73mlbDlsIbmipvlh7rlvILluLjjgII8L3A+XHJcbiAgICAgKiAkTkVYVEJJRyDnlLHkuo7msqHmnInliKTmlq1sZW5ndGjlkoxhcnJheWJ1ZmZlcueahOWQiOazleaAp++8jOW9k+W8gOWPkeiAheWhq+WGmeS6humUmeivr+eahGxlbmd0aOWAvOaXtu+8jOS8muWvvOiHtOWGmeWFpeWkmuS9meeahOepuueZveaVsOaNrueUmuiHs+WGheWtmOa6ouWHuu+8jOS4uuS6humBv+WFjeW9seWTjeW8gOWPkeiAheato+WcqOS9v+eUqOatpOaWueazleeahOWKn+iDve+8jOS4i+S4qumHjeWkp+eJiOacrOS8muS/ruWkjei/meS6m+mXrumimOOAglxyXG4gICAgICogQHBhcmFtXHRhcnJheWJ1ZmZlclx06ZyA6KaB5YaZ5YWl55qEIEFycmF5YnVmZmVyIOWvueixoeOAglxyXG4gICAgICogQHBhcmFtXHRvZmZzZXRcdFx0QXJyYXlidWZmZXIg5a+56LGh55qE57Si5byV55qE5YGP56e76YeP77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJXHJcbiAgICAgKiBAcGFyYW1cdGxlbmd0aFx0XHTku44gQXJyYXlidWZmZXIg5a+56LGh5YaZ5YWl5YiwIEJ5dGUg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZUJ5dGVzKGFycmF5YnVmZmVyOiBBcnJheUJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcclxuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBsZW5ndGggPCAwKSB0aHJvdyBcIndyaXRlQXJyYXlCdWZmZXIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAwKSBsZW5ndGggPSBhcnJheWJ1ZmZlci5ieXRlTGVuZ3RoIC0gb2Zmc2V0O1xyXG4gICAgICAgIC8vJEFMRVJUIOi/memHjOS8muWIhumFjeeUqOaIt+aMh+WumueahOWGheWtmOepuumXtO+8jOi/meWPr+iDveWvvOiHtOWIhumFjeWkmuS9meeahOWGheWtmOepuumXtO+8jOeUmuiHs+WvvOiHtOWGheWtmOa6ouWHuuOAguW6lOivpei/m+ihjOacieaViOaAp+ajgOafpeOAguWmguaenOeUqOaIt+aDs+imgeWIhumFjeWkmuS9meeahOepuumXtO+8jOW6lOivpeS9v+eUqHNldCBsZW5ndGjjgIJcclxuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyBsZW5ndGgpO1xyXG4gICAgICAgIGxldCB1aW50OGFycmF5OiBVaW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpO1xyXG4gICAgICAgIHRoaXMuX3U4ZF8uc2V0KHVpbnQ4YXJyYXkuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpLCB0aGlzLl9wb3NfKTtcclxuICAgICAgICB0aGlzLl9wb3NfICs9IGxlbmd0aDtcclxuICAgIH1cclxufVxyXG4iXX0=