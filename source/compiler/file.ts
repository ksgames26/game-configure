import * as $fs from "fs";
import * as $path from "path";

/**
 * 文件
 *
 * @export
 * @class File
 */
export class File {
    private _states!: $fs.Stats;
    public nativePath: string;

    /**
     * Creates an instance of File.
     * @param {string} path 文件/文件夹路径
     * @memberof File
     */
    public constructor(path: string) {
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
    public get name(): string {
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
    public get exists() {
        return $fs.existsSync(this.nativePath);
    }

    /**
     * 是否是文件
     *
     * @return {*}
     * @memberof File
     */
    public isFile() {
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
    public isDirectory() {
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
    public get extname(): string {
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
    public get unExtName() {
        return this.name.replace(this.extname, "");
    }

    /**
     * 父文件
     *
     * @readonly
     * @memberof File
     */
    public get parent() {
        let path = $path.dirname(this.nativePath) + "/";
        return new File(path);
    }

    /**
     * 读文件
     *
     * @return {Uint8Array}
     * @memberof File
     */
    public read(): Uint8Array {
        let b = $fs.readFileSync(this.nativePath) as Buffer;
        return new Uint8Array(b.slice(0, b.length));
    }

    /**
     * 获取文件所在文件夹
     *
     * @readonly
     * @type {string}
     * @memberof File
     */
    public get directory(): string {
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
    public readUTF8(encoding: BufferEncoding = "utf-8"): string {
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
    public mkdir() {
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
    public write(buf: Uint8Array) {
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
    public writeObject(obj: unknown) {
        //this.write(amf_writeObject(obj));
    }

    /**
     * 相对路径
     *
     * @param {string} path
     * @return {*}
     * @memberof File
     */
    public resolvePath(path: string) {
        var f: File;
        if (this.isFile() == true) {
            f = this.parent;
        } else {
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
    public getAllFiles(ext?: string, deep = 0): File[] {
        if (false == this.exists) {
            return [];
        }

        let path = this.nativePath;
        if (this.isFile() == true) {
            path = $path.dirname(path) + "/";
        }

        let result: File[] = [];
        let files = $fs.readdirSync(this.nativePath);

        files.forEach(file => {
            let f = new File(path + file);
            if (false == f.isFile()) {
                if (deep > 0) {
                    result = result.concat(f.getAllFiles(ext, deep--));
                } else if (deep <= -1) {
                    result = result.concat(f.getAllFiles(ext, deep));
                }
            } else {
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
    public copyto(to: File) {
        if (to.exists == false) {
            let mk: File;
            if (to.name.indexOf(".") == -1) {
                mk = to;
            } else {
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
    public moveto(to: File) {
        this.copyto(to);
        $fs.unlinkSync(this.nativePath);
    }

    /**
     * 文件删除
     *
     * @memberof File
     */
    public delete() {
        if (this.exists) {
            let path = this.nativePath;
            if (this.isDirectory()) {
                let files = $fs.readdirSync(path);
                files.forEach((file, index) => {
                    let cf = this.resolvePath(file);
                    cf.delete();
                });
                $fs.rmdirSync(path);
            } else {
                $fs.unlinkSync(path);
            }
        }
    }
}
/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
export async function dirExists(dir: string) {
    let isExists = await getStat(dir)
    // 如果该路径存在且不是文件，返回 true
    if (isExists && (isExists as $fs.Stats).isDirectory()) {
        return true
    } else if (isExists) {  // 这个路径对应一个文件夹，无法再创建文件了
        return false
    }
    // 如果该路径不存在
    let tempDir = $path.parse(dir).dir;  //拿到上级路径
    // 递归判断，如果上级路径也不存在，则继续循环执行，直到存在
    let status = await dirExists(tempDir)
    let mkdirStatus
    if (status) {
        mkdirStatus = $fs.mkdirSync(dir);
    }
    return mkdirStatus
}

/**
   * 读取路径信息
   * @param {string} filepath 路径
   */
function getStat(filePath: string) {
    return new Promise<$fs.Stats | boolean>((resolve, reject) => {
        $fs.stat(filePath, (err, stats) => {
            if (err) {
                resolve(false)
            } else {
                resolve(stats);
            }
        })
    })
}