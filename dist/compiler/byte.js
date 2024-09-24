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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnl0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9jb21waWxlci9ieXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFnQztBQUdoQzs7Ozs7R0FLRztBQUNILE1BQWEsSUFBSTtJQXlDYjs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsZUFBZTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25CLElBQUksTUFBTSxHQUFRLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQy9GLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBbUIsT0FBOEIsS0FBSyxDQUFDO1FBNUN2RDs7Ozs7O1dBTUc7UUFDTyxTQUFJLEdBQVksSUFBSSxDQUFDO1FBQ3ZCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBVXRCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQTBCMUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFP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QyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzlDLElBQUksQ0FBQyxHQUFpQixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsS0FBYSxFQUFFLEdBQVc7UUFDM0MsSUFBSSxHQUFHLEdBQVcsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBZSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsS0FBYSxFQUFFLEdBQVc7UUFDM0MsSUFBSSxHQUFHLEdBQVcsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBZSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksVUFBVTtRQUNiLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFBRSxNQUFNLGtDQUFrQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxRQUFRO1FBQ1gsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sa0NBQWtDLENBQUM7UUFDNUUsSUFBSSxDQUFDLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksVUFBVTtRQUNiLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFBRSxNQUFNLGtDQUFrQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxTQUFTO1FBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sa0NBQWtDLENBQUM7UUFDNUUsSUFBSSxDQUFDLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksWUFBWSxDQUFDLEtBQWE7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFVBQVUsQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxLQUFhO1FBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxXQUFXLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxRQUFRO1FBQ1gsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sZ0NBQWdDLENBQUM7UUFDMUUsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFNBQVM7UUFDWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxpQ0FBaUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUNoQixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxXQUFXLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxRQUFRO1FBQ1gsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sZ0NBQWdDLENBQUM7UUFDMUUsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksU0FBUztRQUNaLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFBRSxNQUFNLGlDQUFpQyxDQUFDO1FBQzNFLElBQUksRUFBRSxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksUUFBUTtRQUNYLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3BDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1QixFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQ1osRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVCLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25CLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUM7YUFBTSxDQUFDO1lBQ0osRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVCLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDWixFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUIsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELElBQUksS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUNoQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxVQUFVLENBQUMsS0FBWTtRQUMxQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM1QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFdBQVcsQ0FBQyxLQUFhO1FBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFVBQVUsQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFFBQVE7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztRQUMxRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksU0FBUyxDQUFDLEdBQVc7UUFDeEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxVQUFVLENBQUMsR0FBVztRQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssSUFBSSxDQUFDLEdBQVc7UUFDcEIsSUFBSSxDQUFDLEdBQVcsRUFBRSxFQUNkLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFDOUIsQ0FBUyxFQUNULEVBQVUsRUFDVixFQUFVLEVBQ1YsQ0FBQyxHQUFhLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDdEMsSUFBSSxDQUFDLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDVCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDO2lCQUFNLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUNsQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6RCxDQUFDO2lCQUFNLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUNsQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUM7aUJBQU0sQ0FBQztnQkFDSixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckcsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCwyQkFB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QUcsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDO1lBQUUsTUFBTSx3Q0FBd0MsQ0FBQztRQUM3RSxJQUFJLE1BQU0sSUFBSSxDQUFDO1lBQUUsTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzFELHVGQUF1RjtRQUN2RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxVQUFVLEdBQWUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQztJQUN6QixDQUFDOztBQWp3Qkwsb0JBa3dCQztBQWp3Qkc7Ozs7OztHQU1HO0FBQ1csZUFBVSxHQUFXLFdBQVcsQUFBdEIsQ0FBdUI7QUFFL0M7Ozs7OztHQU1HO0FBQ1csa0JBQWEsR0FBVyxjQUFjLEFBQXpCLENBQTBCO0FBc0J0QyxlQUFVLEdBQXFCLEtBQUssQ0FBQyxBQUEzQixDQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEludDY0IH0gZnJvbSBcIi4vaW50NjRcIjtcblxudHlwZSBOdWxsYWJsZTxUPiA9IFQgfCB1bmRlZmluZWQgfCBudWxsO1xuLyoqXG4gKiDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKdcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgQnl0ZVxuICovXG5leHBvcnQgY2xhc3MgQnl0ZSB7XG4gICAgLyoqXG4gICAgICog5aSn56uv5a2X6IqC5bqP77yM5Zyw5Z2A5L2O5L2N5a2Y5YKo5YC855qE6auY5L2N77yM5Zyw5Z2A6auY5L2N5a2Y5YKo5YC855qE5L2O5L2N44CC5pyJ5pe25Lmf56ew5LmL5Li6572R57uc5a2X6IqC5bqP44CCXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gXCJiaWdFbmRpYW5cIjtcblxuICAgIC8qKlxuICAgICAqIOWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jVxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIEJ5dGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExJVFRMRV9FTkRJQU46IHN0cmluZyA9IFwibGl0dGxlRW5kaWFuXCI7XG5cbiAgICAvKipcbiAgICAgKiDmmK/lkKbkuLrlsI/nq6/mlbDmja5cbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfeGRfOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIF9hbGxvY2F0ZWRfOiBudW1iZXIgPSA4O1xuICAgIC8qKlxuICAgICAqIOWOn+Wni+aVsOaNrlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHsqfVxuICAgICAqIEBtZW1iZXJvZiBCeXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kXyE6IERhdGFWaWV3O1xuICAgIHByb3RlY3RlZCBfdThkXyE6IFVpbnQ4QXJyYXk7XG4gICAgcHJvdGVjdGVkIF9wb3NfOiBudW1iZXIgPSAwO1xuICAgIHByb3RlY3RlZCBfbGVuZ3RoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIF9zeXNFbmRpYW46IE51bGxhYmxlPHN0cmluZz4gPSB2b2lkIDA7XG5cbiAgICAvKipcbiAgICAgKiA8cD7ojrflj5blvZPliY3kuLvmnLrnmoTlrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+IDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjxici8+XG4gICAgICogIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cbiAgICAgKiBAcmV0dXJuIOW9k+WJjeezu+e7n+eahOWtl+iKguW6j+OAglxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U3lzdGVtRW5kaWFuKCk6IFN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fc3lzRW5kaWFuKSB7XG4gICAgICAgICAgICBsZXQgYnVmZmVyOiBhbnkgPSBuZXcgQXJyYXlCdWZmZXIoMik7XG4gICAgICAgICAgICBuZXcgRGF0YVZpZXcoYnVmZmVyKS5zZXRJbnQxNigwLCAyNTYsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fc3lzRW5kaWFuID0gbmV3IEludDE2QXJyYXkoYnVmZmVyKVswXSA9PT0gMjU2ID8gQnl0ZS5MSVRUTEVfRU5ESUFOIDogQnl0ZS5CSUdfRU5ESUFOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zeXNFbmRpYW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65LiA5LiqIDxjb2RlPkJ5dGU8L2NvZGU+IOexu+eahOWunuS+i+OAglxuICAgICAqIEBwYXJhbVx0ZGF0YVx055So5LqO5oyH5a6a5Yid5aeL5YyW55qE5YWD57Sg5pWw55uu77yM5oiW6ICF55So5LqO5Yid5aeL5YyW55qEVHlwZWRBcnJheeWvueixoeOAgUFycmF5QnVmZmVy5a+56LGh44CCXG4gICAgICog5aaC5p6c5Li6IG51bGwg77yM5YiZ6aKE5YiG6YWN5LiA5a6a55qE5YaF5a2Y56m66Ze077yMXG4gICAgICog5b2T5Y+v55So56m66Ze05LiN6Laz5pe277yM5LyY5YWI5L2/55So6L+Z6YOo5YiG5YaF5a2Y77yM5aaC5p6c6L+Y5LiN5aSf77yM5YiZ6YeN5paw5YiG6YWN5omA6ZyA5YaF5a2Y44CCXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGRhdGE6IE51bGxhYmxlPEFycmF5QnVmZmVyPiA9IHZvaWQgMCkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fdThkXyA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgdGhpcy5fZF8gPSBuZXcgRGF0YVZpZXcodGhpcy5fdThkXy5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoID0gdGhpcy5fZF8uYnl0ZUxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19fcmVzaXplQnVmZmVyKHRoaXMuX2FsbG9jYXRlZF8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5q2k5a+56LGh55qEIEFycmF5QnVmZmVyIOaVsOaNru+8jOaVsOaNruWPquWMheWQq+acieaViOaVsOaNrumDqOWIhuOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgbGV0IHJzdEJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLl9kXy5idWZmZXI7XG4gICAgICAgIGlmIChyc3RCdWZmZXIuYnl0ZUxlbmd0aCA9PSB0aGlzLmxlbmd0aCkgcmV0dXJuIHJzdEJ1ZmZlcjtcbiAgICAgICAgcmV0dXJuIHJzdEJ1ZmZlci5zbGljZSgwLCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOWunuS+i+eahOWtl+iKguW6j+OAguWPluWAvOS4uu+8mjxjb2RlPkJJR19FTkRJQU48L2NvZGU+IOaIliA8Y29kZT5MSVRUTEVfRU5ESUFOPC9jb2RlPiDjgII8L3A+XG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgILpgJrov4cgPGNvZGU+Z2V0U3lzdGVtRW5kaWFuPC9jb2RlPiDlj6/ku6Xojrflj5blvZPliY3ns7vnu5/nmoTlrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+IDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjxici8+XG4gICAgICogIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVuZGlhbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5feGRfID8gQnl0ZS5MSVRUTEVfRU5ESUFOIDogQnl0ZS5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZW5kaWFuKGVuZGlhblN0cjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3hkXyA9IGVuZGlhblN0ciA9PSBCeXRlLkxJVFRMRV9FTkRJQU47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpzlsIbplb/luqborr7nva7kuLrlpKfkuo7lvZPliY3plb/luqbnmoTlgLzvvIzliJnnlKjpm7bloavlhYXlrZfoioLmlbDnu4TnmoTlj7PkvqfvvJvlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgII8L3A+XG4gICAgICogPHA+5aaC5p6c6KaB6K6+572u55qE6ZW/5bqm5aSn5LqO5b2T5YmN5bey5YiG6YWN55qE5YaF5a2Y56m66Ze055qE5a2X6IqC6ZW/5bqm77yM5YiZ6YeN5paw5YiG6YWN5YaF5a2Y56m66Ze077yM5aSn5bCP5Li65Lul5LiL5Lik6ICF6L6D5aSn6ICF77ya6KaB6K6+572u55qE6ZW/5bqm44CB5b2T5YmN5bey5YiG6YWN55qE6ZW/5bqm55qEMuWAje+8jOW5tuWwhuWOn+acieaVsOaNruaLt+i0neWIsOaWsOeahOWGheWtmOepuumXtOS4re+8m+WmguaenOimgeiuvue9rueahOmVv+W6puWwj+S6juW9k+WJjeW3suWIhumFjeeahOWGheWtmOepuumXtOeahOWtl+iKgumVv+W6pu+8jOS5n+S8mumHjeaWsOWIhumFjeWGheWtmOepuumXtO+8jOWkp+Wwj+S4uuimgeiuvue9rueahOmVv+W6pu+8jOW5tuWwhuWOn+acieaVsOaNruS7juWktOaIquaWreS4uuimgeiuvue9rueahOmVv+W6puWtmOWFpeaWsOeahOWGheWtmOepuumXtOS4reOAgjwvcD5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGxlbmd0aCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLl9hbGxvY2F0ZWRfIDwgdmFsdWUpXG4gICAgICAgICAgICB0aGlzLl9fX3Jlc2l6ZUJ1ZmZlcigodGhpcy5fYWxsb2NhdGVkXyA9IE1hdGguZmxvb3IoTWF0aC5tYXgodmFsdWUsIHRoaXMuX2FsbG9jYXRlZF8gKiAyKSkpKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYWxsb2NhdGVkXyA+IHZhbHVlKSB0aGlzLl9fX3Jlc2l6ZUJ1ZmZlcigodGhpcy5fYWxsb2NhdGVkXyA9IHZhbHVlKSk7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgcHJpdmF0ZSBfX19yZXNpemVCdWZmZXIobGVuOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBuZXdCeXRlVmlldzogYW55ID0gbmV3IFVpbnQ4QXJyYXkobGVuKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl91OGRfICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdThkXy5sZW5ndGggPD0gbGVuKSBuZXdCeXRlVmlldy5zZXQodGhpcy5fdThkXyk7XG4gICAgICAgICAgICAgICAgZWxzZSBuZXdCeXRlVmlldy5zZXQodGhpcy5fdThkXy5zdWJhcnJheSgwLCBsZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3U4ZF8gPSBuZXdCeXRlVmlldztcbiAgICAgICAgICAgIHRoaXMuX2RfID0gbmV3IERhdGFWaWV3KG5ld0J5dGVWaWV3LmJ1ZmZlcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgXCJfX19yZXNpemVCdWZmZXIgZXJyOlwiICsgbGVuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5bi455So5LqO6Kej5p6Q5Zu65a6a5qC85byP55qE5a2X6IqC5rWB44CCPC9wPlxuICAgICAqIDxwPuWFiOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+S9jee9ruWkhOivu+WPluS4gOS4qiA8Y29kZT5VaW50MzI8L2NvZGU+IOWAvO+8jOeEtuWQjuS7peatpOWAvOS4uumVv+W6pu+8jOivu+WPluatpOmVv+W6pueahOWtl+espuS4suOAgjwvcD5cbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuclVURih0aGlzLmdldFVpbnQzMigpKTtcbiAgICB9XG5cbiAgICAvL0xJVFRMRV9FTkRJQU4gb25seSBub3c7XG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+RmxvYXQzMkFycmF5PC9jb2RlPiDlr7nosaHlubbov5Tlm57mraTlr7nosaHjgIJcbiAgICAgKiBAcGFyYW1cdHN0YXJ0XHTlvIDlp4vkvY3nva7jgIJcbiAgICAgKiBAcGFyYW1cdGxlblx0XHTpnIDopoHor7vlj5bnmoTlrZfoioLplb/luqbjgILlpoLmnpzopoHor7vlj5bnmoTplb/luqbotoXov4flj6/or7vlj5bojIPlm7TvvIzliJnlj6rov5Tlm57lj6/or7vojIPlm7TlhoXnmoTlgLzjgIJcbiAgICAgKiBAcmV0dXJuICDor7vlj5bnmoQgRmxvYXQzMkFycmF5IOWvueixoeOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGbG9hdDMyQXJyYXkoc3RhcnQ6IG51bWJlciwgbGVuOiBudW1iZXIpOiBhbnkge1xuICAgICAgICBsZXQgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcbiAgICAgICAgZW5kID0gZW5kID4gdGhpcy5fbGVuZ3RoID8gdGhpcy5fbGVuZ3RoIDogZW5kO1xuICAgICAgICBsZXQgdjogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLl9kXy5idWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgICAgICB0aGlzLl9wb3NfID0gZW5kO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK0gPGNvZGU+c3RhcnQ8L2NvZGU+IOWPguaVsOaMh+WumueahOS9jee9ruW8gOWni++8jOivu+WPliA8Y29kZT5sZW48L2NvZGU+IOWPguaVsOaMh+WumueahOWtl+iKguaVsOeahOaVsOaNru+8jOeUqOS6juWIm+W7uuS4gOS4qiA8Y29kZT5VaW50OEFycmF5PC9jb2RlPiDlr7nosaHlubbov5Tlm57mraTlr7nosaHjgIJcbiAgICAgKiBAcGFyYW1cdHN0YXJ0XHTlvIDlp4vkvY3nva7jgIJcbiAgICAgKiBAcGFyYW1cdGxlblx0XHTpnIDopoHor7vlj5bnmoTlrZfoioLplb/luqbjgILlpoLmnpzopoHor7vlj5bnmoTplb/luqbotoXov4flj6/or7vlj5bojIPlm7TvvIzliJnlj6rov5Tlm57lj6/or7vojIPlm7TlhoXnmoTlgLzjgIJcbiAgICAgKiBAcmV0dXJuICDor7vlj5bnmoQgVWludDhBcnJheSDlr7nosaHjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VWludDhBcnJheShzdGFydDogbnVtYmVyLCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICAgICAgICBsZXQgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcbiAgICAgICAgZW5kID0gZW5kID4gdGhpcy5fbGVuZ3RoID8gdGhpcy5fbGVuZ3RoIDogZW5kO1xuICAgICAgICBsZXQgdjogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2RfLmJ1ZmZlci5zbGljZShzdGFydCwgZW5kKSk7XG4gICAgICAgIHRoaXMuX3Bvc18gPSBlbmQ7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4rSA8Y29kZT5zdGFydDwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5L2N572u5byA5aeL77yM6K+75Y+WIDxjb2RlPmxlbjwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5a2X6IqC5pWw55qE5pWw5o2u77yM55So5LqO5Yib5bu65LiA5LiqIDxjb2RlPkludDE2QXJyYXk8L2NvZGU+IOWvueixoeW5tui/lOWbnuatpOWvueixoeOAglxuICAgICAqIEBwYXJhbVx0c3RhcnRcdOW8gOWni+ivu+WPlueahOWtl+iKguWBj+enu+mHj+S9jee9ruOAglxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxuICAgICAqIEByZXR1cm4gIOivu+WPlueahCBVaW50OEFycmF5IOWvueixoeOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbnQxNkFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogYW55IHtcbiAgICAgICAgbGV0IGVuZDogbnVtYmVyID0gc3RhcnQgKyBsZW47XG4gICAgICAgIGVuZCA9IGVuZCA+IHRoaXMuX2xlbmd0aCA/IHRoaXMuX2xlbmd0aCA6IGVuZDtcbiAgICAgICAgbGV0IHY6IEludDE2QXJyYXkgPSBuZXcgSW50MTZBcnJheSh0aGlzLl9kXy5idWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgICAgICB0aGlzLl9wb3NfID0gZW5kO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vkvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmxvYXQzMigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQzMiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgbGV0IHY6IG51bWJlciA9IHRoaXMuX2RfLmdldEZsb2F0MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vkvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICog5ZCMZ2V0RmxvYXQzMigpXG4gICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmxvYXQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEZsb2F0MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGxldCB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcHVibGljIGdldEZsb2F0NjQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA4ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEZsb2F0NjQgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGxldCB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRGbG9hdDY0KHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxuICAgICAqIOWQjGdldEZsb2F0NjQoKVxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcHVibGljIGdldERvdWJsZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDggPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQ2NCBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgbGV0IHY6IG51bWJlciA9IHRoaXMuX2RfLmdldEZsb2F0NjQodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx05Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRmxvYXQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xuICAgICAgICB0aGlzLl9kXy5zZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxuICAgICAqIOWQjHdyaXRlRmxvYXQzMigpXG4gICAgICogQHBhcmFtXHR2YWx1ZVx05Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRmxvYXQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0RmxvYXQzMih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVGbG9hdDY0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgOCk7XG4gICAgICAgIHRoaXMuX2RfLnNldEZsb2F0NjQodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICog5ZCMd3JpdGVGbG9hdDY0KClcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVEb3VibGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA4KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0RmxvYXQ2NCh0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBJbnQzMiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIEludDMyIOWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbnQzMigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0SW50MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gdGhpcy5fZF8uZ2V0SW50MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gZmxvYXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQzMiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQzMiDlgLzjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VWludDMyKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgNCA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGxldCB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRVaW50MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXmjIflrprnmoQgSW50MzIg5YC844CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEIEludDMyIOWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUludDMyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XG4gICAgICAgIHRoaXMuX2RfLnNldEludDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWlIFVpbnQzMiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoQgVWludDMyIOWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVpbnQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xuICAgICAgICB0aGlzLl9kXy5zZXRVaW50MzIodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogSW50MTYg5YC844CCXG4gICAgICogQHJldHVybiBJbnQxNiDlgLzjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW50MTYoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyAyID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEludDE2IGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICBsZXQgdXM6IG51bWJlciA9IHRoaXMuX2RfLmdldEludDE2KHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICAgICAgcmV0dXJuIHVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50MTYg5YC844CCXG4gICAgICogQHJldHVybiBVaW50MTYg5YC844CCXG4gICAgICovXG4gICAgcHVibGljIGdldFVpbnQxNigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDIgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0VWludDE2IGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICBsZXQgdXM6IG51bWJlciA9IHRoaXMuX2RfLmdldFVpbnQxNih0aGlzLl9wb3NfLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDI7XG4gICAgICAgIHJldHVybiB1cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bkuIDkuKppbnQ2NFxuICAgICAqXG4gICAgICogQHJldHVybiB7SW50NjR9ICBJbnQ2NFxuICAgICAqIEBtZW1iZXJvZiBCeXRlXG4gICAgICovXG4gICAgcHVibGljIGdldEludDY0KCk6IEludDY0IHtcbiAgICAgICAgbGV0IGxvID0gMDtcbiAgICAgICAgbGV0IGhpID0gMDtcbiAgICAgICAgY29uc3QgdmlldyA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2RfLmJ1ZmZlcik7XG4gICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLl9wb3NfO1xuICAgICAgICBpZiAodGhpcy5lbmRpYW4gPT0gQnl0ZS5MSVRUTEVfRU5ESUFOKSB7XG4gICAgICAgICAgICBsbyA9IHZpZXdbb2Zmc2V0ICsgMl0gPDwgMTY7XG4gICAgICAgICAgICBsbyB8PSB2aWV3W29mZnNldCArIDFdIDw8IDg7XG4gICAgICAgICAgICBsbyB8PSB2aWV3W29mZnNldF07XG4gICAgICAgICAgICBsbyArPSAodmlld1tvZmZzZXQgKyAzXSA8PCAyNCkgPj4+IDA7XG4gICAgICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgICAgIGhpID0gdmlld1tvZmZzZXQgKyAyXSA8PCAxNjtcbiAgICAgICAgICAgIGhpIHw9IHZpZXdbb2Zmc2V0ICsgMV0gPDwgODtcbiAgICAgICAgICAgIGhpIHw9IHZpZXdbb2Zmc2V0XTtcbiAgICAgICAgICAgIGhpICs9ICh2aWV3W29mZnNldCArIDNdIDw8IDI0KSA+Pj4gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpID0gdmlld1tvZmZzZXQgKyAxXSA8PCAxNjtcbiAgICAgICAgICAgIGhpIHw9IHZpZXdbb2Zmc2V0ICsgMl0gPDwgODtcbiAgICAgICAgICAgIGhpIHw9IHZpZXdbb2Zmc2V0ICsgM107XG4gICAgICAgICAgICBoaSArPSAodmlld1tvZmZzZXRdIDw8IDI0KSA+Pj4gMDtcbiAgICAgICAgICAgIG9mZnNldCArPSA0O1xuICAgICAgICAgICAgbG8gPSB2aWV3W29mZnNldCArIDFdIDw8IDE2O1xuICAgICAgICAgICAgbG8gfD0gdmlld1tvZmZzZXQgKyAyXSA8PCA4O1xuICAgICAgICAgICAgbG8gfD0gdmlld1tvZmZzZXQgKyAzXTtcbiAgICAgICAgICAgIGxvICs9ICh2aWV3W29mZnNldF0gPDwgMjQpID4+PiAwO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2YWx1ZSA9IG5ldyBJbnQ2NChsbywgaGkpO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDg7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlhpnlhaVJbnQ2NFxuICAgICAqXG4gICAgICogQHBhcmFtIHtJbnQ2NH0gdmFsdWVcbiAgICAgKiBAbWVtYmVyb2YgQnl0ZVxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUludDY0KHZhbHVlOiBJbnQ2NCk6IHZvaWQge1xuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5fcG9zXztcbiAgICAgICAgdGhpcy5lbnN1cmVXcml0ZShvZmZzZXQgKyA4KTtcbiAgICAgICAgbGV0IGxvID0gdmFsdWUuZ2V0TG93Qml0cygpO1xuICAgICAgICBsZXQgaGkgPSB2YWx1ZS5nZXRIaWdoQml0cygpO1xuICAgICAgICBsZXQgdmlldyA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2RfLmJ1ZmZlcik7XG5cbiAgICAgICAgaWYgKHRoaXMuZW5kaWFuID09IEJ5dGUuTElUVExFX0VORElBTikge1xuICAgICAgICAgICAgdmlld1tvZmZzZXQgKyAzXSA9IChsbyA+Pj4gMjQpICYgMHhmZjtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgMl0gPSAobG8gPj4+IDE2KSAmIDB4ZmY7XG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDFdID0gKGxvID4+PiA4KSAmIDB4ZmY7XG4gICAgICAgICAgICB2aWV3W29mZnNldF0gPSBsbyAmIDB4ZmY7XG4gICAgICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgM10gPSAoaGkgPj4+IDI0KSAmIDB4ZmY7XG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDJdID0gKGhpID4+PiAxNikgJiAweGZmO1xuICAgICAgICAgICAgdmlld1tvZmZzZXQgKyAxXSA9IChoaSA+Pj4gOCkgJiAweGZmO1xuICAgICAgICAgICAgdmlld1tvZmZzZXRdID0gaGkgJiAweGZmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1tvZmZzZXRdID0gKGhpID4+PiAyNCkgJiAweGZmO1xuICAgICAgICAgICAgdmlld1tvZmZzZXQgKyAxXSA9IChoaSA+Pj4gMTYpICYgMHhmZjtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgMl0gPSAoaGkgPj4+IDgpICYgMHhmZjtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgM10gPSBoaSAmIDB4ZmY7XG4gICAgICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0XSA9IChsbyA+Pj4gMjQpICYgMHhmZjtcbiAgICAgICAgICAgIHZpZXdbb2Zmc2V0ICsgMV0gPSAobG8gPj4+IDE2KSAmIDB4ZmY7XG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDJdID0gKGxvID4+PiA4KSAmIDB4ZmY7XG4gICAgICAgICAgICB2aWV3W29mZnNldCArIDNdID0gbG8gJiAweGZmO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXmjIflrprnmoQgVWludDE2IOWAvOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahFVpbnQxNiDlgLzjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVaW50MTYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAyKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDE2KHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5oyH5a6a55qEIEludDE2IOWAvOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBJbnQxNiDlgLzjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVJbnQxNih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDIpO1xuICAgICAgICB0aGlzLl9kXy5zZXRJbnQxNih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50OCDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQ4IOWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVaW50OCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDEgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0VWludDggZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHJldHVybiB0aGlzLl9kXy5nZXRVaW50OCh0aGlzLl9wb3NfKyspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBVaW50OCDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoQgVWludDgg5YC844CCXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVWludDgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAxKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDgodGhpcy5fcG9zXywgdmFsdWUpO1xuICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDku47lrZfoioLmtYHnmoTmjIflrprlrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogVWludDgg5YC844CCXG4gICAgICogQHBhcmFtXHRwb3NcdOWtl+iKguivu+WPluS9jee9ruOAglxuICAgICAqIEByZXR1cm4gVWludDgg5YC844CCXG4gICAgICovXG4gICAgcHVibGljIF9nZXRVSW50OChwb3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kXy5nZXRVaW50OChwb3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog5LuO5a2X6IqC5rWB55qE5oyH5a6a5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQxNiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHBvc1x05a2X6IqC6K+75Y+W5L2N572u44CCXG4gICAgICogQHJldHVybiBVaW50MTYg5YC844CCXG4gICAgICovXG4gICAgcHVibGljIF9nZXRVaW50MTYocG9zOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZF8uZ2V0VWludDE2KHBvcywgdGhpcy5feGRfKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+WPluaMh+WumumVv+W6pueahCBVVEYg5Z6L5a2X56ym5Liy44CCXG4gICAgICogQHBhcmFtXHRsZW4g6ZyA6KaB6K+75Y+W55qE6ZW/5bqm44CCXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICBwcml2YXRlIHJVVEYobGVuOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBsZXQgdjogc3RyaW5nID0gXCJcIixcbiAgICAgICAgICAgIG1heDogbnVtYmVyID0gdGhpcy5fcG9zXyArIGxlbixcbiAgICAgICAgICAgIGM6IG51bWJlcixcbiAgICAgICAgICAgIGMyOiBudW1iZXIsXG4gICAgICAgICAgICBjMzogbnVtYmVyLFxuICAgICAgICAgICAgZjogRnVuY3Rpb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuICAgICAgICBsZXQgdTogYW55ID0gdGhpcy5fdThkXztcbiAgICAgICAgd2hpbGUgKHRoaXMuX3Bvc18gPCBtYXgpIHtcbiAgICAgICAgICAgIGMgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICBpZiAoYyA8IDB4ODApIHtcbiAgICAgICAgICAgICAgICBpZiAoYyAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHYgKz0gZihjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPCAweGUwKSB7XG4gICAgICAgICAgICAgICAgdiArPSBmKCgoYyAmIDB4M2YpIDw8IDYpIHwgKHVbdGhpcy5fcG9zXysrXSAmIDB4N2YpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8IDB4ZjApIHtcbiAgICAgICAgICAgICAgICBjMiA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgICAgICB2ICs9IGYoKChjICYgMHgxZikgPDwgMTIpIHwgKChjMiAmIDB4N2YpIDw8IDYpIHwgKHVbdGhpcy5fcG9zXysrXSAmIDB4N2YpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYzIgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgYzMgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgdiArPSBmKCgoYyAmIDB4MGYpIDw8IDE4KSB8ICgoYzIgJiAweDdmKSA8PCAxMikgfCAoKGMzIDw8IDYpICYgMHg3ZikgfCAodVt0aGlzLl9wb3NfKytdICYgMHg3ZikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8vIFJpdmVyOiDoh6rlrprkuYnnmoTlrZfnrKbkuLLor7vlj5Ys6aG555uu55u45YWz55qE5YaF5a65XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTplb/luqbnmoTlrZfnrKbkuLLjgIJcbiAgICAgKiBAcGFyYW1cdGxlblx06KaB6K+75Y+W55qE5a2X56ym5Liy55qE6ZW/5bqm44CCXG4gICAgICogQHJldHVybiDmjIflrprplb/luqbnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q3VzdG9tU3RyaW5nKGxlbjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHY6IHN0cmluZyA9IFwiXCIsXG4gICAgICAgICAgICB1bGVuOiBudW1iZXIgPSAwLFxuICAgICAgICAgICAgYzogbnVtYmVyLFxuICAgICAgICAgICAgYzI6IG51bWJlcixcbiAgICAgICAgICAgIGY6IEZ1bmN0aW9uID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgICAgICAgbGV0IHU6IGFueSA9IHRoaXMuX3U4ZF87XG4gICAgICAgIHdoaWxlIChsZW4gPiAwKSB7XG4gICAgICAgICAgICBjID0gdVt0aGlzLl9wb3NfXTtcbiAgICAgICAgICAgIGlmIChjIDwgMHg4MCkge1xuICAgICAgICAgICAgICAgIHYgKz0gZihjKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgICAgICAgICAgICAgbGVuLS07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVsZW4gPSBjIC0gMHg4MDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgICAgICAgICAgICAgbGVuIC09IHVsZW47XG4gICAgICAgICAgICAgICAgd2hpbGUgKHVsZW4gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGMgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgICAgIGMyID0gdVt0aGlzLl9wb3NfKytdO1xuICAgICAgICAgICAgICAgICAgICB2ICs9IGYoKGMyIDw8IDgpIHwgYyk7XG4gICAgICAgICAgICAgICAgICAgIHVsZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnp7vliqjmiJbov5Tlm54gQnl0ZSDlr7nosaHnmoTor7vlhpnmjIfpkojnmoTlvZPliY3kvY3nva7vvIjku6XlrZfoioLkuLrljZXkvY3vvInjgILkuIvkuIDmrKHosIPnlKjor7vlj5bmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vor7vlj5bvvIzmiJbogIXkuIvkuIDmrKHosIPnlKjlhpnlhaXmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vlhpnlhaXjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBvcygpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9zXztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBvcyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3Bvc18gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlj6/ku47lrZfoioLmtYHnmoTlvZPliY3kvY3nva7liLDmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ5dGVzQXZhaWxhYmxlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGggLSB0aGlzLl9wb3NfO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOa4hemZpOWtl+iKguaVsOe7hOeahOWGheWuue+8jOW5tuWwhiBsZW5ndGgg5ZKMIHBvcyDlsZ7mgKfph43nva7kuLogMOOAguiwg+eUqOatpOaWueazleWwhumHiuaUviBCeXRlIOWunuS+i+WNoOeUqOeahOWGheWtmOOAglxuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcG9zXyA9IDA7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOiOt+WPluatpOWvueixoeeahCBBcnJheUJ1ZmZlciDlvJXnlKjjgIJcbiAgICAgKiBAcmV0dXJuXG4gICAgICovXG4gICAgcHVibGljIF9fZ2V0QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgLy8gdGhpcy5fZF8uYnVmZmVyLmJ5dGVMZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE5a2X5Li65a2X56ym5Liy5re75Yqg5YmN57yA44CCPC9wPlxuICAgICAqIDxwPuWvueW6lOeahOivu+WPluaWueazleS4uu+8miBnZXRVVEZCeXRlcyDjgII8L3A+XG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURkJ5dGVzKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgLy8gdXRmOC1kZWNvZGVcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSArIFwiXCI7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDAsIHN6OiBudW1iZXIgPSB2YWx1ZS5sZW5ndGg7IGkgPCBzejsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYzogbnVtYmVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcblxuICAgICAgICAgICAgaWYgKGMgPD0gMHg3Zikge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVCeXRlKGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjIDw9IDB4N2ZmKSB7XG4gICAgICAgICAgICAgICAgLy/kvJjljJbkuLrnm7TmjqXlhpnlhaXlpJrkuKrlrZfoioLvvIzogIzkuI3lv4Xph43lpI3osIPnlKh3cml0ZUJ5dGXvvIzlhY3ljrvpop3lpJbnmoTosIPnlKjlkozpgLvovpHlvIDplIDjgIJcbiAgICAgICAgICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91OGRfLnNldChbMHhjMCB8IChjID4+IDYpLCAweDgwIHwgKGMgJiAweDNmKV0sIHRoaXMuX3Bvc18pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8PSAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91OGRfLnNldChbMHhlMCB8IChjID4+IDEyKSwgMHg4MCB8ICgoYyA+PiA2KSAmIDB4M2YpLCAweDgwIHwgKGMgJiAweDNmKV0sIHRoaXMuX3Bvc18pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gMztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdThkXy5zZXQoXG4gICAgICAgICAgICAgICAgICAgIFsweGYwIHwgKGMgPj4gMTgpLCAweDgwIHwgKChjID4+IDEyKSAmIDB4M2YpLCAweDgwIHwgKChjID4+IDYpICYgMHgzZiksIDB4ODAgfCAoYyAmIDB4M2YpXSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcG9zXyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDE2IOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKguOAgjwvcD5cbiAgICAgKiA8cD7lr7nlupTnmoTor7vlj5bmlrnms5XkuLrvvJogZ2V0VVRGU3RyaW5nIOOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURlN0cmluZyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxldCB0UG9zOiBudW1iZXIgPSB0aGlzLnBvcztcbiAgICAgICAgdGhpcy53cml0ZVVpbnQxNigxKTtcbiAgICAgICAgdGhpcy53cml0ZVVURkJ5dGVzKHZhbHVlKTtcbiAgICAgICAgbGV0IGRQb3M6IG51bWJlciA9IHRoaXMucG9zIC0gdFBvcyAtIDI7XG4gICAgICAgIGlmIChkUG9zID49IDY1NTM2KSB7XG4gICAgICAgICAgICB0aHJvdyBcIndyaXRlVVRGU3RyaW5nIGJ5dGUgbGVuIG1vcmUgdGhhbiA2NTUzNlwiO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQxNih0UG9zLCBkUG9zLCB0aGlzLl94ZF8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDE2IOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKguOAgjwvcD5cbiAgICAgKiA8cD7lr7nlupTnmoTor7vlj5bmlrnms5XkuLrvvJogZ2V0VVRGU3RyaW5nIOOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvOOAglxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURjhTdHJpbmcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsZXQgdFBvczogbnVtYmVyID0gdGhpcy5wb3M7XG4gICAgICAgIHRoaXMud3JpdGVVaW50MTYoMSk7XG4gICAgICAgIHRoaXMud3JpdGVVVEZCeXRlcyh2YWx1ZSk7XG4gICAgICAgIGxldCBkUG9zOiBudW1iZXIgPSB0aGlzLnBvcyAtIHRQb3MgLSAyO1xuICAgICAgICBpZiAoZFBvcyA+PSA2NTUzNikge1xuICAgICAgICAgICAgdGhyb3cgXCJ3cml0ZVVURlN0cmluZyBieXRlIGxlbiBtb3JlIHRoYW4gNjU1MzZcIjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kXy5zZXRVaW50MTYodFBvcywgZFBvcywgdGhpcy5feGRfKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+WPliBVVEYtOCDlrZfnrKbkuLLjgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRVVEZCeXRlcyh0aGlzLmdldFVpbnQxNigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+WPliBVVEYtOCDlrZfnrKbkuLLjgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGOFN0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXModGhpcy5nZXRVaW50MTYoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDor7vlj5YgVVRGLTgg5a2X56ym5Liy44CCXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VVRGOFN0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXModGhpcy5nZXRVaW50MTYoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIFVURi04IOWtl+espuS4suOAguWBh+WumuWtl+espuS4sueahOWJjee8gOaYr+S4gOS4quaXoOespuWPt+eahOefreaVtOWei++8iOS7peatpOWtl+iKguihqOekuuimgeivu+WPlueahOmVv+W6pu+8ieOAgjwvcD5cbiAgICAgKiA8cD7lr7nlupTnmoTlhpnlhaXmlrnms5XkuLrvvJogd3JpdGVVVEZTdHJpbmcg44CCPC9wPlxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgcHVibGljIGdldFVURlN0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDor7vlrZfnrKbkuLLvvIzlv4XpobvmmK8gd3JpdGVVVEZCeXRlcyDmlrnms5XlhpnlhaXnmoTlrZfnrKbkuLLjgIJcbiAgICAgKiBAcGFyYW0gbGVuXHTopoHor7vnmoRidWZmZXLplb/luqbvvIzpu5jorqTlsIbor7vlj5bnvJPlhrLljLrlhajpg6jmlbDmja7jgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGQnl0ZXMobGVuOiBudW1iZXIgPSAtMSk6IHN0cmluZyB7XG4gICAgICAgIGlmIChsZW4gPT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGxldCBsYXN0Qnl0ZXM6IG51bWJlciA9IHRoaXMuYnl0ZXNBdmFpbGFibGU7XG4gICAgICAgIGlmIChsZW4gPiBsYXN0Qnl0ZXMpIHRocm93IFwicmVhZFVURkJ5dGVzIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICBsZW4gPSBsZW4gPiAwID8gbGVuIDogbGFzdEJ5dGVzO1xuICAgICAgICByZXR1cm4gdGhpcy5yVVRGKGxlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq55SxIGxlbmd0aCDlj4LmlbDmjIflrprnmoTplb/luqbnmoQgVVRGLTgg5a2X6IqC5bqP5YiX77yM5bm26L+U5Zue5LiA5Liq5a2X56ym5Liy44CCPC9wPlxuICAgICAqIDxwPuS4gOiIrOivu+WPlueahOaYr+eUsSB3cml0ZVVURkJ5dGVzIOaWueazleWGmeWFpeeahOWtl+espuS4suOAgjwvcD5cbiAgICAgKiBAcGFyYW0gbGVuXHTopoHor7vnmoRidWZmZXLplb/luqbvvIzpu5jorqTlsIbor7vlj5bnvJPlhrLljLrlhajpg6jmlbDmja7jgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVVEZCeXRlcyhsZW46IG51bWJlciA9IC0xKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKGxlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqC44CCPC9wPlxuICAgICAqIDxwPuS9v+eUqOWPguaVsOeahOS9jiA4IOS9jeOAguW/veeVpemrmCAyNCDkvY3jgII8L3A+XG4gICAgICogQHBhcmFtXHR2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJ5dGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAxKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50OCh0aGlzLl9wb3NfLCB2YWx1ZSk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKguOAglxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDEgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwicmVhZEJ5dGUgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHJldHVybiB0aGlzLl9kXy5nZXRJbnQ4KHRoaXMuX3Bvc18rKyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5LuO5a2X6IqC5rWB5Lit6K+75Y+W5bim56ym5Y+355qE5a2X6IqC44CCPC9wPlxuICAgICAqIDxwPui/lOWbnuWAvOeahOiMg+WbtOaYr+S7jiAtMTI4IOWIsCAxMjfjgII8L3A+XG4gICAgICogQHJldHVybiDku4vkuo4gLTEyOCDlkowgMTI3IOS5i+mXtOeahOaVtOaVsOOAglxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRCeXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5L+d6K+B6K+l5a2X6IqC5rWB55qE5Y+v55So6ZW/5bqm5LiN5bCP5LqOIDxjb2RlPmxlbmd0aFRvRW5zdXJlPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlgLzjgII8L3A+XG4gICAgICogQHBhcmFtXHRsZW5ndGhUb0Vuc3VyZVx05oyH5a6a55qE6ZW/5bqm44CCXG4gICAgICovXG4gICAgcHVibGljIGVuc3VyZVdyaXRlKGxlbmd0aFRvRW5zdXJlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCA8IGxlbmd0aFRvRW5zdXJlKSB0aGlzLl9sZW5ndGggPSBsZW5ndGhUb0Vuc3VyZTtcbiAgICAgICAgaWYgKHRoaXMuX2FsbG9jYXRlZF8gPCBsZW5ndGhUb0Vuc3VyZSkgdGhpcy5sZW5ndGggPSBsZW5ndGhUb0Vuc3VyZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIbmjIflrpogYXJyYXlidWZmZXIg5a+56LGh5Lit55qE5LulIG9mZnNldCDkuLrotbflp4vlgY/np7vph4/vvIwgbGVuZ3RoIOS4uumVv+W6pueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1geOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yM6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrvvJvlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMuuOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg5bCP5LqOMO+8jOacrOWHveaVsOWwhuaKm+WHuuW8guW4uOOAgjwvcD5cbiAgICAgKiAkTkVYVEJJRyDnlLHkuo7msqHmnInliKTmlq1sZW5ndGjlkoxhcnJheWJ1ZmZlcueahOWQiOazleaAp++8jOW9k+W8gOWPkeiAheWhq+WGmeS6humUmeivr+eahGxlbmd0aOWAvOaXtu+8jOS8muWvvOiHtOWGmeWFpeWkmuS9meeahOepuueZveaVsOaNrueUmuiHs+WGheWtmOa6ouWHuu+8jOS4uuS6humBv+WFjeW9seWTjeW8gOWPkeiAheato+WcqOS9v+eUqOatpOaWueazleeahOWKn+iDve+8jOS4i+S4qumHjeWkp+eJiOacrOS8muS/ruWkjei/meS6m+mXrumimOOAglxuICAgICAqIEBwYXJhbVx0YXJyYXlidWZmZXJcdOmcgOimgeWGmeWFpeeahCBBcnJheWJ1ZmZlciDlr7nosaHjgIJcbiAgICAgKiBAcGFyYW1cdG9mZnNldFx0XHRBcnJheWJ1ZmZlciDlr7nosaHnmoTntKLlvJXnmoTlgY/np7vph4/vvIjku6XlrZfoioLkuLrljZXkvY3vvIlcbiAgICAgKiBAcGFyYW1cdGxlbmd0aFx0XHTku44gQXJyYXlidWZmZXIg5a+56LGh5YaZ5YWl5YiwIEJ5dGUg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQXJyYXlCdWZmZXIoYXJyYXlidWZmZXI6IEFycmF5QnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBsZW5ndGggPCAwKSB0aHJvdyBcIndyaXRlQXJyYXlCdWZmZXIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGlmIChsZW5ndGggPT0gMCkgbGVuZ3RoID0gYXJyYXlidWZmZXIuYnl0ZUxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgLy8kQUxFUlQg6L+Z6YeM5Lya5YiG6YWN55So5oi35oyH5a6a55qE5YaF5a2Y56m66Ze077yM6L+Z5Y+v6IO95a+86Ie05YiG6YWN5aSa5L2Z55qE5YaF5a2Y56m66Ze077yM55Sa6Iez5a+86Ie05YaF5a2Y5rqi5Ye644CC5bqU6K+l6L+b6KGM5pyJ5pWI5oCn5qOA5p+l44CC5aaC5p6c55So5oi35oOz6KaB5YiG6YWN5aSa5L2Z55qE56m66Ze077yM5bqU6K+l5L2/55Soc2V0IGxlbmd0aOOAglxuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyBsZW5ndGgpO1xuICAgICAgICBsZXQgdWludDhhcnJheTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtcbiAgICAgICAgdGhpcy5fdThkXy5zZXQodWludDhhcnJheS5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCksIHRoaXMuX3Bvc18pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IGxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIbmjIflrpogYXJyYXlidWZmZXIg5a+56LGh5Lit55qE5LulIG9mZnNldCDkuLrotbflp4vlgY/np7vph4/vvIwgbGVuZ3RoIOS4uumVv+W6pueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1geOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yM6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrvvJvlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMuuOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg5bCP5LqOMO+8jOacrOWHveaVsOWwhuaKm+WHuuW8guW4uOOAgjwvcD5cbiAgICAgKiAkTkVYVEJJRyDnlLHkuo7msqHmnInliKTmlq1sZW5ndGjlkoxhcnJheWJ1ZmZlcueahOWQiOazleaAp++8jOW9k+W8gOWPkeiAheWhq+WGmeS6humUmeivr+eahGxlbmd0aOWAvOaXtu+8jOS8muWvvOiHtOWGmeWFpeWkmuS9meeahOepuueZveaVsOaNrueUmuiHs+WGheWtmOa6ouWHuu+8jOS4uuS6humBv+WFjeW9seWTjeW8gOWPkeiAheato+WcqOS9v+eUqOatpOaWueazleeahOWKn+iDve+8jOS4i+S4qumHjeWkp+eJiOacrOS8muS/ruWkjei/meS6m+mXrumimOOAglxuICAgICAqIEBwYXJhbVx0YXJyYXlidWZmZXJcdOmcgOimgeWGmeWFpeeahCBBcnJheWJ1ZmZlciDlr7nosaHjgIJcbiAgICAgKiBAcGFyYW1cdG9mZnNldFx0XHRBcnJheWJ1ZmZlciDlr7nosaHnmoTntKLlvJXnmoTlgY/np7vph4/vvIjku6XlrZfoioLkuLrljZXkvY3vvIlcbiAgICAgKiBAcGFyYW1cdGxlbmd0aFx0XHTku44gQXJyYXlidWZmZXIg5a+56LGh5YaZ5YWl5YiwIEJ5dGUg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZXMoYXJyYXlidWZmZXI6IEFycmF5QnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBsZW5ndGggPCAwKSB0aHJvdyBcIndyaXRlQXJyYXlCdWZmZXIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGlmIChsZW5ndGggPT0gMCkgbGVuZ3RoID0gYXJyYXlidWZmZXIuYnl0ZUxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgLy8kQUxFUlQg6L+Z6YeM5Lya5YiG6YWN55So5oi35oyH5a6a55qE5YaF5a2Y56m66Ze077yM6L+Z5Y+v6IO95a+86Ie05YiG6YWN5aSa5L2Z55qE5YaF5a2Y56m66Ze077yM55Sa6Iez5a+86Ie05YaF5a2Y5rqi5Ye644CC5bqU6K+l6L+b6KGM5pyJ5pWI5oCn5qOA5p+l44CC5aaC5p6c55So5oi35oOz6KaB5YiG6YWN5aSa5L2Z55qE56m66Ze077yM5bqU6K+l5L2/55Soc2V0IGxlbmd0aOOAglxuICAgICAgICB0aGlzLmVuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyBsZW5ndGgpO1xuICAgICAgICBsZXQgdWludDhhcnJheTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtcbiAgICAgICAgdGhpcy5fdThkXy5zZXQodWludDhhcnJheS5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCksIHRoaXMuX3Bvc18pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IGxlbmd0aDtcbiAgICB9XG59XG4iXX0=