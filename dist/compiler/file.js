"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirExists = exports.File = void 0;
const $fs = __importStar(require("fs"));
const $path = __importStar(require("path"));
/**
 * 文件
 *
 * @export
 * @class File
 */
class File {
    /**
     * Creates an instance of File.
     * @param {string} path 文件/文件夹路径
     * @memberof File
     */
    constructor(path) {
        this.nativePath = path = path.replace(/\\/g, "/");
        if (this.exists == true) {
            this._states = $fs.statSync(this.nativePath);
            if (this.isFile() == false) {
                if (path[path.length - 1] != "/") {
                    this.nativePath = path + "/";
                }
            }
        }
    }
    /**
     * 文件名
     *
     * @readonly
     * @type {string}
     * @memberof File
     */
    get name() {
        let _name = this.nativePath;
        _name = _name.slice(_name.lastIndexOf("/", _name.length - 2)).replace(/\//g, "");
        return _name;
    }
    /**
     * 是否存在
     *
     * @readonly
     * @memberof File
     */
    get exists() {
        return $fs.existsSync(this.nativePath);
    }
    /**
     * 是否是文件
     *
     * @return {*}
     * @memberof File
     */
    isFile() {
        if (this.exists == false) {
            return false;
        }
        if (this._states) {
            return this._states.isFile();
        }
        return undefined;
    }
    /**
     * 是否是文件夹
     *
     * @return {*}
     * @memberof File
     */
    isDirectory() {
        if (this.exists == false) {
            return false;
        }
        if (this._states) {
            return this._states.isDirectory();
        }
        return undefined;
    }
    /**
     * 扩展名
     *
     * @readonly
     * @type {string}
     * @memberof File
     */
    get extname() {
        let _name = this.nativePath;
        return _name.slice(_name.lastIndexOf(".")).toLocaleLowerCase();
    }
    /**
     * 扩展名
     *
     * @readonly
     * @type {string}
     * @memberof File
     */
    get unExtName() {
        return this.name.replace(this.extname, "");
    }
    /**
     * 父文件
     *
     * @readonly
     * @memberof File
     */
    get parent() {
        let path = $path.dirname(this.nativePath) + "/";
        return new File(path);
    }
    /**
     * 读文件
     *
     * @return {Uint8Array}
     * @memberof File
     */
    read() {
        let b = $fs.readFileSync(this.nativePath);
        return new Uint8Array(b.slice(0, b.length));
    }
    /**
     * 获取文件所在文件夹
     *
     * @readonly
     * @type {string}
     * @memberof File
     */
    get directory() {
        if (this.isFile()) {
            return $path.dirname(this.nativePath);
        }
        return this.nativePath;
    }
    /**
     * 使用特定格式读取文件
     *
     * @param {BufferEncoding} [encoding="utf-8"]
     * @return {*}  {string}
     * @memberof File
     */
    readUTF8(encoding = "utf-8") {
        if (!this.exists) {
            return "";
        }
        return $fs.readFileSync(this.nativePath, encoding);
    }
    /**
     * 创建文件夹
     *
     * @memberof File
     */
    mkdir() {
        if (this.exists == false) {
            this.parent.mkdir();
            $fs.mkdirSync(this.nativePath);
        }
    }
    /**
     * 写数据
     *
     * @param {Uint8Array} buf
     * @memberof File
     */
    write(buf) {
        let f = new File($path.dirname(this.nativePath) + "/");
        if (f.exists == false) {
            f.mkdir();
        }
        $fs.writeFileSync(this.nativePath, buf);
    }
    /**
     * 写数据
     *
     * @param {*} obj
     * @memberof File
     */
    writeObject(obj) {
        //this.write(amf_writeObject(obj));
    }
    /**
     * 相对路径
     *
     * @param {string} path
     * @return {*}
     * @memberof File
     */
    resolvePath(path) {
        var f;
        if (this.isFile() == true) {
            f = this.parent;
        }
        else {
            f = this;
        }
        if (path.indexOf(":/") != -1) {
            return new File(path);
        }
        return new File($path.join(f.nativePath, path));
    }
    /**
     * 获取所有文件
     *
     * @param {Nullable<string>} [ext=void 0]
     * @param {number} [deep=0]
     * @return {*}  {File[]}
     * @memberof File
     */
    getAllFiles(ext, deep = 0) {
        if (false == this.exists) {
            return [];
        }
        let path = this.nativePath;
        if (this.isFile() == true) {
            path = $path.dirname(path) + "/";
        }
        let result = [];
        let files = $fs.readdirSync(this.nativePath);
        files.forEach(file => {
            let f = new File(path + file);
            if (false == f.isFile()) {
                if (deep > 0) {
                    result = result.concat(f.getAllFiles(ext, deep--));
                }
                else if (deep <= -1) {
                    result = result.concat(f.getAllFiles(ext, deep));
                }
            }
            else {
                if (!ext || f.extname == ext) {
                    result.push(f);
                }
            }
        });
        return result;
    }
    /**
     * 文件拷贝
     *
     * @param {File} to
     * @memberof File
     */
    copyto(to) {
        if (to.exists == false) {
            let mk;
            if (to.name.indexOf(".") == -1) {
                mk = to;
            }
            else {
                mk = to.parent;
            }
            mk.mkdir();
        }
        to.write(this.read());
    }
    /**
     * 文件移动
     *
     * @param {File} to
     * @memberof File
     */
    moveto(to) {
        this.copyto(to);
        $fs.unlinkSync(this.nativePath);
    }
    /**
     * 文件删除
     *
     * @memberof File
     */
    delete() {
        if (this.exists) {
            let path = this.nativePath;
            if (this.isDirectory()) {
                let files = $fs.readdirSync(path);
                files.forEach((file, index) => {
                    let cf = this.resolvePath(file);
                    cf.delete();
                });
                $fs.rmdirSync(path);
            }
            else {
                $fs.unlinkSync(path);
            }
        }
    }
}
exports.File = File;
/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists(dir) {
    let isExists = await getStat(dir);
    // 如果该路径存在且不是文件，返回 true
    if (isExists && isExists.isDirectory()) {
        return true;
    }
    else if (isExists) { // 这个路径对应一个文件夹，无法再创建文件了
        return false;
    }
    // 如果该路径不存在
    let tempDir = $path.parse(dir).dir; //拿到上级路径
    // 递归判断，如果上级路径也不存在，则继续循环执行，直到存在
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if (status) {
        mkdirStatus = $fs.mkdirSync(dir);
    }
    return mkdirStatus;
}
exports.dirExists = dirExists;
/**
   * 读取路径信息
   * @param {string} filepath 路径
   */
function getStat(filePath) {
    return new Promise((resolve, reject) => {
        $fs.stat(filePath, (err, stats) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(stats);
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9jb21waWxlci9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0NBQTBCO0FBQzFCLDRDQUE4QjtBQUU5Qjs7Ozs7R0FLRztBQUNILE1BQWEsSUFBSTtJQUliOzs7O09BSUc7SUFDSCxZQUFtQixJQUFZO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFXLElBQUk7UUFDWCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzVCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQVcs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ZXNDb250ZW50IjpbImltcG9ydCAqIGFzICRmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzICRwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8qKlxuICog5paH5Lu2XG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEZpbGVcbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGUge1xuICAgIHByaXZhdGUgX3N0YXRlcyE6ICRmcy5TdGF0cztcbiAgICBwdWJsaWMgbmF0aXZlUGF0aDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBGaWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIOaWh+S7ti/mlofku7blpLnot6/lvoRcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5uYXRpdmVQYXRoID0gcGF0aCA9IHBhdGgucmVwbGFjZSgvXFxcXC9nLCBcIi9cIik7XG4gICAgICAgIGlmICh0aGlzLmV4aXN0cyA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZXMgPSAkZnMuc3RhdFN5bmModGhpcy5uYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRmlsZSgpID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdGhbcGF0aC5sZW5ndGggLSAxXSAhPSBcIi9cIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdGl2ZVBhdGggPSBwYXRoICsgXCIvXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5paH5Lu25ZCNXG4gICAgICpcbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBfbmFtZSA9IHRoaXMubmF0aXZlUGF0aDtcbiAgICAgICAgX25hbWUgPSBfbmFtZS5zbGljZShfbmFtZS5sYXN0SW5kZXhPZihcIi9cIiwgX25hbWUubGVuZ3RoIC0gMikpLnJlcGxhY2UoL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIF9uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaYr+WQpuWtmOWcqFxuICAgICAqXG4gICAgICogQHJlYWRvbmx5XG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGV4aXN0cygpIHtcbiAgICAgICAgcmV0dXJuICRmcy5leGlzdHNTeW5jKHRoaXMubmF0aXZlUGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5piv5ZCm5piv5paH5Lu2XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzID09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlcy5pc0ZpbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5piv5ZCm5piv5paH5Lu25aS5XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIGlzRGlyZWN0b3J5KCkge1xuICAgICAgICBpZiAodGhpcy5leGlzdHMgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZXMuaXNEaXJlY3RvcnkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omp5bGV5ZCNXG4gICAgICpcbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIGdldCBleHRuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBfbmFtZSA9IHRoaXMubmF0aXZlUGF0aDtcbiAgICAgICAgcmV0dXJuIF9uYW1lLnNsaWNlKF9uYW1lLmxhc3RJbmRleE9mKFwiLlwiKSkudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmianlsZXlkI1cbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHVuRXh0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZS5yZXBsYWNlKHRoaXMuZXh0bmFtZSwgXCJcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog54i25paH5Lu2XG4gICAgICpcbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGFyZW50KCkge1xuICAgICAgICBsZXQgcGF0aCA9ICRwYXRoLmRpcm5hbWUodGhpcy5uYXRpdmVQYXRoKSArIFwiL1wiO1xuICAgICAgICByZXR1cm4gbmV3IEZpbGUocGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6K+75paH5Lu2XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtVaW50OEFycmF5fVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIHJlYWQoKTogVWludDhBcnJheSB7XG4gICAgICAgIGxldCBiID0gJGZzLnJlYWRGaWxlU3luYyh0aGlzLm5hdGl2ZVBhdGgpIGFzIEJ1ZmZlcjtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGIuc2xpY2UoMCwgYi5sZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bmlofku7bmiYDlnKjmlofku7blpLlcbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuICRwYXRoLmRpcm5hbWUodGhpcy5uYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVQYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqOeJueWumuagvOW8j+ivu+WPluaWh+S7tlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCdWZmZXJFbmNvZGluZ30gW2VuY29kaW5nPVwidXRmLThcIl1cbiAgICAgKiBAcmV0dXJuIHsqfSAge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGOChlbmNvZGluZzogQnVmZmVyRW5jb2RpbmcgPSBcInV0Zi04XCIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuZXhpc3RzKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkZnMucmVhZEZpbGVTeW5jKHRoaXMubmF0aXZlUGF0aCwgZW5jb2RpbmcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWh+S7tuWkuVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgbWtkaXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmV4aXN0cyA9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQubWtkaXIoKTtcbiAgICAgICAgICAgICRmcy5ta2RpclN5bmModGhpcy5uYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWGmeaVsOaNrlxuICAgICAqXG4gICAgICogQHBhcmFtIHtVaW50OEFycmF5fSBidWZcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZShidWY6IFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgbGV0IGYgPSBuZXcgRmlsZSgkcGF0aC5kaXJuYW1lKHRoaXMubmF0aXZlUGF0aCkgKyBcIi9cIik7XG4gICAgICAgIGlmIChmLmV4aXN0cyA9PSBmYWxzZSkge1xuICAgICAgICAgICAgZi5ta2RpcigpO1xuICAgICAgICB9XG4gICAgICAgICRmcy53cml0ZUZpbGVTeW5jKHRoaXMubmF0aXZlUGF0aCwgYnVmKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlhpnmlbDmja5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVPYmplY3Qob2JqOiB1bmtub3duKSB7XG4gICAgICAgIC8vdGhpcy53cml0ZShhbWZfd3JpdGVPYmplY3Qob2JqKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog55u45a+56Lev5b6EXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQG1lbWJlcm9mIEZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzb2x2ZVBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHZhciBmOiBGaWxlO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSA9PSB0cnVlKSB7XG4gICAgICAgICAgICBmID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmID0gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoLmluZGV4T2YoXCI6L1wiKSAhPSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBGaWxlKCRwYXRoLmpvaW4oZi5uYXRpdmVQYXRoLCBwYXRoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5omA5pyJ5paH5Lu2XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bGxhYmxlPHN0cmluZz59IFtleHQ9dm9pZCAwXVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZGVlcD0wXVxuICAgICAqIEByZXR1cm4geyp9ICB7RmlsZVtdfVxuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIGdldEFsbEZpbGVzKGV4dD86IHN0cmluZywgZGVlcCA9IDApOiBGaWxlW10ge1xuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy5leGlzdHMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXRoID0gdGhpcy5uYXRpdmVQYXRoO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSA9PSB0cnVlKSB7XG4gICAgICAgICAgICBwYXRoID0gJHBhdGguZGlybmFtZShwYXRoKSArIFwiL1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdDogRmlsZVtdID0gW107XG4gICAgICAgIGxldCBmaWxlcyA9ICRmcy5yZWFkZGlyU3luYyh0aGlzLm5hdGl2ZVBhdGgpO1xuXG4gICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICBsZXQgZiA9IG5ldyBGaWxlKHBhdGggKyBmaWxlKTtcbiAgICAgICAgICAgIGlmIChmYWxzZSA9PSBmLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlZXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZi5nZXRBbGxGaWxlcyhleHQsIGRlZXAtLSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVlcCA8PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGYuZ2V0QWxsRmlsZXMoZXh0LCBkZWVwKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV4dCB8fCBmLmV4dG5hbWUgPT0gZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmlofku7bmi7fotJ1cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RmlsZX0gdG9cbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBjb3B5dG8odG86IEZpbGUpIHtcbiAgICAgICAgaWYgKHRvLmV4aXN0cyA9PSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IG1rOiBGaWxlO1xuICAgICAgICAgICAgaWYgKHRvLm5hbWUuaW5kZXhPZihcIi5cIikgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBtayA9IHRvO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtayA9IHRvLnBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1rLm1rZGlyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdG8ud3JpdGUodGhpcy5yZWFkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaWh+S7tuenu+WKqFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGaWxlfSB0b1xuICAgICAqIEBtZW1iZXJvZiBGaWxlXG4gICAgICovXG4gICAgcHVibGljIG1vdmV0byh0bzogRmlsZSkge1xuICAgICAgICB0aGlzLmNvcHl0byh0byk7XG4gICAgICAgICRmcy51bmxpbmtTeW5jKHRoaXMubmF0aXZlUGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5paH5Lu25Yig6ZmkXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBkZWxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmV4aXN0cykge1xuICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLm5hdGl2ZVBhdGg7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVzID0gJGZzLnJlYWRkaXJTeW5jKHBhdGgpO1xuICAgICAgICAgICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjZiA9IHRoaXMucmVzb2x2ZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNmLmRlbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRmcy5ybWRpclN5bmMocGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRmcy51bmxpbmtTeW5jKHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiDot6/lvoTmmK/lkKblrZjlnKjvvIzkuI3lrZjlnKjliJnliJvlu7pcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXIg6Lev5b6EXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXJFeGlzdHMoZGlyOiBzdHJpbmcpIHtcbiAgICBsZXQgaXNFeGlzdHMgPSBhd2FpdCBnZXRTdGF0KGRpcilcbiAgICAvLyDlpoLmnpzor6Xot6/lvoTlrZjlnKjkuJTkuI3mmK/mlofku7bvvIzov5Tlm54gdHJ1ZVxuICAgIGlmIChpc0V4aXN0cyAmJiAoaXNFeGlzdHMgYXMgJGZzLlN0YXRzKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIGlmIChpc0V4aXN0cykgeyAgLy8g6L+Z5Liq6Lev5b6E5a+55bqU5LiA5Liq5paH5Lu25aS577yM5peg5rOV5YaN5Yib5bu65paH5Lu25LqGXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvLyDlpoLmnpzor6Xot6/lvoTkuI3lrZjlnKhcbiAgICBsZXQgdGVtcERpciA9ICRwYXRoLnBhcnNlKGRpcikuZGlyOyAgLy/mi7/liLDkuIrnuqfot6/lvoRcbiAgICAvLyDpgJLlvZLliKTmlq3vvIzlpoLmnpzkuIrnuqfot6/lvoTkuZ/kuI3lrZjlnKjvvIzliJnnu6fnu63lvqrnjq/miafooYzvvIznm7TliLDlrZjlnKhcbiAgICBsZXQgc3RhdHVzID0gYXdhaXQgZGlyRXhpc3RzKHRlbXBEaXIpXG4gICAgbGV0IG1rZGlyU3RhdHVzXG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgICBta2RpclN0YXR1cyA9ICRmcy5ta2RpclN5bmMoZGlyKTtcbiAgICB9XG4gICAgcmV0dXJuIG1rZGlyU3RhdHVzXG59XG5cbi8qKlxuICAgKiDor7vlj5bot6/lvoTkv6Hmga9cbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIOi3r+W+hFxuICAgKi9cbmZ1bmN0aW9uIGdldFN0YXQoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTwkZnMuU3RhdHMgfCBib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICRmcy5zdGF0KGZpbGVQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc3RhdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0pXG59Il19