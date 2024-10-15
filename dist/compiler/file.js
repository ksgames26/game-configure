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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9jb21waWxlci9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0NBQTBCO0FBQzFCLDRDQUE4QjtBQUU5Qjs7Ozs7R0FLRztBQUNILE1BQWEsSUFBSTtJQUliOzs7O09BSUc7SUFDSCxZQUFtQixJQUFZO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFXLElBQUk7UUFDWCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzVCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQVcs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ZXNDb250ZW50IjpbImltcG9ydCAqIGFzICRmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0ICogYXMgJHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbi8qKlxyXG4gKiDmlofku7ZcclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAY2xhc3MgRmlsZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZpbGUge1xyXG4gICAgcHJpdmF0ZSBfc3RhdGVzITogJGZzLlN0YXRzO1xyXG4gICAgcHVibGljIG5hdGl2ZVBhdGg6IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRmlsZS5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIOaWh+S7ti/mlofku7blpLnot6/lvoRcclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hdGl2ZVBhdGggPSBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgICAgICBpZiAodGhpcy5leGlzdHMgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZXMgPSAkZnMuc3RhdFN5bmModGhpcy5uYXRpdmVQYXRoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNGaWxlKCkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXRoW3BhdGgubGVuZ3RoIC0gMV0gIT0gXCIvXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdGl2ZVBhdGggPSBwYXRoICsgXCIvXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmlofku7blkI1cclxuICAgICAqXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgX25hbWUgPSB0aGlzLm5hdGl2ZVBhdGg7XHJcbiAgICAgICAgX25hbWUgPSBfbmFtZS5zbGljZShfbmFtZS5sYXN0SW5kZXhPZihcIi9cIiwgX25hbWUubGVuZ3RoIC0gMikpLnJlcGxhY2UoL1xcLy9nLCBcIlwiKTtcclxuICAgICAgICByZXR1cm4gX25hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKblrZjlnKhcclxuICAgICAqXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZXhpc3RzKCkge1xyXG4gICAgICAgIHJldHVybiAkZnMuZXhpc3RzU3luYyh0aGlzLm5hdGl2ZVBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5piv5paH5Lu2XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Kn1cclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGVzLmlzRmlsZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuaYr+aWh+S7tuWkuVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4geyp9XHJcbiAgICAgKiBAbWVtYmVyb2YgRmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaXNEaXJlY3RvcnkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlcy5pc0RpcmVjdG9yeSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJqeWxleWQjVxyXG4gICAgICpcclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZXh0bmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBfbmFtZSA9IHRoaXMubmF0aXZlUGF0aDtcclxuICAgICAgICByZXR1cm4gX25hbWUuc2xpY2UoX25hbWUubGFzdEluZGV4T2YoXCIuXCIpKS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5omp5bGV5ZCNXHJcbiAgICAgKlxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB1bkV4dE5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZS5yZXBsYWNlKHRoaXMuZXh0bmFtZSwgXCJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDniLbmlofku7ZcclxuICAgICAqXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcGFyZW50KCkge1xyXG4gICAgICAgIGxldCBwYXRoID0gJHBhdGguZGlybmFtZSh0aGlzLm5hdGl2ZVBhdGgpICsgXCIvXCI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K+75paH5Lu2XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7VWludDhBcnJheX1cclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZWFkKCk6IFVpbnQ4QXJyYXkge1xyXG4gICAgICAgIGxldCBiID0gJGZzLnJlYWRGaWxlU3luYyh0aGlzLm5hdGl2ZVBhdGgpIGFzIEJ1ZmZlcjtcclxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5zbGljZSgwLCBiLmxlbmd0aCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5paH5Lu25omA5Zyo5paH5Lu25aS5XHJcbiAgICAgKlxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBkaXJlY3RvcnkoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHBhdGguZGlybmFtZSh0aGlzLm5hdGl2ZVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVQYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L2/55So54m55a6a5qC85byP6K+75Y+W5paH5Lu2XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtCdWZmZXJFbmNvZGluZ30gW2VuY29kaW5nPVwidXRmLThcIl1cclxuICAgICAqIEByZXR1cm4geyp9ICB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlYWRVVEY4KGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyA9IFwidXRmLThcIik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmV4aXN0cykge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAkZnMucmVhZEZpbGVTeW5jKHRoaXMubmF0aXZlUGF0aCwgZW5jb2RpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paH5Lu25aS5XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1rZGlyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmV4aXN0cyA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5ta2RpcigpO1xyXG4gICAgICAgICAgICAkZnMubWtkaXJTeW5jKHRoaXMubmF0aXZlUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaZ5pWw5o2uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtVaW50OEFycmF5fSBidWZcclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3cml0ZShidWY6IFVpbnQ4QXJyYXkpIHtcclxuICAgICAgICBsZXQgZiA9IG5ldyBGaWxlKCRwYXRoLmRpcm5hbWUodGhpcy5uYXRpdmVQYXRoKSArIFwiL1wiKTtcclxuICAgICAgICBpZiAoZi5leGlzdHMgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgZi5ta2RpcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkZnMud3JpdGVGaWxlU3luYyh0aGlzLm5hdGl2ZVBhdGgsIGJ1Zik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhpnmlbDmja5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IG9ialxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHdyaXRlT2JqZWN0KG9iajogdW5rbm93bikge1xyXG4gICAgICAgIC8vdGhpcy53cml0ZShhbWZfd3JpdGVPYmplY3Qob2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnm7jlr7not6/lvoRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG4gICAgICogQHJldHVybiB7Kn1cclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNvbHZlUGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICB2YXIgZjogRmlsZTtcclxuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGYgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmID0gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXRoLmluZGV4T2YoXCI6L1wiKSAhPSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUocGF0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IEZpbGUoJHBhdGguam9pbihmLm5hdGl2ZVBhdGgsIHBhdGgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaJgOacieaWh+S7tlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TnVsbGFibGU8c3RyaW5nPn0gW2V4dD12b2lkIDBdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2RlZXA9MF1cclxuICAgICAqIEByZXR1cm4geyp9ICB7RmlsZVtdfVxyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEFsbEZpbGVzKGV4dD86IHN0cmluZywgZGVlcCA9IDApOiBGaWxlW10ge1xyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLmV4aXN0cykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGF0aCA9IHRoaXMubmF0aXZlUGF0aDtcclxuICAgICAgICBpZiAodGhpcy5pc0ZpbGUoKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHBhdGggPSAkcGF0aC5kaXJuYW1lKHBhdGgpICsgXCIvXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBGaWxlW10gPSBbXTtcclxuICAgICAgICBsZXQgZmlsZXMgPSAkZnMucmVhZGRpclN5bmModGhpcy5uYXRpdmVQYXRoKTtcclxuXHJcbiAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgbGV0IGYgPSBuZXcgRmlsZShwYXRoICsgZmlsZSk7XHJcbiAgICAgICAgICAgIGlmIChmYWxzZSA9PSBmLmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVlcCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGYuZ2V0QWxsRmlsZXMoZXh0LCBkZWVwLS0pKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVlcCA8PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZi5nZXRBbGxGaWxlcyhleHQsIGRlZXApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghZXh0IHx8IGYuZXh0bmFtZSA9PSBleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5paH5Lu25ou36LSdXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGaWxlfSB0b1xyXG4gICAgICogQG1lbWJlcm9mIEZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvcHl0byh0bzogRmlsZSkge1xyXG4gICAgICAgIGlmICh0by5leGlzdHMgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgbGV0IG1rOiBGaWxlO1xyXG4gICAgICAgICAgICBpZiAodG8ubmFtZS5pbmRleE9mKFwiLlwiKSA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgbWsgPSB0bztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1rID0gdG8ucGFyZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1rLm1rZGlyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRvLndyaXRlKHRoaXMucmVhZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaWh+S7tuenu+WKqFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RmlsZX0gdG9cclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtb3ZldG8odG86IEZpbGUpIHtcclxuICAgICAgICB0aGlzLmNvcHl0byh0byk7XHJcbiAgICAgICAgJGZzLnVubGlua1N5bmModGhpcy5uYXRpdmVQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaWh+S7tuWIoOmZpFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJvZiBGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZWxldGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXRoID0gdGhpcy5uYXRpdmVQYXRoO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlsZXMgPSAkZnMucmVhZGRpclN5bmMocGF0aCk7XHJcbiAgICAgICAgICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZiA9IHRoaXMucmVzb2x2ZVBhdGgoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2YuZGVsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRmcy5ybWRpclN5bmMocGF0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkZnMudW5saW5rU3luYyhwYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICog6Lev5b6E5piv5ZCm5a2Y5Zyo77yM5LiN5a2Y5Zyo5YiZ5Yib5bu6XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXIg6Lev5b6EXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlyRXhpc3RzKGRpcjogc3RyaW5nKSB7XHJcbiAgICBsZXQgaXNFeGlzdHMgPSBhd2FpdCBnZXRTdGF0KGRpcilcclxuICAgIC8vIOWmguaenOivpei3r+W+hOWtmOWcqOS4lOS4jeaYr+aWh+S7tu+8jOi/lOWbniB0cnVlXHJcbiAgICBpZiAoaXNFeGlzdHMgJiYgKGlzRXhpc3RzIGFzICRmcy5TdGF0cykuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9IGVsc2UgaWYgKGlzRXhpc3RzKSB7ICAvLyDov5nkuKrot6/lvoTlr7nlupTkuIDkuKrmlofku7blpLnvvIzml6Dms5Xlho3liJvlu7rmlofku7bkuoZcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIC8vIOWmguaenOivpei3r+W+hOS4jeWtmOWcqFxyXG4gICAgbGV0IHRlbXBEaXIgPSAkcGF0aC5wYXJzZShkaXIpLmRpcjsgIC8v5ou/5Yiw5LiK57qn6Lev5b6EXHJcbiAgICAvLyDpgJLlvZLliKTmlq3vvIzlpoLmnpzkuIrnuqfot6/lvoTkuZ/kuI3lrZjlnKjvvIzliJnnu6fnu63lvqrnjq/miafooYzvvIznm7TliLDlrZjlnKhcclxuICAgIGxldCBzdGF0dXMgPSBhd2FpdCBkaXJFeGlzdHModGVtcERpcilcclxuICAgIGxldCBta2RpclN0YXR1c1xyXG4gICAgaWYgKHN0YXR1cykge1xyXG4gICAgICAgIG1rZGlyU3RhdHVzID0gJGZzLm1rZGlyU3luYyhkaXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1rZGlyU3RhdHVzXHJcbn1cclxuXHJcbi8qKlxyXG4gICAqIOivu+WPlui3r+W+hOS/oeaBr1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlcGF0aCDot6/lvoRcclxuICAgKi9cclxuZnVuY3Rpb24gZ2V0U3RhdChmaWxlUGF0aDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8JGZzLlN0YXRzIHwgYm9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICRmcy5zdGF0KGZpbGVQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShzdGF0cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufSJdfQ==