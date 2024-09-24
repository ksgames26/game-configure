/**
 *
 *  @see https://ts-ast-viewer.com/
 *
 *  用来打包Excel到Protobuf
 *
 */


import { MessageType, RepeatType } from "@protobuf-ts/runtime";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import {
    ClassDeclarationStructure,
    CodeBlockWriter,
    ConstructorDeclaration,
    EnumDeclarationStructure,
    EnumMemberStructure,
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    Project,
    PropertySignatureStructure,
    SourceFile,
    VariableDeclarationKind,
    VariableStatementStructure,
    ts
} from "ts-morph";
import { Script, createContext } from "vm";
import { File, dirExists } from "./file";

import xlsx from "xlsx";
import { Byte } from "./byte";
import { compile } from "./compiler";
import { Expressions, ExpressionsHandler } from "./expressions";
import { KeyWords, PQInput, PQWorkBook, ProtoBufScalarType, ScalarTypeValue } from "./work-book";
export const assert = function (condition: boolean, message: string) {
    if (condition) {
        throw new Error(message);
    }
};

class Container {
    public static getInterface(iface: string) { }
}

const director = {
    on() { }
}

const msg = "QN=20160801085857223;ST=32;CN=1062;PW=100000;MN=010000A8900016F000169DC0;Flag=5;CP=&&RtdInterval=30&&";

function crc32(str: string) {
    function Utf8Encode(string: string) {
        string = string.replace(/\r\n/g, "\n");

        var utftext = "";

        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192);

                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);

                utftext += String.fromCharCode(((c >> 6) & 63) | 128);

                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    }

    str = Utf8Encode(str);
    let crc = 0;

    var table =
        "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

    if (typeof crc == "undefined") {
        crc = 0;
    }

    var x: string | number = 0;

    var y = 0;

    crc = crc ^ -1;

    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xff;

        x = "0x" + table.substr(y * 9, 8);

        crc = (crc >>> 8) ^ ((x as unknown) as number);
    }

    // console.log(crc ^ -1);

    // @see https://segmentfault.com/q/1010000012003675
    return crc ^ -1 + 0xffffffff;
}

/**
 * 打包方式
 */
export const enum PACKER {
    /**
     *  数组打包
     */
    LIST,

    /**
     *  HashMap打包
     */
    MAP,

    /**
     * 键值对打包
     */
    KV,
}

//let id = 10000;
const idMap = new Map<string, string>();
const generatorProtoID = (name: string) => idMap.get(name) ?? idMap.set(name, crc32(name).toString()).get(name)!;

interface Dict {
    [key: string]: any;
}

/**
 * 首字母大写
 *
 * @param {string} str
 */
const firstUpperCase = (str: string) => str.replace(str[0], str[0].toUpperCase());//str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());

const nameJoin = (old: string) => {
    // 首字母小写
    old = old.replace(old[0], old[0].toLowerCase());

    // 然后开始拼接
    const stringArray = old.split('');
    let newField = old;
    stringArray.forEach(t => {
        if (/[A-Z]/.test(t)) {
            newField = newField.replace(t, `-${t.toLowerCase()}`)
        }
    });
    return newField;
}

/**
 * 提取括号内的值
 *
 * @param {string} str
 */
const valueOfPattern = (str: string) => str.match(/(?<=\().*(?=\))/g);

/**
 * 获取装箱拆箱阶段的实际类型
 *
 * @param {ProtoBufScalarType} t
 * @return {*}  {string}
 */
const getProtoBufType = function (t: ProtoBufScalarType): string {
    let t1 = "";
    switch (t) {
        case "double":
            t1 = `${ScalarTypeValue.DOUBLE} /*${KeyWords.ScalarType}.${ScalarType.DOUBLE}*/`;
            break;
        case "float":
            t1 = `${ScalarTypeValue.FLOAT}  /*${KeyWords.ScalarType}.${ScalarType.FLOAT}*/`;
            break;
        case "int32":
            t1 = `${ScalarTypeValue.INT32}  /*${KeyWords.ScalarType}.${ScalarType.INT32}*/`;
            break;
        case "int64":
            t1 = `${ScalarTypeValue.INT64}  /*${KeyWords.ScalarType}.${ScalarType.INT64}*/`;
            break;
        case "uint32":
            t1 = `${ScalarTypeValue.UINT32} /*${KeyWords.ScalarType}.${ScalarType.UINT32}*/`;
            break;
        case "uint64":
            t1 = `${ScalarTypeValue.UINT64} /*${KeyWords.ScalarType}.${ScalarType.UINT64}*/`;
            break;
        case "sint32":
            t1 = `${ScalarTypeValue.SINT32} /*${KeyWords.ScalarType}.${ScalarType.SINT32}*/`;
            break;
        case "sint64":
            t1 = `${ScalarTypeValue.SINT64} /*${KeyWords.ScalarType}.${ScalarType.SINT64}*/`;
            break;
        case "fixed32":
            t1 = `${ScalarTypeValue.FIXED32} /*${KeyWords.ScalarType}.${ScalarType.FIXED32}*/`;
            break;
        case "fixed64":
            t1 = `${ScalarTypeValue.FIXED64} /*${KeyWords.ScalarType}.${ScalarType.FIXED64}*/`;
            break;
        case "sfixed32":
            t1 = `${ScalarTypeValue.SFIXED32} /*${KeyWords.ScalarType}.${ScalarType.SFIXED32}*/`;
            break;
        case "sfixed64":
            t1 = `${ScalarTypeValue.SFIXED64} /*${KeyWords.ScalarType}.${ScalarType.SFIXED64}*/`;
            break;
        case "bool":
            t1 = `${ScalarTypeValue.BOOL} /*${KeyWords.ScalarType}.${ScalarType.BOOL}*/`;
            break;
        case "string":
            t1 = `${ScalarTypeValue.STRING} /*${KeyWords.ScalarType}.${ScalarType.STRING}*/`;
            break;
        case "bytes":
            t1 = `${ScalarTypeValue.BYTES} /*${KeyWords.ScalarType}.${ScalarType.BYTES}*/`;
            break;
        // 限制类型
        case "limit":
        // 函数类型
        case "fn":
        // 条件类型
        case "condition":
        // 公式类型
        case "formula":
            t1 = `() => ExpressionsHandler`;
            break;
        default:
            const str = t as string;
            let value = getValue(str);

            if (!value) {
                const isArray = str.endsWith("[]");
                if (isArray) {
                    return getProtoBufType(str.replace("[]", "") as ProtoBufScalarType);
                }

                throw new Error("类型不支持");
            }

            if (str.startsWith(KeyWords.Object)) {
                return `() => ${firstUpperCase(value)}`;
            } else {
                return `() => ["${firstUpperCase(value)}",${firstUpperCase(value)}]`;
            }
    }
    return t1;
};

/**
 * 获取装箱拆箱阶段的类型类型
 *
 * @param {ProtoBufScalarType} t
 * @return {*}  {("scalar" | "message" | "enum" | "map")}
 */
const getProtoBufScalarType = function (t: ProtoBufScalarType): "scalar" | "message" | "enum" | "map" {
    let t1 = "" as "scalar" | "message" | "enum" | "map";
    switch (t) {
        case "double":
        case "float":
        case "int32":
        case "int64":
        case "uint32":
        case "uint64":
        case "sint32":
        case "sint64":
        case "fixed32":
        case "fixed64":
        case "sfixed32":
        case "sfixed64":
        case "bool":
        case "string":
            t1 = "scalar";
            break;
        case "limit":
        // 限制类型
        case "bytes":
        // 函数类型
        case "fn":
        // 条件类型
        case "condition":
        // 公式类型
        case "formula":
            t1 = "message";
            break;
        default:
            const str = t as string;
            if (str.startsWith(KeyWords.Object)) {
                t1 = "message";
            } else if (str.endsWith("[]")) {
                t1 = getProtoBufScalarType(str.replace("[]", "") as ProtoBufScalarType);
            } else {
                t1 = "enum";
            }
            break;
    }
    return t1;
};

const scalar_no_repeat = (
    no: number,
    name: string,
    kind: "scalar" | "message" | "enum" | "map",
    type: ProtoBufScalarType,
) => `{ no:${no},name:"${name}",kind:"${kind}",T:${getProtoBufType(type)}}`;
const scalar_repeat = (
    no: number,
    name: string,
    kind: "scalar" | "message" | "enum" | "map",
    type: ProtoBufScalarType,
) => {
    if (type.startsWith("string")) {
        return `{ no:${no},name:"${name}",kind:"${kind}",repeat:${RepeatType.UNPACKED
            } /*RepeatType.UNPACKED*/,T:${getProtoBufType(type)}}`;
    } else {
        return `{ no:${no},name:"${name}",kind:"${kind}",repeat:${RepeatType.PACKED
            } /*RepeatType.PACKED*/,T:${getProtoBufType(type)}}`;
    }
};
const scalar = (
    no: number,
    name: string,
    kind: "scalar" | "message" | "enum" | "map",
    repeat: boolean,
    type: ProtoBufScalarType,
) => (repeat ? scalar_repeat(no, name, kind, type) : scalar_no_repeat(no, name, kind, type));

const enum ScalarType {
    DOUBLE = "DOUBLE",
    FLOAT = "FLOAT",
    INT64 = "INT64",
    UINT64 = "UINT64",
    INT32 = "INT32",
    FIXED64 = "FIXED64",
    FIXED32 = "FIXED32",
    BOOL = "BOOL",
    STRING = "STRING",
    BYTES = "BYTES",
    UINT32 = "UINT32",
    SFIXED32 = "SFIXED32",
    SFIXED64 = "SFIXED64",
    SINT32 = "SINT32",
    SINT64 = "SINT64",
}

const charToNum = function (val: string) {
    let base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let baseNumber = base.length;

    let runningTotal = 0;
    let characterIndex = 0;
    let indexExponent = val.length - 1;

    while (characterIndex < val.length) {
        let digit = val[characterIndex];
        let digitValue = base.indexOf(digit) + 1;
        runningTotal += Math.pow(baseNumber, indexExponent) * digitValue;

        characterIndex += 1;
        indexExponent -= 1;
    }

    return runningTotal;
};

const numToChar = function (number: number): string {
    let numeric = (number - 1) % 26;
    let letter = chr(65 + numeric);
    //@ts-ignore
    let number2 = parseInt((number - 1) / 26);
    if (number2 > 0) {
        return numToChar(number2) + letter;
    } else {
        return letter;
    }
};

const chr = function (codePt: number) {
    if (codePt > 0xffff) {
        codePt -= 0x10000;
        return String.fromCharCode(0xd800 + (codePt >> 10), 0xdc00 + (codePt & 0x3ff));
    }
    return String.fromCharCode(codePt);
};

const stox = function stox(wb: xlsx.WorkBook, f: string): Map<string, PQWorkBook> | null {
    let out = new Map<string, PQWorkBook>();
    for (let name in wb.Sheets) {
        // sheet 名称
        const o = { name: name, rows: {}, merges: [], types: [] } as any;

        // merges: [
        //  'A1:F11',
        //  ...
        // ],

        // sheet 内容
        const value = wb.Sheets[name];
        const merges = value["!merges"];

        if (merges) {
            merges.forEach(merge => {
                let s = merge.s;
                let e = merge.e;
                o.merges.push(`${numToChar(s.c + 1)}${s.r + 1}:${numToChar(e.c + 1)}${e.r + 1}`);
            });
        }

        // 说明是个空sheet
        if (!value["!ref"]) {
            console.log("异常:配置有空sheet", f);
            return null;
        }

        //@ts-ignore
        const ref = value["!ref"].split(":");
        // ref value like "A2:L11"

        // 提取row
        const max_row = ref[1].match(/[A-Z]/g)!.join("");

        // 提取col
        const max_col = +ref[1].match(/[0-9]/gi)!.join("");
        const max_row_value = charToNum(max_row);

        // 需要的json必须外层是rows,内层是cells
        for (let i = 1, l = max_col; i <= l; i++) {
            let cells = {} as any;
            for (let j = 1, len = max_row_value; j <= len; j++) {
                let key = numToChar(j) + i;
                const cell = value[key];

                // 关键描述
                // v 原始值（详见数据类型部分）
                // w 格式化文本（如适用）
                // t 类型：b布尔值，e错误，n数字，d日期，s文本，z存根
                // f 单元格公式编码为A1样式的字符串（如果适用）
                // F 如果公式是数组公式，则包围数组的范围（如果适用）
                // r 富文本编码(如果适用)
                // h 丰富文本的HTML渲染（如适用）
                // c 与该电池有关的评论
                // z 与单元格相关联的数字格式字符串（如果要求）
                // l 单元格超链接对象（.Target为链接，.Tooltip为工具提示）
                // s 是单元格的风格/主题（如果适用）

                if (cell) {
                    cells[j - 1] = { text: cell.v };
                }
            }
            o.rows[i - 1] = { cells: cells };

            // 索引ID为4的代表类型
            if (i - 1 == 4) {
                // 索引ID为3的代表属性名称
                const vn = o.rows[3].cells;
                // 索引ID为4的代表属性类型
                const vt = o.rows[4].cells;
                for (let k in vt) {
                    if (+k != 0) {
                        o.types.push({
                            indx: k,
                            name: vn[k].text,
                            type: vt[k].text,
                        });
                    }
                }
            }
        }
        out.set(name, o);
    }
    return out!;
};

const getValue = (t: string) => {
    if (t.startsWith("object") || t.startsWith("enum")) {
        const name = valueOfPattern(t);
        if (!name || name!.length <= 0) {
            console.log("对象表达式错误");
            return;
        }

        return name![0];
    }
};

class ReadExcelType {
    public re: ReadExcel;
    public main: PQWorkBook;

    /**
     * 成员注释
     *
     * @type {((string | number)[])}
     * @memberof ReadExcelType
     */
    public docs!: (string | number)[];

    /**
     * 成员类型
     *
     * @type {((string | number)[])}
     * @memberof ReadExcelType
     */
    public types!: (string | number)[];

    /**
     * 成员名称
     *
     * @type {((string | number)[])}
     * @memberof ReadExcelType
     */
    public names!: (string | number)[];

    /**
     * 打包解包类型信息
     *
     * @type {((string | number)[])}
     * @memberof ReadExcelType
     */
    public packs!: (string | number)[];

    public mod!: Map<string, string>;

    /**
     * 解析好的对象/枚举类型
     */
    public oe: Map<string, ReadExcel>;

    public constructor(re: ReadExcel, main: PQWorkBook) {
        this.re = re;
        this.main = main;
        this.oe = new Map();
        this.mod = new Map();
        this.makeType();
    }

    public makeType() {
        const wb = this.main;
        const docs = wb.rows[1].cells;
        const names = wb.rows[3].cells;
        const types = wb.rows[4].cells;
        const packs = wb.rows[5].cells;

        const docs_texts: (string | number)[] = [];
        for (let key in docs) {
            docs_texts.push(docs[key].text);
        }

        const name_texts: (string | number)[] = [];
        for (let key in names) {
            name_texts.push(names[key].text);
        }

        const type_texts = [];
        for (let key in types) {
            type_texts.push(types[key].text);
        }

        const pack_texts = [];
        for (let key in packs) {
            pack_texts.push(packs[key].text);
        }

        this.docs = docs_texts;
        this.types = type_texts;
        this.names = name_texts;
        this.packs = pack_texts;

        switch (this.packs[0]) {
            case KeyWords.PACKER_KV:
                const idx = this.packs.indexOf(KeyWords.IDOBJ);

                if (idx >= 0) {
                    for (let i in wb.rows) {
                        if (+i <= 5) {
                            continue;
                        }
                        const cells = wb.rows[i].cells;
                        const k = cells[1].text;
                        if (k) {
                            this.mod.set(k as string, generatorProtoID(k as string));
                        }
                    }
                }

                break;
        }
    }

    public parse(): void {
        for (let i = 1, l = this.types.length; i < l; i++) {
            const t = this.types[i] as string;
            const name = getValue(t);
            this.parseObject(name!);
        }
    }

    public parseObject(name: string): void {
        if (!name) {
            return;
        }

        const sheet = this.re.wbs.get(name)!;
        if (!sheet) {
            console.log("对象表达式错误");
            return;
        }

        const re = new SubReadExcel(name, sheet, this);
        re.parse();
        this.oe.set(name, re);
    }
}

class ReadExcel {
    /**
     * excel文件位置
     *
     * @private
     * @type {File}
     * @memberof Read
     */
    private _url!: File;
    private _out!: File;

    /**
     * excel数据解构
     *
     * @private
     * @type {xlsx.WorkBook}
     * @memberof Read
     */
    private _ws!: xlsx.WorkBook;

    /**
     * 解析出来的json数据解构
     *
     * @private
     * @type {PQWorkBook[]}
     * @memberof Read
     */
    public main!: PQWorkBook;
    public wbs!: Map<string, PQWorkBook>;

    public sls!: Map<string, ReadExcel>;

    /**
     * excel 对应的接口名
     *
     * @private
     * @type {string}
     * @memberof Read
     */
    public interfaceName!: string;

    /**
     * 项目
     *
     * @private
     * @type {Project}
     * @memberof Read
     */
    public project!: Project;

    /**
     * 类型解包器
     *
     * @type {ReadExcelType}
     * @memberof ReadExcel
     */
    public types!: ReadExcelType;

    /**
     * 源文件
     *
     * @type {SourceFile}
     * @memberof ReadExcel
     */
    public sf!: SourceFile;

    /**
     * 打包后的数据(body)
     *
     * @type {Uint8Array}
     * @memberof ReadExcel
     */
    public buffer!: Uint8Array;

    public fileName!: string;

    public kvKeyType!: string;
    public kvKey!: string;

    public constructor(url?: File, p?: Project, out?: File) {
        if (url == null) {
            return;
        }
        this.project = p!;
        this._out = out!;
        this._url = url;
        this.sls = new Map<string, ReadExcel>();
        this.interfaceName = firstUpperCase(url.unExtName);
        this.addReadExcel("main", this);
    }

    public addReadExcel(name: string, read: ReadExcel): void {
        this.sls.set(name, read);
    }

    public read(): void {
        this._ws = xlsx.readFile(this._url.nativePath);
    }

    public parse(): void {
        this.wbs = stox(this._ws, this._url.name)!;

        this.fileName = nameJoin(this._url.unExtName);
        if (existsSync(`${this._out.nativePath}/${this.fileName}.ts`)) {
            unlinkSync(`${this._out.nativePath}/${this.fileName}.ts`);
        }

        const sf = this.project.createSourceFile(`${this._out.nativePath}/${this.fileName}.ts`, "");
        this.sf = sf;

        this.main = this.wbs.get("main")!;
        this.types = new ReadExcelType(this, this.main);
        this.types.parse();

        this.createInterface();
    }

    public global(w: CodeBlockWriter): void {
        const sf = this.sf;
        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        // 看看类型
        switch (packer[0].text) {
            case KeyWords.PACKER_LIST:
                w.write(this.interfaceName);
                w.write(":");
                w.write(firstUpperCase(this.interfaceName));
                w.write("[]");
                break;
            case KeyWords.PACKER_MAP:
                w.write(this.interfaceName);
                w.write(":");
                w.write(`Record<${this.kvKeyType},`);
                w.write(firstUpperCase(this.interfaceName));
                w.write(">");
                break;
            case KeyWords.PACKER_ENUM:
                break;
            case KeyWords.PACKER_KV:
                w.write(this.interfaceName);
                w.write(":");
                w.write(firstUpperCase(this.interfaceName));
                break;
            default:
                console.log("除一维打包方式外,暂不支持其他打包方式");
        }
    }

    protected createInterface(): void {
        const sf = this.sf;
        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        // 看看类型
        switch (packer[0].text) {
            case KeyWords.PACKER_LIST:
            case KeyWords.PACKER_MAP:
                this.createLM(sf);
                break;
            case KeyWords.PACKER_ENUM:
                this.createEnum(sf);
                break;
            case KeyWords.PACKER_KV:
                this.createKV(sf);
                this.createClientKV(sf);
                break;
            default:
                console.log("除一维打包方式外,暂不支持其他打包方式");
        }
    }

    protected createClientKV(sf: SourceFile) {
        const packs = this.types.packs;
        const names = this.types.names;

        const hasObj = packs.indexOf(KeyWords.IDOBJ);
        const isKey = packs.indexOf(KeyWords.IDKEY);
        const isName = names.indexOf(KeyWords.NAME);
        const isType = packs.indexOf(KeyWords.IDTYPE);

        if (hasObj < 0) {
            console.log("KV类型得配表必须有IDOBJ项");
            return;
        }

        const wb = this.main;
        let child_name = this.interfaceName + "_value";
        this.createLM(sf, child_name, true);

        let pid: string;
        let n: string;
        let last: string;
        let id: InterfaceDeclaration;
        let ctor: ConstructorDeclaration;
        let w: CodeBlockWriter;
        let no: number = 1;

        let writeBody = (c: () => void) => {
            if (w! && w!.toString() && ctor!) {
                w.write(KeyWords.CloseBracketToken);
                w.write(KeyWords.CloseParenToken);
                w.write(KeyWords.SemicolonToken);
                ctor!.setBodyText(w!.toString());

                c();
            }
        };

        let createCtor = (name: string) => {
            w = this.project.createWriter();
            id = sf.addInterface({ name: firstUpperCase(name), isExported: true });
        };

        let writeSuperCall = (name: string, proto: number) => {
            w!.write(KeyWords.Super);
            w!.write(KeyWords.OpenParenToken);
            w!.write(`${proto}`);
            w!.write(KeyWords.CommaToken);
            w!.write(`"${firstUpperCase(name)}"`);
            w!.write(KeyWords.CommaToken);
            w!.write(KeyWords.OpenBracketToken);
            w!.newLine();
        };

        let writeRegister = (name: string, proto: string) => {
            sf.addVariableStatement({
                isExported: true,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: name || this.interfaceName,
                        initializer: `new ${name || this.interfaceName}$Type()`,
                    },
                ],
            } as VariableStatementStructure);

            sf.addStatements(w => {
                w.write(KeyWords.Register);
                w.write(KeyWords.OpenParenToken);
                w.write(`'${proto || this.getProtoID()}'`);
                w.write(KeyWords.CommaToken);
                w.write(`new ${name || this.interfaceName}$Type()`);
                w.write(KeyWords.CloseParenToken);
                w.write(KeyWords.SemicolonToken);
            });
        };

        for (let i in wb.rows) {
            if (+i <= 5) {
                continue;
            }
            const cells = wb.rows[i].cells;
            let ifc = cells[hasObj] && (cells[hasObj].text as string);

            if (ifc) {
                last = n!;
                n = "I" + ifc;
            } else if (!ifc) {
                last = n!;
                n = "I" + this.interfaceName;
            }

            // 创建原始对象 start
            id = sf.getInterface(firstUpperCase(n!))!;
            if (!id) {
                pid = this.types.mod.get(n!)!;
                writeBody(() => {
                    writeRegister(firstUpperCase(last!), this.types.mod.get(last!)!);
                });
                createCtor(firstUpperCase(n!));
                no = 1;
            }

            // 先创建属性
            // 属性集合
            id!.addProperty({
                name: cells[isKey].text as string,

                //@ts-ignore
                type: this.getType((isType && (cells[isType].text as string)) || child_name) || child_name,
                hasQuestionToken: true,
                docs: [cells[isName] && (cells[isName].text as string)],
            });

            no++;
        }

        this.project.getSourceFiles().forEach(f => f.formatText());
    }

    /**
     * 创建KV
     *
     * @protected
     * @param {SourceFile} sf
     * @memberof ReadExcel
     */
    protected createKV(sf: SourceFile) {
        const packs = this.types.packs;
        const names = this.types.names;

        const hasObj = packs.indexOf(KeyWords.IDOBJ);
        const isKey = packs.indexOf(KeyWords.IDKEY);
        const isName = names.indexOf(KeyWords.NAME);

        if (hasObj < 0) {
            console.log("KV类型得配表必须有IDOBJ项");
            return;
        }

        const wb = this.main;
        let child_name = this.interfaceName + "_value";
        this.createLM(sf, child_name, true);

        let pid: string;
        let n: string;
        let last: string;
        let id: InterfaceDeclaration;
        let ctor: ConstructorDeclaration;
        let w: CodeBlockWriter;
        let no: number = 1;

        let writeBody = (c: () => void) => {
            if (w! && w!.toString() && ctor!) {
                w.write(KeyWords.CloseBracketToken);
                w.write(KeyWords.CloseParenToken);
                w.write(KeyWords.SemicolonToken);
                ctor!.setBodyText(w!.toString());

                c();
            }
        };

        let createCtor = (name: string) => {
            // 创建构造函数
            const ct = sf.addClass({
                name: `${firstUpperCase(name)}$Type`,
                isExported: true,
                extends: `MessageType<${firstUpperCase(name)}>`,
            } as ClassDeclarationStructure);
            ctor = ct.addConstructor({});
            w = this.project.createWriter();
            id = sf.addInterface({ name: firstUpperCase(name), isExported: true });
        };

        let writeSuperCall = (name: string, proto: string) => {
            w!.write(KeyWords.Super);
            w!.write(KeyWords.OpenParenToken);
            w!.write(`'${proto}'`);
            w!.write(KeyWords.CommaToken);
            w!.write(`"${firstUpperCase(name)}"`);
            w!.write(KeyWords.CommaToken);
            w!.write(KeyWords.OpenBracketToken);
            w!.newLine();
        };

        let writeRegister = (name: string, proto: string) => {
            sf.addVariableStatement({
                isExported: true,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: name || this.interfaceName,
                        initializer: `new ${name || this.interfaceName}$Type()`,
                    },
                ],
            } as VariableStatementStructure);

            sf.addStatements(w => {
                w.write(KeyWords.Register);
                w.write(KeyWords.OpenParenToken);
                w.write(`'${proto || this.getProtoID()}'`);
                w.write(KeyWords.CommaToken);
                w.write(`new ${name || this.interfaceName}$Type()`);
                w.write(KeyWords.CloseParenToken);
                w.write(KeyWords.SemicolonToken);
            });
        };

        for (let i in wb.rows) {
            if (+i <= 5) {
                continue;
            }
            const cells = wb.rows[i].cells;
            let ifc = cells[hasObj] && (cells[hasObj].text as string);

            if (ifc) {
                last = n!;
                n = ifc;
            } else if (!ifc) {
                last = n!;
                n = this.interfaceName;
            }

            // 创建原始对象 start
            id = sf.getInterface(firstUpperCase(n!))!;
            if (!id) {
                pid = this.types.mod.get(n!)!;
                writeBody(() => {
                    writeRegister(firstUpperCase(last!), this.types.mod.get(last!)!);
                });
                createCtor(firstUpperCase(n!));
                writeSuperCall(firstUpperCase(n!), pid);
                no = 1;
            }

            // 先创建属性
            // 属性集合
            id!.addProperty({
                name: cells[isKey].text as string,
                type: child_name,
                hasQuestionToken: true,
                docs: [cells[isName] && (cells[isName].text as string)],
            });

            // 创建原始对象 end

            // 创建客户端传输协议对象 end

            //@ts-ignore
            w!.write(scalar(no, cells[isKey].text as string, "message", false, `object(${child_name})`));
            w!.write(KeyWords.CommaToken);
            w!.newLine();

            no++;
        }

        writeBody(() => {
            writeRegister(firstUpperCase(n!), pid);
        });

        // 创建表
        no = 1;
        createCtor(this.interfaceName);
        writeSuperCall(firstUpperCase(this.interfaceName!), this.getProtoID());
        this.types.mod.forEach((v, k) => {
            id.addProperty({
                name: k!,
                type: firstUpperCase(k!),
                hasQuestionToken: true,
            });
        });

        this.types.mod.forEach((v, k) => {
            //@ts-ignore
            w!.write(scalar(no, k as string, "message", false, `object(${k!})`));
            w!.write(KeyWords.CommaToken);
            w!.newLine();
            no++;
        });
        writeBody(() => {
            writeRegister(firstUpperCase(this.interfaceName!), this.getProtoID());
        });

        this.project.getSourceFiles().forEach(f => f.formatText());
    }

    /**
     * 创建枚举
     *
     * @protected
     * @param {SourceFile} sf
     * @memberof ReadExcel
     */
    protected createEnum(sf: SourceFile) {
        const docs_texts = this.types.docs;
        const name_texts = this.types.names;
        const type_texts = this.types.types;
        const pack_texts = this.types.packs;

        const has = sf.getEnum(this.interfaceName);
        if (has) {
            return;
        }

        const enu = sf.addEnum({
            isExported: true,
            name: this.interfaceName,
        } as EnumDeclarationStructure);

        for (let i = 1, l = name_texts.length; i < l; i++) {
            const n = name_texts[i] as string;
            const t = type_texts[i] as string;

            const value = t == "string" ? `"${pack_texts[i]}"` : pack_texts[i];
            enu.addMember({
                name: n,
                value: value,
                docs: [{ description: `${docs_texts[i]}` }],
            } as EnumMemberStructure);
        }
    }

    /**
     * 创建interface
     *
     * @protected
     * @param {SourceFile} sf
     * @memberof ReadExcel
     */
    protected createLM(sf: SourceFile, name?: string, filter: boolean = false) {
        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;

        const docs = this.types.docs;
        const names = this.types.names;
        const types = this.types.types;
        const packs = this.types.packs;

        // 先创建属性
        // 属性集合
        const members: PropertySignatureStructure[] = this.createProperty(docs, names, types, packs, filter);

        if (packs.indexOf(KeyWords.IDKEY) > -1) {
            this.kvKey = names[packs.indexOf(KeyWords.IDKEY)] as string;
            this.kvKeyType = this.getType(types[packs.indexOf(KeyWords.IDKEY)] as ProtoBufScalarType);

            // console.log(`当前MAP类型的配表KVKey为:${this.kvKey}`);
        }

        const has = sf.getInterface(name || this.interfaceName);
        if (has) {
            return;
        }

        const protoID = generatorProtoID(name || this.interfaceName);

        // 添加接口
        sf.addInterface({
            isExported: true,
            name: name || this.interfaceName,
            properties: members,
            docs: [
                {
                    description: `'${protoID}'`,
                    tags: [
                        { tagName: "author", text: "ksgames26" },
                        { tagName: "protobuf", text: `'${protoID}'` },
                    ],
                },
            ],
        } as InterfaceDeclarationStructure);

        // 创建类
        const ct = sf.addClass({
            name: `${name || this.interfaceName}$Type`,
            isExported: false,
            extends: `MessageType<${name || this.interfaceName}>`,
            implements: [`IGameFramework.ISerializer`],
        } as ClassDeclarationStructure);

        // 创建构造函数
        let ctor = ct.addConstructor({});


        {
            ct.addGetAccessor({
                name: "protoId",
                returnType: "number",
                statements: (write) => {
                    write.write(`return ${parseInt(protoID)};`)
                }
            });
        }

        // 填充方法体
        const write = this.project.createWriter();
        write.write(KeyWords.Super);
        write.write(KeyWords.OpenParenToken);
        write.write(`"${name || this.interfaceName}"`);
        write.write(KeyWords.CommaToken);
        write.write(KeyWords.OpenBracketToken);
        write.newLine();

        // 实现构造函数body
        let no = 1;
        for (let i = 1, l = names.length; i < l; i++) {
            const n = names[i] as string;
            const t = types[i] as ProtoBufScalarType;

            if (filter && packs[i] != KeyWords.IDVALUE) {
                continue;
            }

            // 实现每个字段的rtti信息
            write.write(scalar(no, n, getProtoBufScalarType(t), t.endsWith("[]") ? true : false, t));
            write.write(KeyWords.CommaToken);
            write.newLine();

            no++;
        }
        write.write(KeyWords.CloseBracketToken);
        write.write(KeyWords.CloseParenToken);
        write.write(KeyWords.SemicolonToken);
        ctor.setBodyText(write.toString());

        // 添加导出
        sf.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: name || this.interfaceName,
                    initializer: `new ${name || this.interfaceName}$Type()`,
                },
            ],
        } as VariableStatementStructure);

        // 添加注册
        sf.addStatements(w => {
            w.write(`
                director.on("game-framework-initialize",()=>{
                    Container.getInterface("IGameFramework.ISerializable")?.registerInst(${name || this.interfaceName});
                });
            `)
        });

        // 格式化所有文件
        this.project.getSourceFiles().forEach(file => file.formatText());
    }

    public save(client: boolean): void {
        if (client) {
            // 先添加protobuf相关
            this.sf.addImportDeclarations([
                {
                    isTypeOnly: false,
                    namedImports: ["MessageType"],
                    moduleSpecifier: "db://game-protobuf/game-framework",
                },
            ]);

            // 在添加,再添加表达式
            this.sf.addImportDeclarations([
                {
                    isTypeOnly: false,
                    namedImports: ["Expressions", "ExpressionsHandler"],
                    moduleSpecifier: "db://game-configure/game-framework",
                },
            ]);

            // 在添加,再添加容器
            this.sf.addImportDeclarations([
                {
                    isTypeOnly: false,
                    namedImports: ["Container"],
                    moduleSpecifier: "db://game-core/game-framework",
                },
            ]);

            // 添加cc导入
            this.sf.addImportDeclarations([
                {
                    isTypeOnly: false,
                    namedImports: ["director"],
                    moduleSpecifier: "cc",
                },
            ]);
        } else {
            new Error("not support server")
        }
        // 保存文件
        this.project.saveSync();
    }

    /**
     * 打包数据
     *
     * @memberof ReadExcel
     */
    public pack(fileName: string): void {
        let source = this.project
            .getSourceFiles()
            .map(file => (file.getFilePath().includes(fileName) ? "" : file.getText()))
            .join("");
        const packType = this.getPackerType();

        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        const head = `
            const bytes = new Byte();

            // 写内容数量
            bytes.writeInt16(count);
            // 写打包解包表名
            bytes.writeUTF8String(protoNA);
            // 写打包解包ID
            bytes.writeInt32(protoID);
            // 写入打包类型
            bytes.writeUint8(packType);
        `;
        source += head;
        let data: unknown;

        let func = "";

        // 看看类型
        switch (packer[0].text) {
            case KeyWords.PACKER_MAP:
                func += `
                    // 写入key
                    bytes.writeUTF8String(idkey);
                `;
            case KeyWords.PACKER_LIST: {
                data = this.packLMData();
                // 构建一段代码用来打包
                // int16(数据数量) + int16(打包解包ID) + int32(单条数据长度) + body(单条数据内容)
                func += `
                        for (let i = 0, l = data.length; i < l; i++) {
                            const bin = (${this.interfaceName} as MessageType<object>).toBinary(data[i]);
                            
                            // 写协议长度
                            bytes.writeInt32(bin.length);
                            // 写入打包后的内容
                            bytes.writeArrayBuffer(bin.buffer);
                        }
                        // 截断额外0值内容
                        // 只保留有效值
                        buffer = bytes.buffer.slice(0, bytes.pos)
                    `;
                break;
            }
            case KeyWords.PACKER_ENUM:
                break;
            case KeyWords.PACKER_KV: {
                data = this.packKVData();
                // 构建一段代码用来打包
                // int16(数据数量) + int16(打包解包ID) + int32(单条数据长度) + body(单条数据内容)

                func = `
                        const bin = (${this.interfaceName} as MessageType<object>).toBinary(data);
                        // 写协议长度
                        bytes.writeInt32(bin.length);
                        // 写入打包后的内容
                        bytes.writeArrayBuffer(bin.buffer);
                        // 截断额外0值内容
                        // 只保留有效值
                        buffer = bytes.buffer.slice(0, bytes.pos)
                    `;

                break;
            }
            default:
                console.log("除一维打包方式外,暂不支持其他打包方式");
        }
        source += func;

        // 编译代码并创建运行时上下文
        const result = ts.transpile(source, {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2015,
        });

        // console.log(result);
        const context = createContext({
            buffer: null,
            data,
            packType: packType,
            protoID: "" + this.getProtoID(),
            protoNA: this.interfaceName,
            exports: {},
            idkey: this.kvKey || "",
            count: Array.isArray(data) ? data.length : 1,
            MessageType,
            Container,
            ExpressionsHandler,
            Expressions,
            Byte,
            director
        } as { buffer: Uint8Array | null });
        try {
            const script = new Script(result);
            script.runInContext(context);
            this.buffer = context.buffer;
        } catch (error) {
            console.error(error);
        }
    }

    public getProtoID(): string {
        return generatorProtoID(this.interfaceName);
    }

    public getPackerType(): number {
        const wb = this.main;
        switch (wb.rows[5].cells[0].text) {
            case KeyWords.PACKER_LIST:
                return PACKER.LIST;
            case KeyWords.PACKER_KV:
                return PACKER.KV;
            case KeyWords.PACKER_MAP:
                return PACKER.MAP;
            default:
                throw new Error("其他类型不支持存在与MAIN SHEET中");
        }
    }

    public packKVData() {
        const main = this.wbs.get("main");
        const types = main?.types!;
        const data: Dict = {};

        const isObj = this.types.packs.indexOf(KeyWords.IDOBJ);
        const isKey = this.types.packs.indexOf(KeyWords.IDKEY);

        this.types.mod.forEach((v, k) => {
            data[k] = {};
        });

        // 按照interface打包
        for (let i = 0; i < types.length; i++) {
            for (let key in main?.rows) {
                if (+key <= 5) {
                    continue;
                }

                const value = main?.rows[+key].cells!;
                if (Object.keys(value).length <= 0) {
                    continue;
                }

                const k = value[isObj].text;
                const obj = data[k];

                // 过滤OBJ和KEY所在得列数据
                // 不需要打包
                // 是作为键存在的
                if (+types[i].indx == isObj || +types[i].indx == isKey) {
                    continue;
                }

                const sub = value[isKey].text;
                if (!obj[sub]) {
                    obj[sub] = {};
                }

                const out = obj[sub];

                // 从地6行开始才是数据body部分
                const idx = +key - 6;
                const input = {
                    source: types[i],
                    // 这里需要加回来
                    // 因为后面需要靠这个索引去拿这一行的值
                    idx: idx + 6,
                    values: value,
                    data: out,
                };
                this.getTypeValue(input as PQInput, this);
            }
        }
        return data;
    }

    public packLMData(): Dict[] {
        // 是一个interface数组
        const data: Dict[] = [];
        // 从main sheet 开始打包
        const main = this.wbs.get("main");
        const types = main?.types!;

        // 按照interface打包
        for (let i = 0; i < types.length; i++) {
            for (let key in main?.rows) {
                if (+key <= 5) {
                    continue;
                }

                const value = main?.rows[+key].cells!;
                if (Object.keys(value).length <= 0) {
                    continue;
                }

                // 从地6行开始才是数据body部分
                const idx = +key - 6;
                if (!data[idx]) {
                    data[idx] = {};
                }
                const iface = data[idx];
                const input = {
                    source: types[i],
                    // 这里需要加回来
                    // 因为后面需要靠这个索引去拿这一行的值
                    idx: idx + 6,
                    values: value,
                    data: iface,
                };
                this.getTypeValue(input as PQInput, this);
            }
        }
        return data;
    }

    public getTypeValue(t: PQInput, re: ReadExcel): void {
        const error = `配置表${re.interfaceName}解析失败` + t.source.indx + "_" + t.source.name + "_" + t.source.indx;

        const isArray = t.source.type.endsWith("[]");
        let ty = t.source.type as ProtoBufScalarType;
        if (isArray) {
            ty = t.source.type.replace("[]", "") as ProtoBufScalarType;
        }

        switch (ty) {
            case "double":
            case "float":
            case "int32":
            case "int64":
            case "uint32":
            case "uint64":
            case "sint32":
            case "sint64":
            case "fixed32":
            case "fixed64":
            case "sfixed32":
            case "sfixed64": {
                if (t.values[t.source.indx] == void 0) {
                    t.values[t.source.indx] = { text: undefined };
                }

                if (t.values[t.source.indx].text == void 0) {
                    if (isArray) {

                        // 空数组
                        t.values[t.source.indx].text = "";
                    } else {

                        // 空值默认为0
                        t.values[t.source.indx].text = 0;
                    }
                }

                let list = t.values[t.source.indx].text + "";
                if (isArray) {
                    if (list.endsWith(";")) {
                        // 去掉最后的;
                        list = list.substring(0, list.length - 1);
                    }

                    t.data[t.source.name] = (list as string).split(";").map(v => +v);
                } else {
                    t.data[t.source.name] = +list;
                }
                (t.data[t.source.name] == void 0, error);
                break;
            }
            case "bool":
                assert(isArray, "暂不支持数组类型");

                if (t.values[t.source.indx] == void 0) {
                    t.values[t.source.indx] = { text: undefined };
                }

                const v = t.values[t.source.indx].text;
                if (v != void 0) {
                    if (typeof v == "number") {
                        if (+v > 0) {
                            t.data[t.source.name] = true;
                        } else {
                            t.data[t.source.name] = false;
                        }
                    }

                    if (typeof v == "string") {
                        if (v == "true") {
                            t.data[t.source.name] = true;
                        } else if (v == "false") {
                            t.data[t.source.name] = false;
                        }
                    }

                    if (typeof v == "boolean") {
                        t.data[t.source.name] = v;
                    }
                }

                if (t.data[t.source.name] == void 0) {

                    // 空值默认为false
                    t.data[t.source.name] = false;
                }

                assert(t.data[t.source.name] == void 0, error);
                break;
            case "string":
                if (t.values[t.source.indx] == void 0) {
                    t.values[t.source.indx] = { text: undefined };
                }

                if (t.values[t.source.indx].text == void 0) {
                    t.values[t.source.indx].text = "";
                }

                let list = t.values[t.source.indx].text + "";

                if (isArray) {
                    if (list.endsWith(";")) {
                        // 去掉最后的;
                        list = list.substring(0, list.length - 1);
                    }

                    t.data[t.source.name] = (list as string).split(";");
                } else {
                    t.data[t.source.name] = list + "";
                }
                assert(t.data[t.source.name] == void 0, error);
                break;
            case "bytes":
                assert(true, "不支持");
                break;
            case "limit":
            // 函数类型
            case "fn":
            // 条件类型
            case "condition":
            // 公式类型
            case "formula":
                assert(isArray, "暂不支持数组类型");
                assert(!t.values[t.source.indx], "请检查数据源");
                assert(!t.values[t.source.indx].text && t.values[t.source.indx].text != "0", "请检查数据源");

                try {
                    const p = compile(t.values[t.source.indx].text as string, ty);
                    t.data[t.source.name] = p;
                } catch (e: any) {
                    assert(
                        true,
                        (`解析复杂类型失败:类型:${ty}` +
                            e.toString() +
                            "source:" +
                            t.values[t.source.indx].text) as string,
                    );
                }

                assert(t.data[t.source.name] == void 0, error);
                break;
            default:
                // object or enum or others
                assert(isArray, "暂不支持数组类型");

                const sheet = getValue(ty)!;
                if ((ty as string).startsWith(KeyWords.Object)) {
                    // 接口

                    const iface = {};

                    const sub = re.sls.get(sheet)!;
                    const types = sub?.main!.types;
                    const main = sub?.main;

                    for (let key in main?.rows) {
                        if (+key == t.idx) {
                            for (let i = 0; i < types.length; i++) {
                                const value = main?.rows[+key].cells;
                                const input = {
                                    source: types[i],
                                    idx: t.idx,
                                    values: value,
                                    data: iface,
                                };

                                this.getTypeValue(input as PQInput, this);
                            }

                            t.data[t.source.name] = iface;
                            break;
                        }
                    }
                } else if ((ty as string).startsWith(KeyWords.Enum)) {
                    // 枚举
                    const sub = re.sls.get(sheet)!;
                    const names = sub?.types.names;
                    const packs = sub?.types.packs;

                    if (typeof t.values[t.source.indx].text == "number") {
                        t.data[t.source.name] = t.values[t.source.indx].text;
                    } else if (typeof t.values[t.source.indx].text == "string") {
                        assert(t.values[t.source.indx].text == void 0, "解析枚举失败");

                        const index = names.indexOf(t.values[t.source.indx].text!);
                        if (index != -1) {
                            t.data[t.source.name] = packs[index];
                        } else {
                            // t.data[t.source.name] = t.values[t.source.indx].text;
                            assert(true, `在${names}中未找到枚举项 ${t.values[t.source.indx].text}`);
                        }
                    }
                }
                assert(t.data[t.source.name] == void 0, error);
                break;
        }
    }

    /**
     * 创建接口属性
     *
     * @private
     * @return {*}  {PropertySignatureStructure[]}
     * @memberof Read
     */
    private createProperty(
        docs: (string | number)[],
        names: (string | number)[],
        types: (string | number)[],
        packs: (string | number)[],
        filter: boolean = false,
    ): PropertySignatureStructure[] {
        const props: PropertySignatureStructure[] = [];

        // 从1开始
        // 因为0 是注释
        for (let i = 1, l = names.length; i < l; i++) {
            const n = names[i] as string;
            const t = types[i];

            if (filter && packs[i] != KeyWords.IDVALUE) {
                continue;
            }

            const tn = this.getType(t as ProtoBufScalarType);

            if (!tn) {
                console.log("对象表达式错误");
                return props;
            }

            props.push({
                name: n,
                type: tn,
                docs: [
                    {
                        description: docs[i],
                    },
                ],
            } as PropertySignatureStructure);
        }

        return props;
    }

    private getType(t: ProtoBufScalarType): string {
        const isArray = t.endsWith("[]");
        if (isArray) {
            t = t.replace("[]", "") as ProtoBufScalarType;
        }
        switch (t) {
            case "double":
            case "float":
            case "int32":
            case "int64":
            case "uint32":
            case "uint64":
            case "sint32":
            case "sint64":
            case "fixed32":
            case "fixed64":
            case "sfixed32":
            case "sfixed64":
                return isArray ? "number[]" : "number";
            case "bool":
                return isArray ? "boolean[]" : "boolean";
            case "string":
                return isArray ? "string[]" : "string";
            case "bytes":
                return isArray ? "Uint8Array[]" : "Uint8Array";
            // 函数类型
            case "fn":
            // 条件类型
            case "condition":
            // 公式类型
            case "formula":
            // 限制类型
            case "limit":
                return "Expressions";
            default:
                // object or enum or others
                return firstUpperCase(getValue(t)!);
        }
    }
}

class SubReadExcel extends ReadExcel {
    public re: ReadExcel;
    public constructor(name: string, sheet: PQWorkBook, types: ReadExcelType) {
        super();

        this.re = types.re;
        this.re.addReadExcel(name, this);
        this.interfaceName = firstUpperCase(name);
        this.main = sheet;
        this.project = types.re.project;
        this.sf = types.re.sf;
        this.types = new ReadExcelType(types.re, this.main);
        this.types.parse();
    }

    public parse(): void {
        this.createInterface();
    }

    protected createInterface(): void {
        const sf = this.sf;

        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        // 看看类型
        switch (packer[0].text) {
            // 一维的KV打包
            case KeyWords.PACKER_LIST:
            case KeyWords.PACKER_MAP:
                this.createLM(sf);
                break;
            case KeyWords.PACKER_ENUM:
                this.createEnum(sf);
                break;
            // 多维的KV打包
            default:
                console.log("子项无法使用除PACKER_LIST和PACKER_ENUM打包以外的任何方式");
                break;
        }
    }
}

export class ParserOptions {
    public constructor(
        public input: string,
        public output_bin: string,
        public output_ts: string,
        public cstype: string,
        public globalModuleName: string,
        public globalModuleTSName: string,
        public globalModuleInterfaceName: string
    ) { }
}

export class Parser {
    public args = {
        input: "",
        output: "",
        ts: "",
        cstype: "server",
        globalModuleName: "",
        globalModuleTSName: "",
        globalModuleInterfaceName: ""
    };
    private project!: Project;

    public constructor(options: ParserOptions) {
        if (!options.input) {
            Editor.Dialog.error(`${Editor.I18n.t("xlsx_path")}错误`);
            return;
        }

        if (!options.output_bin) {
            Editor.Dialog.error(`${Editor.I18n.t("export_director")}错误`);
            return;
        }

        if (!options.output_ts) {
            Editor.Dialog.error(`${Editor.I18n.t("export_ts_director")}错误`);
            return;
        }

        this.args.input = this.projectPath(options.input);
        this.args.output = this.projectPath(options.output_bin);
        this.args.ts = this.projectPath(options.output_ts);
        this.args.cstype = this.projectPath(options.cstype);

        this.args.globalModuleName = options.globalModuleName || "ksgames26";
        this.args.globalModuleTSName = options.globalModuleTSName || "ksgames26";
        if (this.args.globalModuleTSName.endsWith(".ts")) {
            this.args.globalModuleTSName = this.args.globalModuleTSName.substring(0, this.args.globalModuleTSName.length - 3);
        }
        this.args.globalModuleInterfaceName = options.globalModuleInterfaceName || "IConfigureTable";
    }

    public projectPath(path: string) {
        return path.replace("project:/", Editor.Project.path);
    }

    public createProject(): Project {
        return new Project({
            compilerOptions: {
                incremental: true,
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS,
                declaration: true,
                sourceMap: true,
                composite: true,
                strict: true,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                experimentalDecorators: true,
                noImplicitAny: true,
                noImplicitThis: true,
                resolveJsonModule: true,
                skipDefaultLibCheck: true,
            },
        });
    }

    public async execute(init: (data: Array<{ id: string, value: boolean }>) => void, cb: (name: string, success: boolean) => void, progress: (progress: number) => void): Promise<void> {
        const bytes = new Byte();
        const f = new File(this.args.input!);

        this.project = this.createProject();

        if (existsSync(join(this.args.ts!, `${this.args.globalModuleTSName}.ts`))) {
            unlinkSync(join(this.args.ts!, `${this.args.globalModuleTSName}.ts`));
        }
        const sfg = this.project.createSourceFile(join(this.args.ts!, `${this.args.globalModuleTSName}.ts`), "");

        let present = 0;

        sfg.addStatements(w =>
            w.write(`${KeyWords.Declare} ${KeyWords.Global}`).block(() => {
                let allFiles = f.getAllFiles(".xlsx");

                let data: Array<{ id: string, value: boolean }> = [];

                let count = 0;

                allFiles.forEach(f => {

                    // 过滤excel打开后自动创建的副本
                    if (f.name.startsWith("~$")) {
                        return;
                    }

                    count++;

                    data.push({
                        id: f.name,
                        value: false
                    });
                })

                init && init(data);

                allFiles.forEach(f => {
                    // 过滤excel打开后自动创建的副本
                    if (f.name.startsWith("~$")) {
                        return;
                    }
                    const r = new ReadExcel(f, this.createProject(), new File(this.args.ts!));

                    // 读取配置表
                    r.read();

                    // 解析配置表
                    r.parse();

                    sfg.addImportDeclaration({
                        isTypeOnly: false,
                        namedImports: [r.interfaceName],
                        moduleSpecifier: `./${r.fileName}`,
                    });
                    sfg.addExportDeclaration({
                        isTypeOnly: false,
                        moduleSpecifier: `./${r.fileName}`,
                    });

                    w.write(`module ${this.args.globalModuleName}`).block(() => {
                        w.write(`${KeyWords.Interface} ${this.args.globalModuleInterfaceName}`).block(() => {
                            // 构建global接口方便提示
                            r.global(w);
                        });
                    });

                    r.pack(this.args.globalModuleTSName);

                    r.save(this.args.cstype == "client");

                    if (!r.buffer) {
                        cb && cb(f.name, false);
                        console.log("打包数据有误,打包失败");
                        return;
                    }

                    cb && cb(f.name, true);
                    bytes.writeArrayBuffer(r.buffer);

                    progress && progress((++present / count) * 100);
                });
            }),
        );
        this.project.getSourceFiles().forEach(f => f.formatText());
        sfg.save();
        // save data
        await dirExists(this.args.output!);
        writeFileSync(join(this.args.output!, "cfg.bin"), bytes.getUint8Array(0, bytes.pos));
    }
}
