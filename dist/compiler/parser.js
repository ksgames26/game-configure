"use strict";
/**
 *
 *  @see https://ts-ast-viewer.com/
 *
 *  用来打包Excel到Protobuf
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParserOptions = exports.assert = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const fs_1 = require("fs");
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const vm_1 = require("vm");
const file_1 = require("./file");
const xlsx_1 = __importDefault(require("xlsx"));
const byte_1 = require("./byte");
const compiler_1 = require("./compiler");
const expressions_1 = require("./expressions");
const work_book_1 = require("./work-book");
const assert = function (condition, message) {
    if (condition) {
        throw new Error(message);
    }
};
exports.assert = assert;
class Container {
    static getInterface(iface) { }
}
const director = {
    on() { }
};
const msg = "QN=20160801085857223;ST=32;CN=1062;PW=100000;MN=010000A8900016F000169DC0;Flag=5;CP=&&RtdInterval=30&&";
function crc32(str) {
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    str = Utf8Encode(str);
    let crc = 0;
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    if (typeof crc == "undefined") {
        crc = 0;
    }
    var x = 0;
    var y = 0;
    crc = crc ^ -1;
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xff;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
    }
    // console.log(crc ^ -1);
    // @see https://segmentfault.com/q/1010000012003675
    return crc ^ -1 + 0xffffffff;
}
//let id = 10000;
const idMap = new Map();
const generatorProtoID = (name) => { var _a; return (_a = idMap.get(name)) !== null && _a !== void 0 ? _a : idMap.set(name, crc32(name).toString()).get(name); };
/**
 * 首字母大写
 *
 * @param {string} str
 */
const firstUpperCase = (str) => str.replace(str[0], str[0].toUpperCase()); //str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
const nameJoin = (old) => {
    // 首字母小写
    old = old.replace(old[0], old[0].toLowerCase());
    // 然后开始拼接
    const stringArray = old.split('');
    let newField = old;
    stringArray.forEach(t => {
        if (/[A-Z]/.test(t)) {
            newField = newField.replace(t, `-${t.toLowerCase()}`);
        }
    });
    return newField;
};
/**
 * 提取括号内的值
 *
 * @param {string} str
 */
const valueOfPattern = (str) => str.match(/(?<=\().*(?=\))/g);
/**
 * 获取装箱拆箱阶段的实际类型
 *
 * @param {ProtoBufScalarType} t
 * @return {*}  {string}
 */
const getProtoBufType = function (t) {
    let t1 = "";
    switch (t) {
        case "double":
            t1 = `${work_book_1.ScalarTypeValue.DOUBLE} /*${"ScalarType" /* KeyWords.ScalarType */}.${"DOUBLE" /* ScalarType.DOUBLE */}*/`;
            break;
        case "float":
            t1 = `${work_book_1.ScalarTypeValue.FLOAT}  /*${"ScalarType" /* KeyWords.ScalarType */}.${"FLOAT" /* ScalarType.FLOAT */}*/`;
            break;
        case "int32":
            t1 = `${work_book_1.ScalarTypeValue.INT32}  /*${"ScalarType" /* KeyWords.ScalarType */}.${"INT32" /* ScalarType.INT32 */}*/`;
            break;
        case "int64":
            t1 = `${work_book_1.ScalarTypeValue.INT64}  /*${"ScalarType" /* KeyWords.ScalarType */}.${"INT64" /* ScalarType.INT64 */}*/`;
            break;
        case "uint32":
            t1 = `${work_book_1.ScalarTypeValue.UINT32} /*${"ScalarType" /* KeyWords.ScalarType */}.${"UINT32" /* ScalarType.UINT32 */}*/`;
            break;
        case "uint64":
            t1 = `${work_book_1.ScalarTypeValue.UINT64} /*${"ScalarType" /* KeyWords.ScalarType */}.${"UINT64" /* ScalarType.UINT64 */}*/`;
            break;
        case "sint32":
            t1 = `${work_book_1.ScalarTypeValue.SINT32} /*${"ScalarType" /* KeyWords.ScalarType */}.${"SINT32" /* ScalarType.SINT32 */}*/`;
            break;
        case "sint64":
            t1 = `${work_book_1.ScalarTypeValue.SINT64} /*${"ScalarType" /* KeyWords.ScalarType */}.${"SINT64" /* ScalarType.SINT64 */}*/`;
            break;
        case "fixed32":
            t1 = `${work_book_1.ScalarTypeValue.FIXED32} /*${"ScalarType" /* KeyWords.ScalarType */}.${"FIXED32" /* ScalarType.FIXED32 */}*/`;
            break;
        case "fixed64":
            t1 = `${work_book_1.ScalarTypeValue.FIXED64} /*${"ScalarType" /* KeyWords.ScalarType */}.${"FIXED64" /* ScalarType.FIXED64 */}*/`;
            break;
        case "sfixed32":
            t1 = `${work_book_1.ScalarTypeValue.SFIXED32} /*${"ScalarType" /* KeyWords.ScalarType */}.${"SFIXED32" /* ScalarType.SFIXED32 */}*/`;
            break;
        case "sfixed64":
            t1 = `${work_book_1.ScalarTypeValue.SFIXED64} /*${"ScalarType" /* KeyWords.ScalarType */}.${"SFIXED64" /* ScalarType.SFIXED64 */}*/`;
            break;
        case "bool":
            t1 = `${work_book_1.ScalarTypeValue.BOOL} /*${"ScalarType" /* KeyWords.ScalarType */}.${"BOOL" /* ScalarType.BOOL */}*/`;
            break;
        case "string":
            t1 = `${work_book_1.ScalarTypeValue.STRING} /*${"ScalarType" /* KeyWords.ScalarType */}.${"STRING" /* ScalarType.STRING */}*/`;
            break;
        case "bytes":
            t1 = `${work_book_1.ScalarTypeValue.BYTES} /*${"ScalarType" /* KeyWords.ScalarType */}.${"BYTES" /* ScalarType.BYTES */}*/`;
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
            const str = t;
            let value = getValue(str);
            if (!value) {
                const isArray = str.endsWith("[]");
                if (isArray) {
                    return getProtoBufType(str.replace("[]", ""));
                }
                throw new Error("类型不支持");
            }
            if (str.startsWith("object" /* KeyWords.Object */)) {
                return `() => ${firstUpperCase(value)}`;
            }
            else {
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
const getProtoBufScalarType = function (t) {
    let t1 = "";
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
            const str = t;
            if (str.startsWith("object" /* KeyWords.Object */)) {
                t1 = "message";
            }
            else if (str.endsWith("[]")) {
                t1 = getProtoBufScalarType(str.replace("[]", ""));
            }
            else {
                t1 = "enum";
            }
            break;
    }
    return t1;
};
const scalar_no_repeat = (no, name, kind, type) => `{ no:${no},name:"${name}",kind:"${kind}",T:${getProtoBufType(type)}}`;
const scalar_repeat = (no, name, kind, type) => {
    if (type.startsWith("string")) {
        return `{ no:${no},name:"${name}",kind:"${kind}",repeat:${runtime_1.RepeatType.UNPACKED} /*RepeatType.UNPACKED*/,T:${getProtoBufType(type)}}`;
    }
    else {
        return `{ no:${no},name:"${name}",kind:"${kind}",repeat:${runtime_1.RepeatType.PACKED} /*RepeatType.PACKED*/,T:${getProtoBufType(type)}}`;
    }
};
const scalar = (no, name, kind, repeat, type) => (repeat ? scalar_repeat(no, name, kind, type) : scalar_no_repeat(no, name, kind, type));
const charToNum = function (val) {
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
const numToChar = function (number) {
    let numeric = (number - 1) % 26;
    let letter = chr(65 + numeric);
    //@ts-ignore
    let number2 = parseInt((number - 1) / 26);
    if (number2 > 0) {
        return numToChar(number2) + letter;
    }
    else {
        return letter;
    }
};
const chr = function (codePt) {
    if (codePt > 0xffff) {
        codePt -= 0x10000;
        return String.fromCharCode(0xd800 + (codePt >> 10), 0xdc00 + (codePt & 0x3ff));
    }
    return String.fromCharCode(codePt);
};
const stox = function stox(wb, f) {
    let out = new Map();
    for (let name in wb.Sheets) {
        // sheet 名称
        const o = { name: name, rows: {}, merges: [], types: [] };
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
        const max_row = ref[1].match(/[A-Z]/g).join("");
        // 提取col
        const max_col = +ref[1].match(/[0-9]/gi).join("");
        const max_row_value = charToNum(max_row);
        // 需要的json必须外层是rows,内层是cells
        for (let i = 1, l = max_col; i <= l; i++) {
            let cells = {};
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
    return out;
};
const getValue = (t) => {
    if (t.startsWith("object") || t.startsWith("enum")) {
        const name = valueOfPattern(t);
        if (!name || name.length <= 0) {
            console.log("对象表达式错误");
            return;
        }
        return name[0];
    }
};
class ReadExcelType {
    constructor(re, main) {
        this.re = re;
        this.main = main;
        this.oe = new Map();
        this.mod = new Map();
        this.makeType();
    }
    makeType() {
        const wb = this.main;
        const docs = wb.rows[1].cells;
        const names = wb.rows[3].cells;
        const types = wb.rows[4].cells;
        const packs = wb.rows[5].cells;
        const docs_texts = [];
        for (let key in docs) {
            docs_texts.push(docs[key].text);
        }
        const name_texts = [];
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
            case "PACKER(KV)" /* KeyWords.PACKER_KV */:
                const idx = this.packs.indexOf("IDOBJ" /* KeyWords.IDOBJ */);
                if (idx >= 0) {
                    for (let i in wb.rows) {
                        if (+i <= 5) {
                            continue;
                        }
                        const cells = wb.rows[i].cells;
                        const k = cells[1].text;
                        if (k) {
                            this.mod.set(k, generatorProtoID(k));
                        }
                    }
                }
                break;
        }
    }
    parse() {
        for (let i = 1, l = this.types.length; i < l; i++) {
            const t = this.types[i];
            const name = getValue(t);
            this.parseObject(name);
        }
    }
    parseObject(name) {
        if (!name) {
            return;
        }
        const sheet = this.re.wbs.get(name);
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
    constructor(url, p, out) {
        if (url == null) {
            return;
        }
        this.project = p;
        this._out = out;
        this._url = url;
        this.sls = new Map();
        this.interfaceName = firstUpperCase(url.unExtName);
        this.addReadExcel("main", this);
    }
    addReadExcel(name, read) {
        this.sls.set(name, read);
    }
    read() {
        this._ws = xlsx_1.default.readFile(this._url.nativePath);
    }
    parse() {
        this.wbs = stox(this._ws, this._url.name);
        this.fileName = nameJoin(this._url.unExtName);
        if ((0, fs_1.existsSync)(`${this._out.nativePath}/${this.fileName}.ts`)) {
            (0, fs_1.unlinkSync)(`${this._out.nativePath}/${this.fileName}.ts`);
        }
        const sf = this.project.createSourceFile(`${this._out.nativePath}/${this.fileName}.ts`, "");
        this.sf = sf;
        this.main = this.wbs.get("main");
        this.types = new ReadExcelType(this, this.main);
        this.types.parse();
        this.createInterface();
    }
    global(w) {
        const sf = this.sf;
        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        // 看看类型
        switch (packer[0].text) {
            case "PACKER(LIST)" /* KeyWords.PACKER_LIST */:
                w.write(this.interfaceName);
                w.write(":");
                w.write(firstUpperCase(this.interfaceName));
                w.write("[]");
                break;
            case "PACKER(MAP)" /* KeyWords.PACKER_MAP */:
                w.write(this.interfaceName);
                w.write(":");
                w.write(`Record<${this.kvKeyType},`);
                w.write(firstUpperCase(this.interfaceName));
                w.write(">");
                break;
            case "PACKER(ENUM)" /* KeyWords.PACKER_ENUM */:
                break;
            case "PACKER(KV)" /* KeyWords.PACKER_KV */:
                w.write(this.interfaceName);
                w.write(":");
                w.write(firstUpperCase(this.interfaceName));
                break;
            default:
                console.log("除一维打包方式外,暂不支持其他打包方式");
        }
    }
    createInterface() {
        const sf = this.sf;
        // 直接找1,3和4
        // 1是变量短注释
        // 3是变量名称
        // 4是变量类型
        const wb = this.main;
        const packer = wb.rows[5].cells;
        // 看看类型
        switch (packer[0].text) {
            case "PACKER(LIST)" /* KeyWords.PACKER_LIST */:
            case "PACKER(MAP)" /* KeyWords.PACKER_MAP */:
                this.createLM(sf);
                break;
            case "PACKER(ENUM)" /* KeyWords.PACKER_ENUM */:
                this.createEnum(sf);
                break;
            case "PACKER(KV)" /* KeyWords.PACKER_KV */:
                this.createKV(sf);
                this.createClientKV(sf);
                break;
            default:
                console.log("除一维打包方式外,暂不支持其他打包方式");
        }
    }
    createClientKV(sf) {
        const packs = this.types.packs;
        const names = this.types.names;
        const hasObj = packs.indexOf("IDOBJ" /* KeyWords.IDOBJ */);
        const isKey = packs.indexOf("IDKEY" /* KeyWords.IDKEY */);
        const isName = names.indexOf("name" /* KeyWords.NAME */);
        const isType = packs.indexOf("IDTYPE" /* KeyWords.IDTYPE */);
        if (hasObj < 0) {
            console.log("KV类型得配表必须有IDOBJ项");
            return;
        }
        const wb = this.main;
        let child_name = this.interfaceName + "_value";
        this.createLM(sf, child_name, true);
        let pid;
        let n;
        let last;
        let id;
        let ctor;
        let w;
        let no = 1;
        let writeBody = (c) => {
            if (w && w.toString() && ctor) {
                w.write("]" /* KeyWords.CloseBracketToken */);
                w.write(")" /* KeyWords.CloseParenToken */);
                w.write(";" /* KeyWords.SemicolonToken */);
                ctor.setBodyText(w.toString());
                c();
            }
        };
        let createCtor = (name) => {
            w = this.project.createWriter();
            id = sf.addInterface({ name: firstUpperCase(name), isExported: true });
        };
        let writeSuperCall = (name, proto) => {
            w.write("super" /* KeyWords.Super */);
            w.write("(" /* KeyWords.OpenParenToken */);
            w.write(`${proto}`);
            w.write("," /* KeyWords.CommaToken */);
            w.write(`"${firstUpperCase(name)}"`);
            w.write("," /* KeyWords.CommaToken */);
            w.write("[" /* KeyWords.OpenBracketToken */);
            w.newLine();
        };
        let writeRegister = (name, proto) => {
            sf.addVariableStatement({
                isExported: true,
                declarationKind: ts_morph_1.VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: name || this.interfaceName,
                        initializer: `new ${name || this.interfaceName}$Type()`,
                    },
                ],
            });
            sf.addStatements(w => {
                w.write("register" /* KeyWords.Register */);
                w.write("(" /* KeyWords.OpenParenToken */);
                w.write(`'${proto || this.getProtoID()}'`);
                w.write("," /* KeyWords.CommaToken */);
                w.write(`new ${name || this.interfaceName}$Type()`);
                w.write(")" /* KeyWords.CloseParenToken */);
                w.write(";" /* KeyWords.SemicolonToken */);
            });
        };
        for (let i in wb.rows) {
            if (+i <= 5) {
                continue;
            }
            const cells = wb.rows[i].cells;
            let ifc = cells[hasObj] && cells[hasObj].text;
            if (ifc) {
                last = n;
                n = "I" + ifc;
            }
            else if (!ifc) {
                last = n;
                n = "I" + this.interfaceName;
            }
            // 创建原始对象 start
            id = sf.getInterface(firstUpperCase(n));
            if (!id) {
                pid = this.types.mod.get(n);
                writeBody(() => {
                    writeRegister(firstUpperCase(last), this.types.mod.get(last));
                });
                createCtor(firstUpperCase(n));
                no = 1;
            }
            // 先创建属性
            // 属性集合
            id.addProperty({
                name: cells[isKey].text,
                //@ts-ignore
                type: this.getType((isType && cells[isType].text) || child_name) || child_name,
                hasQuestionToken: true,
                docs: [cells[isName] && cells[isName].text],
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
    createKV(sf) {
        const packs = this.types.packs;
        const names = this.types.names;
        const hasObj = packs.indexOf("IDOBJ" /* KeyWords.IDOBJ */);
        const isKey = packs.indexOf("IDKEY" /* KeyWords.IDKEY */);
        const isName = names.indexOf("name" /* KeyWords.NAME */);
        if (hasObj < 0) {
            console.log("KV类型得配表必须有IDOBJ项");
            return;
        }
        const wb = this.main;
        let child_name = this.interfaceName + "_value";
        this.createLM(sf, child_name, true);
        let pid;
        let n;
        let last;
        let id;
        let ctor;
        let w;
        let no = 1;
        let writeBody = (c) => {
            if (w && w.toString() && ctor) {
                w.write("]" /* KeyWords.CloseBracketToken */);
                w.write(")" /* KeyWords.CloseParenToken */);
                w.write(";" /* KeyWords.SemicolonToken */);
                ctor.setBodyText(w.toString());
                c();
            }
        };
        let createCtor = (name) => {
            // 创建构造函数
            const ct = sf.addClass({
                name: `${firstUpperCase(name)}$Type`,
                isExported: true,
                extends: `MessageType<${firstUpperCase(name)}>`,
            });
            ctor = ct.addConstructor({});
            w = this.project.createWriter();
            id = sf.addInterface({ name: firstUpperCase(name), isExported: true });
        };
        let writeSuperCall = (name, proto) => {
            w.write("super" /* KeyWords.Super */);
            w.write("(" /* KeyWords.OpenParenToken */);
            w.write(`'${proto}'`);
            w.write("," /* KeyWords.CommaToken */);
            w.write(`"${firstUpperCase(name)}"`);
            w.write("," /* KeyWords.CommaToken */);
            w.write("[" /* KeyWords.OpenBracketToken */);
            w.newLine();
        };
        let writeRegister = (name, proto) => {
            sf.addVariableStatement({
                isExported: true,
                declarationKind: ts_morph_1.VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: name || this.interfaceName,
                        initializer: `new ${name || this.interfaceName}$Type()`,
                    },
                ],
            });
            sf.addStatements(w => {
                w.write("register" /* KeyWords.Register */);
                w.write("(" /* KeyWords.OpenParenToken */);
                w.write(`'${proto || this.getProtoID()}'`);
                w.write("," /* KeyWords.CommaToken */);
                w.write(`new ${name || this.interfaceName}$Type()`);
                w.write(")" /* KeyWords.CloseParenToken */);
                w.write(";" /* KeyWords.SemicolonToken */);
            });
        };
        for (let i in wb.rows) {
            if (+i <= 5) {
                continue;
            }
            const cells = wb.rows[i].cells;
            let ifc = cells[hasObj] && cells[hasObj].text;
            if (ifc) {
                last = n;
                n = ifc;
            }
            else if (!ifc) {
                last = n;
                n = this.interfaceName;
            }
            // 创建原始对象 start
            id = sf.getInterface(firstUpperCase(n));
            if (!id) {
                pid = this.types.mod.get(n);
                writeBody(() => {
                    writeRegister(firstUpperCase(last), this.types.mod.get(last));
                });
                createCtor(firstUpperCase(n));
                writeSuperCall(firstUpperCase(n), pid);
                no = 1;
            }
            // 先创建属性
            // 属性集合
            id.addProperty({
                name: cells[isKey].text,
                type: child_name,
                hasQuestionToken: true,
                docs: [cells[isName] && cells[isName].text],
            });
            // 创建原始对象 end
            // 创建客户端传输协议对象 end
            //@ts-ignore
            w.write(scalar(no, cells[isKey].text, "message", false, `object(${child_name})`));
            w.write("," /* KeyWords.CommaToken */);
            w.newLine();
            no++;
        }
        writeBody(() => {
            writeRegister(firstUpperCase(n), pid);
        });
        // 创建表
        no = 1;
        createCtor(this.interfaceName);
        writeSuperCall(firstUpperCase(this.interfaceName), this.getProtoID());
        this.types.mod.forEach((v, k) => {
            id.addProperty({
                name: k,
                type: firstUpperCase(k),
                hasQuestionToken: true,
            });
        });
        this.types.mod.forEach((v, k) => {
            //@ts-ignore
            w.write(scalar(no, k, "message", false, `object(${k})`));
            w.write("," /* KeyWords.CommaToken */);
            w.newLine();
            no++;
        });
        writeBody(() => {
            writeRegister(firstUpperCase(this.interfaceName), this.getProtoID());
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
    createEnum(sf) {
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
        });
        for (let i = 1, l = name_texts.length; i < l; i++) {
            const n = name_texts[i];
            const t = type_texts[i];
            const value = t == "string" ? `"${pack_texts[i]}"` : pack_texts[i];
            enu.addMember({
                name: n,
                value: value,
                docs: [{ description: `${docs_texts[i]}` }],
            });
        }
    }
    /**
     * 创建interface
     *
     * @protected
     * @param {SourceFile} sf
     * @memberof ReadExcel
     */
    createLM(sf, name, filter = false) {
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
        const members = this.createProperty(docs, names, types, packs, filter);
        if (packs.indexOf("IDKEY" /* KeyWords.IDKEY */) > -1) {
            this.kvKey = names[packs.indexOf("IDKEY" /* KeyWords.IDKEY */)];
            this.kvKeyType = this.getType(types[packs.indexOf("IDKEY" /* KeyWords.IDKEY */)]);
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
        });
        // 创建类
        const ct = sf.addClass({
            name: `${name || this.interfaceName}$Type`,
            isExported: false,
            extends: `MessageType<${name || this.interfaceName}>`,
            implements: [`IGameFramework.ISerializer`],
        });
        // 创建构造函数
        let ctor = ct.addConstructor({});
        {
            ct.addGetAccessor({
                name: "protoId",
                returnType: "number",
                statements: (write) => {
                    write.write(`return ${parseInt(protoID)};`);
                }
            });
        }
        // 填充方法体
        const write = this.project.createWriter();
        write.write("super" /* KeyWords.Super */);
        write.write("(" /* KeyWords.OpenParenToken */);
        write.write(`"${name || this.interfaceName}"`);
        write.write("," /* KeyWords.CommaToken */);
        write.write("[" /* KeyWords.OpenBracketToken */);
        write.newLine();
        // 实现构造函数body
        let no = 1;
        for (let i = 1, l = names.length; i < l; i++) {
            const n = names[i];
            const t = types[i];
            if (filter && packs[i] != "IDVALUE" /* KeyWords.IDVALUE */) {
                continue;
            }
            // 实现每个字段的rtti信息
            write.write(scalar(no, n, getProtoBufScalarType(t), t.endsWith("[]") ? true : false, t));
            write.write("," /* KeyWords.CommaToken */);
            write.newLine();
            no++;
        }
        write.write("]" /* KeyWords.CloseBracketToken */);
        write.write(")" /* KeyWords.CloseParenToken */);
        write.write(";" /* KeyWords.SemicolonToken */);
        ctor.setBodyText(write.toString());
        // 添加导出
        sf.addVariableStatement({
            isExported: true,
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: name || this.interfaceName,
                    initializer: `new ${name || this.interfaceName}$Type()`,
                },
            ],
        });
        // 添加注册
        sf.addStatements(w => {
            w.write(`
                director.on("game-framework-initialize",()=>{
                    Container.getInterface("IGameFramework.ISerializable")?.registerInst(${name || this.interfaceName});
                });
            `);
        });
        // 格式化所有文件
        this.project.getSourceFiles().forEach(file => file.formatText());
    }
    save(client) {
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
        }
        else {
            new Error("not support server");
        }
        // 保存文件
        this.project.saveSync();
    }
    /**
     * 打包数据
     *
     * @memberof ReadExcel
     */
    pack(fileName) {
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
        let data;
        let func = "";
        // 看看类型
        switch (packer[0].text) {
            case "PACKER(MAP)" /* KeyWords.PACKER_MAP */:
                func += `
                    // 写入key
                    bytes.writeUTF8String(idkey);
                `;
            case "PACKER(LIST)" /* KeyWords.PACKER_LIST */: {
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
            case "PACKER(ENUM)" /* KeyWords.PACKER_ENUM */:
                break;
            case "PACKER(KV)" /* KeyWords.PACKER_KV */: {
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
        const result = ts_morph_1.ts.transpile(source, {
            module: ts_morph_1.ts.ModuleKind.CommonJS,
            target: ts_morph_1.ts.ScriptTarget.ES2015,
        });
        // console.log(result);
        const context = (0, vm_1.createContext)({
            buffer: null,
            data,
            packType: packType,
            protoID: "" + this.getProtoID(),
            protoNA: this.interfaceName,
            exports: {},
            idkey: this.kvKey || "",
            count: Array.isArray(data) ? data.length : 1,
            MessageType: runtime_1.MessageType,
            Container,
            ExpressionsHandler: expressions_1.ExpressionsHandler,
            Expressions: expressions_1.Expressions,
            Byte: byte_1.Byte,
            director
        });
        try {
            const script = new vm_1.Script(result);
            script.runInContext(context);
            this.buffer = context.buffer;
        }
        catch (error) {
            console.error(error);
        }
    }
    getProtoID() {
        return generatorProtoID(this.interfaceName);
    }
    getPackerType() {
        const wb = this.main;
        switch (wb.rows[5].cells[0].text) {
            case "PACKER(LIST)" /* KeyWords.PACKER_LIST */:
                return 0 /* PACKER.LIST */;
            case "PACKER(KV)" /* KeyWords.PACKER_KV */:
                return 2 /* PACKER.KV */;
            case "PACKER(MAP)" /* KeyWords.PACKER_MAP */:
                return 1 /* PACKER.MAP */;
            default:
                throw new Error("其他类型不支持存在与MAIN SHEET中");
        }
    }
    packKVData() {
        const main = this.wbs.get("main");
        const types = main === null || main === void 0 ? void 0 : main.types;
        const data = {};
        const isObj = this.types.packs.indexOf("IDOBJ" /* KeyWords.IDOBJ */);
        const isKey = this.types.packs.indexOf("IDKEY" /* KeyWords.IDKEY */);
        this.types.mod.forEach((v, k) => {
            data[k] = {};
        });
        // 按照interface打包
        for (let i = 0; i < types.length; i++) {
            for (let key in main === null || main === void 0 ? void 0 : main.rows) {
                if (+key <= 5) {
                    continue;
                }
                const value = main === null || main === void 0 ? void 0 : main.rows[+key].cells;
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
                this.getTypeValue(input, this);
            }
        }
        return data;
    }
    packLMData() {
        // 是一个interface数组
        const data = [];
        // 从main sheet 开始打包
        const main = this.wbs.get("main");
        const types = main === null || main === void 0 ? void 0 : main.types;
        // 按照interface打包
        for (let i = 0; i < types.length; i++) {
            for (let key in main === null || main === void 0 ? void 0 : main.rows) {
                if (+key <= 5) {
                    continue;
                }
                const value = main === null || main === void 0 ? void 0 : main.rows[+key].cells;
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
                this.getTypeValue(input, this);
            }
        }
        return data;
    }
    getTypeValue(t, re) {
        const error = `配置表${re.interfaceName}解析失败` + t.source.indx + "_" + t.source.name + "_" + t.source.indx;
        const isArray = t.source.type.endsWith("[]");
        let ty = t.source.type;
        if (isArray) {
            ty = t.source.type.replace("[]", "");
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
                    }
                    else {
                        // 空值默认为0
                        t.values[t.source.indx].text = 0;
                    }
                }
                let list = t.values[t.source.indx].text + "";
                if (isArray) {
                    t.data[t.source.name] = list.split(";").map(v => +v);
                }
                else {
                    t.data[t.source.name] = +list;
                }
                (t.data[t.source.name] == void 0, error);
                break;
            }
            case "bool":
                (0, exports.assert)(isArray, "暂不支持数组类型");
                if (t.values[t.source.indx] == void 0) {
                    t.values[t.source.indx] = { text: undefined };
                }
                const v = t.values[t.source.indx].text;
                if (v != void 0) {
                    if (typeof v == "number") {
                        if (+v > 0) {
                            t.data[t.source.name] = true;
                        }
                        else {
                            t.data[t.source.name] = false;
                        }
                    }
                    if (typeof v == "string") {
                        if (v == "true") {
                            t.data[t.source.name] = true;
                        }
                        else if (v == "false") {
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
                (0, exports.assert)(t.data[t.source.name] == void 0, error);
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
                    t.data[t.source.name] = list.split(";");
                }
                else {
                    t.data[t.source.name] = list + "";
                }
                (0, exports.assert)(t.data[t.source.name] == void 0, error);
                break;
            case "bytes":
                (0, exports.assert)(true, "不支持");
                break;
            case "limit":
            // 函数类型
            case "fn":
            // 条件类型
            case "condition":
            // 公式类型
            case "formula":
                (0, exports.assert)(isArray, "暂不支持数组类型");
                (0, exports.assert)(!t.values[t.source.indx], "请检查数据源");
                (0, exports.assert)(!t.values[t.source.indx].text && t.values[t.source.indx].text != "0", "请检查数据源");
                try {
                    const p = (0, compiler_1.compile)(t.values[t.source.indx].text, ty);
                    t.data[t.source.name] = p;
                }
                catch (e) {
                    (0, exports.assert)(true, (`解析复杂类型失败:类型:${ty}` +
                        e.toString() +
                        "source:" +
                        t.values[t.source.indx].text));
                }
                (0, exports.assert)(t.data[t.source.name] == void 0, error);
                break;
            default:
                // object or enum or others
                (0, exports.assert)(isArray, "暂不支持数组类型");
                const sheet = getValue(ty);
                if (ty.startsWith("object" /* KeyWords.Object */)) {
                    // 接口
                    const iface = {};
                    const sub = re.sls.get(sheet);
                    const types = sub === null || sub === void 0 ? void 0 : sub.main.types;
                    const main = sub === null || sub === void 0 ? void 0 : sub.main;
                    for (let key in main === null || main === void 0 ? void 0 : main.rows) {
                        if (+key == t.idx) {
                            for (let i = 0; i < types.length; i++) {
                                const value = main === null || main === void 0 ? void 0 : main.rows[+key].cells;
                                const input = {
                                    source: types[i],
                                    idx: t.idx,
                                    values: value,
                                    data: iface,
                                };
                                this.getTypeValue(input, this);
                            }
                            t.data[t.source.name] = iface;
                            break;
                        }
                    }
                }
                else if (ty.startsWith("enum" /* KeyWords.Enum */)) {
                    // 枚举
                    const sub = re.sls.get(sheet);
                    const names = sub === null || sub === void 0 ? void 0 : sub.types.names;
                    const packs = sub === null || sub === void 0 ? void 0 : sub.types.packs;
                    if (typeof t.values[t.source.indx].text == "number") {
                        t.data[t.source.name] = t.values[t.source.indx].text;
                    }
                    else if (typeof t.values[t.source.indx].text == "string") {
                        (0, exports.assert)(t.values[t.source.indx].text == void 0, "解析枚举失败");
                        const index = names.indexOf(t.values[t.source.indx].text);
                        if (index != -1) {
                            t.data[t.source.name] = packs[index];
                        }
                        else {
                            // t.data[t.source.name] = t.values[t.source.indx].text;
                            (0, exports.assert)(true, `在${names}中未找到枚举项 ${t.values[t.source.indx].text}`);
                        }
                    }
                }
                (0, exports.assert)(t.data[t.source.name] == void 0, error);
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
    createProperty(docs, names, types, packs, filter = false) {
        const props = [];
        // 从1开始
        // 因为0 是注释
        for (let i = 1, l = names.length; i < l; i++) {
            const n = names[i];
            const t = types[i];
            if (filter && packs[i] != "IDVALUE" /* KeyWords.IDVALUE */) {
                continue;
            }
            const tn = this.getType(t);
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
            });
        }
        return props;
    }
    getType(t) {
        const isArray = t.endsWith("[]");
        if (isArray) {
            t = t.replace("[]", "");
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
                return firstUpperCase(getValue(t));
        }
    }
}
class SubReadExcel extends ReadExcel {
    constructor(name, sheet, types) {
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
    parse() {
        this.createInterface();
    }
    createInterface() {
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
            case "PACKER(LIST)" /* KeyWords.PACKER_LIST */:
            case "PACKER(MAP)" /* KeyWords.PACKER_MAP */:
                this.createLM(sf);
                break;
            case "PACKER(ENUM)" /* KeyWords.PACKER_ENUM */:
                this.createEnum(sf);
                break;
            // 多维的KV打包
            default:
                console.log("子项无法使用除PACKER_LIST和PACKER_ENUM打包以外的任何方式");
                break;
        }
    }
}
class ParserOptions {
    constructor(input, output_bin, output_ts, cstype, globalModuleName, globalModuleTSName, globalModuleInterfaceName) {
        this.input = input;
        this.output_bin = output_bin;
        this.output_ts = output_ts;
        this.cstype = cstype;
        this.globalModuleName = globalModuleName;
        this.globalModuleTSName = globalModuleTSName;
        this.globalModuleInterfaceName = globalModuleInterfaceName;
    }
}
exports.ParserOptions = ParserOptions;
class Parser {
    constructor(options) {
        this.args = {
            input: "",
            output: "",
            ts: "",
            cstype: "server",
            globalModuleName: "",
            globalModuleTSName: "",
            globalModuleInterfaceName: ""
        };
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
    projectPath(path) {
        return path.replace("project:/", Editor.Project.path);
    }
    createProject() {
        return new ts_morph_1.Project({
            compilerOptions: {
                incremental: true,
                target: ts_morph_1.ts.ScriptTarget.ES5,
                module: ts_morph_1.ts.ModuleKind.CommonJS,
                declaration: true,
                sourceMap: true,
                composite: true,
                strict: true,
                moduleResolution: ts_morph_1.ts.ModuleResolutionKind.NodeJs,
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
    async execute(init, cb, progress) {
        const bytes = new byte_1.Byte();
        const f = new file_1.File(this.args.input);
        this.project = this.createProject();
        if ((0, fs_1.existsSync)((0, path_1.join)(this.args.ts, `${this.args.globalModuleTSName}.ts`))) {
            (0, fs_1.unlinkSync)((0, path_1.join)(this.args.ts, `${this.args.globalModuleTSName}.ts`));
        }
        const sfg = this.project.createSourceFile((0, path_1.join)(this.args.ts, `${this.args.globalModuleTSName}.ts`), "");
        let present = 0;
        sfg.addStatements(w => w.write(`${"declare" /* KeyWords.Declare */} ${"global" /* KeyWords.Global */}`).block(() => {
            let allFiles = f.getAllFiles(".xlsx");
            let data = [];
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
            });
            init && init(data);
            allFiles.forEach(f => {
                // 过滤excel打开后自动创建的副本
                if (f.name.startsWith("~$")) {
                    return;
                }
                const r = new ReadExcel(f, this.createProject(), new file_1.File(this.args.ts));
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
                    w.write(`${"interface" /* KeyWords.Interface */} ${this.args.globalModuleInterfaceName}`).block(() => {
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
        }));
        this.project.getSourceFiles().forEach(f => f.formatText());
        sfg.save();
        // save data
        await (0, file_1.dirExists)(this.args.output);
        (0, fs_1.writeFileSync)((0, path_1.join)(this.args.output, "cfg.bin"), bytes.getUint8Array(0, bytes.pos));
    }
}
exports.Parser = Parser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2NvbXBpbGVyL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7QUFHSCxrREFBK0Q7QUFDL0QsMkJBQTJEO0FBQzNELCtCQUE0QjtBQUM1Qix1Q0Fja0I7QUFDbEIsMkJBQTJDO0FBQzNDLGlDQUF5QztBQUV6QyxnREFBd0I7QUFDeEIsaUNBQThCO0FBQzlCLHlDQUFxQztBQUNyQywrQ0FBZ0U7QUFDaEUsMkNBQWlHO0FBQzFGLE1BQU0sTUFBTSxHQUFHLFVBQVUsU0FBa0IsRUFBRSxPQUFlO0lBQy9ELElBQUksU0FBUyxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFKVyxRQUFBLE1BQU0sVUFJakI7QUFFRixNQUFNLFNBQVM7SUFDSixNQUFNLENBQUMsWUFBWSxDQUFDLEtBQWEsSUFBSSxDQUFDO0NBQ2hEO0FBRUQsTUFBTSxRQUFRLEdBQUc7SUFDYixFQUFFLEtBQUssQ0FBQztDQUNYLENBQUE7QUFFRCxNQUFNLEdBQUcsR0FBRyx1R0FBdUcsQ0FBQztBQUVwSCxTQUFTLEtBQUssQ0FBQyxHQUFXO0lBQ3RCLFNBQVMsVUFBVSxDQUFDLE1BQWM7UUFDOUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7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RyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUvQixNQUFNLFVBQVUsR0FBd0IsRUFBRSxDQUFDO1FBQzNDLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUF3QixFQUFFLENBQUM7UUFDM0MsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFH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QkFFckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDWixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzNCLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpDLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUNMLENBQUM7UUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzNELEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLFlBQVk7UUFDWixNQUFNLElBQUEsZ0JBQVMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDO1FBQ25DLElBQUEsa0JBQWEsRUFBQyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0NBQ0o7QUEvSkQsd0JBK0pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICogIEBzZWUgaHR0cHM6Ly90cy1hc3Qtdmlld2VyLmNvbS9cbiAqXG4gKiAg55So5p2l5omT5YyFRXhjZWzliLBQcm90b2J1ZlxuICpcbiAqL1xuXG5cbmltcG9ydCB7IE1lc3NhZ2VUeXBlLCBSZXBlYXRUeXBlIH0gZnJvbSBcIkBwcm90b2J1Zi10cy9ydW50aW1lXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCB1bmxpbmtTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7XG4gICAgQ2xhc3NEZWNsYXJhdGlvblN0cnVjdHVyZSxcbiAgICBDb2RlQmxvY2tXcml0ZXIsXG4gICAgQ29uc3RydWN0b3JEZWNsYXJhdGlvbixcbiAgICBFbnVtRGVjbGFyYXRpb25TdHJ1Y3R1cmUsXG4gICAgRW51bU1lbWJlclN0cnVjdHVyZSxcbiAgICBJbnRlcmZhY2VEZWNsYXJhdGlvbixcbiAgICBJbnRlcmZhY2VEZWNsYXJhdGlvblN0cnVjdHVyZSxcbiAgICBQcm9qZWN0LFxuICAgIFByb3BlcnR5U2lnbmF0dXJlU3RydWN0dXJlLFxuICAgIFNvdXJjZUZpbGUsXG4gICAgVmFyaWFibGVEZWNsYXJhdGlvbktpbmQsXG4gICAgVmFyaWFibGVTdGF0ZW1lbnRTdHJ1Y3R1cmUsXG4gICAgdHNcbn0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgeyBTY3JpcHQsIGNyZWF0ZUNvbnRleHQgfSBmcm9tIFwidm1cIjtcbmltcG9ydCB7IEZpbGUsIGRpckV4aXN0cyB9IGZyb20gXCIuL2ZpbGVcIjtcblxuaW1wb3J0IHhsc3ggZnJvbSBcInhsc3hcIjtcbmltcG9ydCB7IEJ5dGUgfSBmcm9tIFwiLi9ieXRlXCI7XG5pbXBvcnQgeyBjb21waWxlIH0gZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCB7IEV4cHJlc3Npb25zLCBFeHByZXNzaW9uc0hhbmRsZXIgfSBmcm9tIFwiLi9leHByZXNzaW9uc1wiO1xuaW1wb3J0IHsgS2V5V29yZHMsIFBRSW5wdXQsIFBRV29ya0Jvb2ssIFByb3RvQnVmU2NhbGFyVHlwZSwgU2NhbGFyVHlwZVZhbHVlIH0gZnJvbSBcIi4vd29yay1ib29rXCI7XG5leHBvcnQgY29uc3QgYXNzZXJ0ID0gZnVuY3Rpb24gKGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxufTtcblxuY2xhc3MgQ29udGFpbmVyIHtcbiAgICBwdWJsaWMgc3RhdGljIGdldEludGVyZmFjZShpZmFjZTogc3RyaW5nKSB7IH1cbn1cblxuY29uc3QgZGlyZWN0b3IgPSB7XG4gICAgb24oKSB7IH1cbn1cblxuY29uc3QgbXNnID0gXCJRTj0yMDE2MDgwMTA4NTg1NzIyMztTVD0zMjtDTj0xMDYyO1BXPTEwMDAwMDtNTj0wMTAwMDBBODkwMDAxNkYwMDAxNjlEQzA7RmxhZz01O0NQPSYmUnRkSW50ZXJ2YWw9MzAmJlwiO1xuXG5mdW5jdGlvbiBjcmMzMihzdHI6IHN0cmluZykge1xuICAgIGZ1bmN0aW9uIFV0ZjhFbmNvZGUoc3RyaW5nOiBzdHJpbmcpIHtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xcclxcbi9nLCBcIlxcblwiKTtcblxuICAgICAgICB2YXIgdXRmdGV4dCA9IFwiXCI7XG5cbiAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBzdHJpbmcubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIHZhciBjID0gc3RyaW5nLmNoYXJDb2RlQXQobik7XG5cbiAgICAgICAgICAgIGlmIChjIDwgMTI4KSB7XG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjID4gMTI3ICYmIGMgPCAyMDQ4KSB7XG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDYpIHwgMTkyKTtcblxuICAgICAgICAgICAgICAgIHV0ZnRleHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyAmIDYzKSB8IDEyOCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0ZnRleHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyA+PiAxMikgfCAyMjQpO1xuXG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYyA+PiA2KSAmIDYzKSB8IDEyOCk7XG5cbiAgICAgICAgICAgICAgICB1dGZ0ZXh0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiA2MykgfCAxMjgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHV0ZnRleHQ7XG4gICAgfVxuXG4gICAgc3RyID0gVXRmOEVuY29kZShzdHIpO1xuICAgIGxldCBjcmMgPSAwO1xuXG4gICAgdmFyIHRhYmxlID1cbiAgICAgICAgXCIwMDAwMDAwMCA3NzA3MzA5NiBFRTBFNjEyQyA5OTA5NTFCQSAwNzZEQzQxOSA3MDZBRjQ4RiBFOTYzQTUzNSA5RTY0OTVBMyAwRURCODgzMiA3OURDQjhBNCBFMEQ1RTkxRSA5N0QyRDk4OCAwOUI2NEMyQiA3RUIxN0NCRCBFN0I4MkQwNyA5MEJGMUQ5MSAxREI3MTA2NCA2QUIwMjBGMiBGM0I5NzE0OCA4NEJFNDFERSAxQURBRDQ3RCA2RERERTRFQiBGNEQ0QjU1MSA4M0QzODVDNyAxMzZDOTg1NiA2NDZCQThDMCBGRDYyRjk3QSA4QTY1QzlFQyAxNDAxNUM0RiA2MzA2NkNEOSBGQTBGM0Q2MyA4RDA4MERGNSAzQjZFMjBDOCA0QzY5MTA1RSBENTYwNDFFNCBBMjY3NzE3MiAzQzAzRTREMSA0QjA0RDQ0NyBEMjBEODVGRCBBNTBBQjU2QiAzNUI1QThGQSA0MkIyOTg2QyBEQkJCQzlENiBBQ0JDRjk0MCAzMkQ4NkNFMyA0NURGNUM3NSBEQ0Q2MERDRiBBQkQxM0Q1OSAyNkQ5MzBBQyA1MURFMDAzQSBDOEQ3NTE4MCBCRkQwNjExNiAyMUI0RjRCNSA1NkIzQzQyMyBDRkJBOTU5OSBCOEJEQTUwRiAyODAyQjg5RSA1RjA1ODgwOCBDNjBDRDlCMiBCMTBCRTkyNCAyRjZGN0M4NyA1ODY4NEMxMSBDMTYxMURBQiBCNjY2MkQzRCA3NkRDNDE5MCAwMURCNzEwNiA5OEQyMjBCQyBFRkQ1MTAyQSA3MUIxODU4OSAwNkI2QjUxRiA5RkJGRTRBNSBFOEI4RDQzMyA3ODA3QzlBMiAwRjAwRjkzNCA5NjA5QTg4RSBFMTBFOTgxOCA3RjZBMERCQiAwODZEM0QyRCA5MTY0NkM5NyBFNjYzNUMwMSA2QjZCNTFGNCAxQzZDNjE2MiA4NTY1MzBEOCBGMjYyMDA0RSA2QzA2OTVFRCAxQjAxQTU3QiA4MjA4RjRDMSBGNTBGQzQ1NyA2NUIwRDlDNiAxMkI3RTk1MCA4QkJFQjhFQSBGQ0I5ODg3QyA2MkREMURERiAxNURBMkQ0OSA4Q0QzN0NGMyBGQkQ0NEM2NSA0REIyNjE1OCAzQUI1NTFDRSBBM0JDMDA3NCBENEJCMzBFMiA0QURGQTU0MSAzREQ4OTVENyBBNEQxQzQ2RCBEM0Q2RjRGQiA0MzY5RTk2QSAzNDZFRDlGQyBBRDY3ODg0NiBEQTYwQjhEMCA0NDA0MkQ3MyAzMzAzMURFNSBBQTBBNEM1RiBERDBEN0NDOSA1MDA1NzEzQyAyNzAyNDFBQSBCRTBCMTAxMCBDOTBDMjA4NiA1NzY4QjUyNSAyMDZGODVCMyBCOTY2RDQwOSBDRTYxRTQ5RiA1RURFRjkwRSAyOUQ5Qzk5OCBCMEQwOTgyMiBDN0Q3QThCNCA1OUIzM0QxNyAyRUI0MEQ4MSBCN0JENUMzQiBDMEJBNkNBRCBFREI4ODMyMCA5QUJGQjNCNiAwM0I2RTIwQyA3NEIxRDI5QSBFQUQ1NDczOSA5REQyNzdBRiAwNERCMjYxNSA3M0RDMTY4MyBFMzYzMEIxMiA5NDY0M0I4NCAwRDZENkEzRSA3QTZBNUFBOCBFNDBFQ0YwQiA5MzA5RkY5RCAwQTAwQUUyNyA3RDA3OUVCMSBGMDBGOTM0NCA4NzA4QTNEMiAxRTAxRjI2OCA2OTA2QzJGRSBGNzYyNTc1RCA4MDY1NjdDQiAxOTZDMzY3MSA2RTZCMDZFNyBGRUQ0MUI3NiA4OUQzMkJFMCAxMERBN0E1QSA2N0RENEFDQyBGOUI5REY2RiA4RUJFRUZGOSAxN0I3QkU0MyA2MEIwOEVENSBENkQ2QTNFOCBBMUQxOTM3RSAzOEQ4QzJDNCA0RkRGRjI1MiBEMUJCNjdGMSBBNkJDNTc2NyAzRkI1MDZERCA0OEIyMzY0QiBEODBEMkJEQSBBRjBBMUI0QyAzNjAzNEFGNiA0MTA0N0E2MCBERjYwRUZDMyBBODY3REY1NSAzMTZFOEVFRiA0NjY5QkU3OSBDQjYxQjM4QyBCQzY2ODMxQSAyNTZGRDJBMCA1MjY4RTIzNiBDQzBDNzc5NSBCQjBCNDcwMyAyMjAyMTZCOSA1NTA1MjYyRiBDNUJBM0JCRSBCMkJEMEIyOCAyQkI0NUE5MiA1Q0IzNkEwNCBDMkQ3RkZBNyBCNUQwQ0YzMSAyQ0Q5OUU4QiA1QkRFQUUxRCA5QjY0QzJCMCBFQzYzRjIyNiA3NTZBQTM5QyAwMjZEOTMwQSA5QzA5MDZBOSBFQjBFMzYzRiA3MjA3Njc4NSAwNTAwNTcxMyA5NUJGNEE4MiBFMkI4N0ExNCA3QkIxMkJBRSAwQ0I2MUIzOCA5MkQyOEU5QiBFNUQ1QkUwRCA3Q0RDRUZCNyAwQkRCREYyMSA4NkQzRDJENCBGMUQ0RTI0MiA2OEREQjNGOCAxRkRBODM2RSA4MUJFMTZDRCBGNkI5MjY1QiA2RkIwNzdFMSAxOEI3NDc3NyA4ODA4NUFFNiBGRjBGNkE3MCA2NjA2M0JDQSAxMTAxMEI1QyA4RjY1OUVGRiBGODYyQUU2OSA2MTZCRkZEMyAxNjZDQ0Y0NSBBMDBBRTI3OCBENzBERDJFRSA0RTA0ODM1NCAzOTAzQjNDMiBBNzY3MjY2MSBEMDYwMTZGNyA0OTY5NDc0RCAzRTZFNzdEQiBBRUQxNkE0QSBEOUQ2NUFEQyA0MERGMEI2NiAzN0Q4M0JGMCBBOUJDQUU1MyBERUJCOUVDNSA0N0IyQ0Y3RiAzMEI1RkZFOSBCREJERjIxQyBDQUJBQzI4QSA1M0IzOTMzMCAyNEI0QTNBNiBCQUQwMzYwNSBDREQ3MDY5MyA1NERFNTcyOSAyM0Q5NjdCRiBCMzY2N0EyRSBDNDYxNEFCOCA1RDY4MUIwMiAyQTZGMkI5NCBCNDBCQkUzNyBDMzBDOEVBMSA1QTA1REYxQiAyRDAyRUY4RFwiO1xuXG4gICAgaWYgKHR5cGVvZiBjcmMgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBjcmMgPSAwO1xuICAgIH1cblxuICAgIHZhciB4OiBzdHJpbmcgfCBudW1iZXIgPSAwO1xuXG4gICAgdmFyIHkgPSAwO1xuXG4gICAgY3JjID0gY3JjIF4gLTE7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaVRvcCA9IHN0ci5sZW5ndGg7IGkgPCBpVG9wOyBpKyspIHtcbiAgICAgICAgeSA9IChjcmMgXiBzdHIuY2hhckNvZGVBdChpKSkgJiAweGZmO1xuXG4gICAgICAgIHggPSBcIjB4XCIgKyB0YWJsZS5zdWJzdHIoeSAqIDksIDgpO1xuXG4gICAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gKCh4IGFzIHVua25vd24pIGFzIG51bWJlcik7XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coY3JjIF4gLTEpO1xuXG4gICAgLy8gQHNlZSBodHRwczovL3NlZ21lbnRmYXVsdC5jb20vcS8xMDEwMDAwMDEyMDAzNjc1XG4gICAgcmV0dXJuIGNyYyBeIC0xICsgMHhmZmZmZmZmZjtcbn1cblxuLyoqXG4gKiDmiZPljIXmlrnlvI9cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gUEFDS0VSIHtcbiAgICAvKipcbiAgICAgKiAg5pWw57uE5omT5YyFXG4gICAgICovXG4gICAgTElTVCxcblxuICAgIC8qKlxuICAgICAqICBIYXNoTWFw5omT5YyFXG4gICAgICovXG4gICAgTUFQLFxuXG4gICAgLyoqXG4gICAgICog6ZSu5YC85a+55omT5YyFXG4gICAgICovXG4gICAgS1YsXG59XG5cbi8vbGV0IGlkID0gMTAwMDA7XG5jb25zdCBpZE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5jb25zdCBnZW5lcmF0b3JQcm90b0lEID0gKG5hbWU6IHN0cmluZykgPT4gaWRNYXAuZ2V0KG5hbWUpID8/IGlkTWFwLnNldChuYW1lLCBjcmMzMihuYW1lKS50b1N0cmluZygpKS5nZXQobmFtZSkhO1xuXG5pbnRlcmZhY2UgRGljdCB7XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG4vKipcbiAqIOmmluWtl+avjeWkp+WGmVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqL1xuY29uc3QgZmlyc3RVcHBlckNhc2UgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5yZXBsYWNlKHN0clswXSwgc3RyWzBdLnRvVXBwZXJDYXNlKCkpOy8vc3RyLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKCB8XilbYS16XS9nLCBMID0+IEwudG9VcHBlckNhc2UoKSk7XG5cbmNvbnN0IG5hbWVKb2luID0gKG9sZDogc3RyaW5nKSA9PiB7XG4gICAgLy8g6aaW5a2X5q+N5bCP5YaZXG4gICAgb2xkID0gb2xkLnJlcGxhY2Uob2xkWzBdLCBvbGRbMF0udG9Mb3dlckNhc2UoKSk7XG5cbiAgICAvLyDnhLblkI7lvIDlp4vmi7zmjqVcbiAgICBjb25zdCBzdHJpbmdBcnJheSA9IG9sZC5zcGxpdCgnJyk7XG4gICAgbGV0IG5ld0ZpZWxkID0gb2xkO1xuICAgIHN0cmluZ0FycmF5LmZvckVhY2godCA9PiB7XG4gICAgICAgIGlmICgvW0EtWl0vLnRlc3QodCkpIHtcbiAgICAgICAgICAgIG5ld0ZpZWxkID0gbmV3RmllbGQucmVwbGFjZSh0LCBgLSR7dC50b0xvd2VyQ2FzZSgpfWApXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3RmllbGQ7XG59XG5cbi8qKlxuICog5o+Q5Y+W5ous5Y+35YaF55qE5YC8XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICovXG5jb25zdCB2YWx1ZU9mUGF0dGVybiA9IChzdHI6IHN0cmluZykgPT4gc3RyLm1hdGNoKC8oPzw9XFwoKS4qKD89XFwpKS9nKTtcblxuLyoqXG4gKiDojrflj5boo4XnrrHmi4bnrrHpmLbmrrXnmoTlrp7pmYXnsbvlnotcbiAqXG4gKiBAcGFyYW0ge1Byb3RvQnVmU2NhbGFyVHlwZX0gdFxuICogQHJldHVybiB7Kn0gIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFByb3RvQnVmVHlwZSA9IGZ1bmN0aW9uICh0OiBQcm90b0J1ZlNjYWxhclR5cGUpOiBzdHJpbmcge1xuICAgIGxldCB0MSA9IFwiXCI7XG4gICAgc3dpdGNoICh0KSB7XG4gICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLkRPVUJMRX0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5ET1VCTEV9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuRkxPQVR9ICAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLkZMT0FUfSovYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLklOVDMyfSAgLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5JTlQzMn0qL2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImludDY0XCI6XG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5JTlQ2NH0gIC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuSU5UNjR9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ1aW50MzJcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLlVJTlQzMn0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5VSU5UMzJ9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ1aW50NjRcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLlVJTlQ2NH0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5VSU5UNjR9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzaW50MzJcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLlNJTlQzMn0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5TSU5UMzJ9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzaW50NjRcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLlNJTlQ2NH0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5TSU5UNjR9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXhlZDMyXCI6XG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5GSVhFRDMyfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLkZJWEVEMzJ9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXhlZDY0XCI6XG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5GSVhFRDY0fSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLkZJWEVENjR9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZml4ZWQzMlwiOlxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuU0ZJWEVEMzJ9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuU0ZJWEVEMzJ9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZml4ZWQ2NFwiOlxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuU0ZJWEVENjR9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuU0ZJWEVENjR9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJib29sXCI6XG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5CT09MfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLkJPT0x9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLlNUUklOR30gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5TVFJJTkd9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJieXRlc1wiOlxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuQllURVN9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuQllURVN9Ki9gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIOmZkOWItuexu+Wei1xuICAgICAgICBjYXNlIFwibGltaXRcIjpcbiAgICAgICAgLy8g5Ye95pWw57G75Z6LXG4gICAgICAgIGNhc2UgXCJmblwiOlxuICAgICAgICAvLyDmnaHku7bnsbvlnotcbiAgICAgICAgY2FzZSBcImNvbmRpdGlvblwiOlxuICAgICAgICAvLyDlhazlvI/nsbvlnotcbiAgICAgICAgY2FzZSBcImZvcm11bGFcIjpcbiAgICAgICAgICAgIHQxID0gYCgpID0+IEV4cHJlc3Npb25zSGFuZGxlcmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IHN0ciA9IHQgYXMgc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gZ2V0VmFsdWUoc3RyKTtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQXJyYXkgPSBzdHIuZW5kc1dpdGgoXCJbXVwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UHJvdG9CdWZUeXBlKHN0ci5yZXBsYWNlKFwiW11cIiwgXCJcIikgYXMgUHJvdG9CdWZTY2FsYXJUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCLnsbvlnovkuI3mlK/mjIFcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdHIuc3RhcnRzV2l0aChLZXlXb3Jkcy5PYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoKSA9PiAke2ZpcnN0VXBwZXJDYXNlKHZhbHVlKX1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCgpID0+IFtcIiR7Zmlyc3RVcHBlckNhc2UodmFsdWUpfVwiLCR7Zmlyc3RVcHBlckNhc2UodmFsdWUpfV1gO1xuICAgICAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdDE7XG59O1xuXG4vKipcbiAqIOiOt+WPluijheeuseaLhueusemYtuauteeahOexu+Wei+exu+Wei1xuICpcbiAqIEBwYXJhbSB7UHJvdG9CdWZTY2FsYXJUeXBlfSB0XG4gKiBAcmV0dXJuIHsqfSAgeyhcInNjYWxhclwiIHwgXCJtZXNzYWdlXCIgfCBcImVudW1cIiB8IFwibWFwXCIpfVxuICovXG5jb25zdCBnZXRQcm90b0J1ZlNjYWxhclR5cGUgPSBmdW5jdGlvbiAodDogUHJvdG9CdWZTY2FsYXJUeXBlKTogXCJzY2FsYXJcIiB8IFwibWVzc2FnZVwiIHwgXCJlbnVtXCIgfCBcIm1hcFwiIHtcbiAgICBsZXQgdDEgPSBcIlwiIGFzIFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIjtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcImRvdWJsZVwiOlxuICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgIGNhc2UgXCJpbnQ2NFwiOlxuICAgICAgICBjYXNlIFwidWludDMyXCI6XG4gICAgICAgIGNhc2UgXCJ1aW50NjRcIjpcbiAgICAgICAgY2FzZSBcInNpbnQzMlwiOlxuICAgICAgICBjYXNlIFwic2ludDY0XCI6XG4gICAgICAgIGNhc2UgXCJmaXhlZDMyXCI6XG4gICAgICAgIGNhc2UgXCJmaXhlZDY0XCI6XG4gICAgICAgIGNhc2UgXCJzZml4ZWQzMlwiOlxuICAgICAgICBjYXNlIFwic2ZpeGVkNjRcIjpcbiAgICAgICAgY2FzZSBcImJvb2xcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgdDEgPSBcInNjYWxhclwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsaW1pdFwiOlxuICAgICAgICAvLyDpmZDliLbnsbvlnotcbiAgICAgICAgY2FzZSBcImJ5dGVzXCI6XG4gICAgICAgIC8vIOWHveaVsOexu+Wei1xuICAgICAgICBjYXNlIFwiZm5cIjpcbiAgICAgICAgLy8g5p2h5Lu257G75Z6LXG4gICAgICAgIGNhc2UgXCJjb25kaXRpb25cIjpcbiAgICAgICAgLy8g5YWs5byP57G75Z6LXG4gICAgICAgIGNhc2UgXCJmb3JtdWxhXCI6XG4gICAgICAgICAgICB0MSA9IFwibWVzc2FnZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBzdHIgPSB0IGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmIChzdHIuc3RhcnRzV2l0aChLZXlXb3Jkcy5PYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgdDEgPSBcIm1lc3NhZ2VcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyLmVuZHNXaXRoKFwiW11cIikpIHtcbiAgICAgICAgICAgICAgICB0MSA9IGdldFByb3RvQnVmU2NhbGFyVHlwZShzdHIucmVwbGFjZShcIltdXCIsIFwiXCIpIGFzIFByb3RvQnVmU2NhbGFyVHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHQxID0gXCJlbnVtXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHQxO1xufTtcblxuY29uc3Qgc2NhbGFyX25vX3JlcGVhdCA9IChcbiAgICBubzogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBraW5kOiBcInNjYWxhclwiIHwgXCJtZXNzYWdlXCIgfCBcImVudW1cIiB8IFwibWFwXCIsXG4gICAgdHlwZTogUHJvdG9CdWZTY2FsYXJUeXBlLFxuKSA9PiBgeyBubzoke25vfSxuYW1lOlwiJHtuYW1lfVwiLGtpbmQ6XCIke2tpbmR9XCIsVDoke2dldFByb3RvQnVmVHlwZSh0eXBlKX19YDtcbmNvbnN0IHNjYWxhcl9yZXBlYXQgPSAoXG4gICAgbm86IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAga2luZDogXCJzY2FsYXJcIiB8IFwibWVzc2FnZVwiIHwgXCJlbnVtXCIgfCBcIm1hcFwiLFxuICAgIHR5cGU6IFByb3RvQnVmU2NhbGFyVHlwZSxcbikgPT4ge1xuICAgIGlmICh0eXBlLnN0YXJ0c1dpdGgoXCJzdHJpbmdcIikpIHtcbiAgICAgICAgcmV0dXJuIGB7IG5vOiR7bm99LG5hbWU6XCIke25hbWV9XCIsa2luZDpcIiR7a2luZH1cIixyZXBlYXQ6JHtSZXBlYXRUeXBlLlVOUEFDS0VEXG4gICAgICAgICAgICB9IC8qUmVwZWF0VHlwZS5VTlBBQ0tFRCovLFQ6JHtnZXRQcm90b0J1ZlR5cGUodHlwZSl9fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGB7IG5vOiR7bm99LG5hbWU6XCIke25hbWV9XCIsa2luZDpcIiR7a2luZH1cIixyZXBlYXQ6JHtSZXBlYXRUeXBlLlBBQ0tFRFxuICAgICAgICAgICAgfSAvKlJlcGVhdFR5cGUuUEFDS0VEKi8sVDoke2dldFByb3RvQnVmVHlwZSh0eXBlKX19YDtcbiAgICB9XG59O1xuY29uc3Qgc2NhbGFyID0gKFxuICAgIG5vOiBudW1iZXIsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGtpbmQ6IFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIixcbiAgICByZXBlYXQ6IGJvb2xlYW4sXG4gICAgdHlwZTogUHJvdG9CdWZTY2FsYXJUeXBlLFxuKSA9PiAocmVwZWF0ID8gc2NhbGFyX3JlcGVhdChubywgbmFtZSwga2luZCwgdHlwZSkgOiBzY2FsYXJfbm9fcmVwZWF0KG5vLCBuYW1lLCBraW5kLCB0eXBlKSk7XG5cbmNvbnN0IGVudW0gU2NhbGFyVHlwZSB7XG4gICAgRE9VQkxFID0gXCJET1VCTEVcIixcbiAgICBGTE9BVCA9IFwiRkxPQVRcIixcbiAgICBJTlQ2NCA9IFwiSU5UNjRcIixcbiAgICBVSU5UNjQgPSBcIlVJTlQ2NFwiLFxuICAgIElOVDMyID0gXCJJTlQzMlwiLFxuICAgIEZJWEVENjQgPSBcIkZJWEVENjRcIixcbiAgICBGSVhFRDMyID0gXCJGSVhFRDMyXCIsXG4gICAgQk9PTCA9IFwiQk9PTFwiLFxuICAgIFNUUklORyA9IFwiU1RSSU5HXCIsXG4gICAgQllURVMgPSBcIkJZVEVTXCIsXG4gICAgVUlOVDMyID0gXCJVSU5UMzJcIixcbiAgICBTRklYRUQzMiA9IFwiU0ZJWEVEMzJcIixcbiAgICBTRklYRUQ2NCA9IFwiU0ZJWEVENjRcIixcbiAgICBTSU5UMzIgPSBcIlNJTlQzMlwiLFxuICAgIFNJTlQ2NCA9IFwiU0lOVDY0XCIsXG59XG5cbmNvbnN0IGNoYXJUb051bSA9IGZ1bmN0aW9uICh2YWw6IHN0cmluZykge1xuICAgIGxldCBiYXNlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiO1xuICAgIGxldCBiYXNlTnVtYmVyID0gYmFzZS5sZW5ndGg7XG5cbiAgICBsZXQgcnVubmluZ1RvdGFsID0gMDtcbiAgICBsZXQgY2hhcmFjdGVySW5kZXggPSAwO1xuICAgIGxldCBpbmRleEV4cG9uZW50ID0gdmFsLmxlbmd0aCAtIDE7XG5cbiAgICB3aGlsZSAoY2hhcmFjdGVySW5kZXggPCB2YWwubGVuZ3RoKSB7XG4gICAgICAgIGxldCBkaWdpdCA9IHZhbFtjaGFyYWN0ZXJJbmRleF07XG4gICAgICAgIGxldCBkaWdpdFZhbHVlID0gYmFzZS5pbmRleE9mKGRpZ2l0KSArIDE7XG4gICAgICAgIHJ1bm5pbmdUb3RhbCArPSBNYXRoLnBvdyhiYXNlTnVtYmVyLCBpbmRleEV4cG9uZW50KSAqIGRpZ2l0VmFsdWU7XG5cbiAgICAgICAgY2hhcmFjdGVySW5kZXggKz0gMTtcbiAgICAgICAgaW5kZXhFeHBvbmVudCAtPSAxO1xuICAgIH1cblxuICAgIHJldHVybiBydW5uaW5nVG90YWw7XG59O1xuXG5jb25zdCBudW1Ub0NoYXIgPSBmdW5jdGlvbiAobnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGxldCBudW1lcmljID0gKG51bWJlciAtIDEpICUgMjY7XG4gICAgbGV0IGxldHRlciA9IGNocig2NSArIG51bWVyaWMpO1xuICAgIC8vQHRzLWlnbm9yZVxuICAgIGxldCBudW1iZXIyID0gcGFyc2VJbnQoKG51bWJlciAtIDEpIC8gMjYpO1xuICAgIGlmIChudW1iZXIyID4gMCkge1xuICAgICAgICByZXR1cm4gbnVtVG9DaGFyKG51bWJlcjIpICsgbGV0dGVyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsZXR0ZXI7XG4gICAgfVxufTtcblxuY29uc3QgY2hyID0gZnVuY3Rpb24gKGNvZGVQdDogbnVtYmVyKSB7XG4gICAgaWYgKGNvZGVQdCA+IDB4ZmZmZikge1xuICAgICAgICBjb2RlUHQgLT0gMHgxMDAwMDtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhkODAwICsgKGNvZGVQdCA+PiAxMCksIDB4ZGMwMCArIChjb2RlUHQgJiAweDNmZikpO1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlUHQpO1xufTtcblxuY29uc3Qgc3RveCA9IGZ1bmN0aW9uIHN0b3god2I6IHhsc3guV29ya0Jvb2ssIGY6IHN0cmluZyk6IE1hcDxzdHJpbmcsIFBRV29ya0Jvb2s+IHwgbnVsbCB7XG4gICAgbGV0IG91dCA9IG5ldyBNYXA8c3RyaW5nLCBQUVdvcmtCb29rPigpO1xuICAgIGZvciAobGV0IG5hbWUgaW4gd2IuU2hlZXRzKSB7XG4gICAgICAgIC8vIHNoZWV0IOWQjeensFxuICAgICAgICBjb25zdCBvID0geyBuYW1lOiBuYW1lLCByb3dzOiB7fSwgbWVyZ2VzOiBbXSwgdHlwZXM6IFtdIH0gYXMgYW55O1xuXG4gICAgICAgIC8vIG1lcmdlczogW1xuICAgICAgICAvLyAgJ0ExOkYxMScsXG4gICAgICAgIC8vICAuLi5cbiAgICAgICAgLy8gXSxcblxuICAgICAgICAvLyBzaGVldCDlhoXlrrlcbiAgICAgICAgY29uc3QgdmFsdWUgPSB3Yi5TaGVldHNbbmFtZV07XG4gICAgICAgIGNvbnN0IG1lcmdlcyA9IHZhbHVlW1wiIW1lcmdlc1wiXTtcblxuICAgICAgICBpZiAobWVyZ2VzKSB7XG4gICAgICAgICAgICBtZXJnZXMuZm9yRWFjaChtZXJnZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHMgPSBtZXJnZS5zO1xuICAgICAgICAgICAgICAgIGxldCBlID0gbWVyZ2UuZTtcbiAgICAgICAgICAgICAgICBvLm1lcmdlcy5wdXNoKGAke251bVRvQ2hhcihzLmMgKyAxKX0ke3MuciArIDF9OiR7bnVtVG9DaGFyKGUuYyArIDEpfSR7ZS5yICsgMX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K+05piO5piv5Liq56m6c2hlZXRcbiAgICAgICAgaWYgKCF2YWx1ZVtcIiFyZWZcIl0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5byC5bi4OumFjee9ruacieepunNoZWV0XCIsIGYpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgcmVmID0gdmFsdWVbXCIhcmVmXCJdLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgLy8gcmVmIHZhbHVlIGxpa2UgXCJBMjpMMTFcIlxuXG4gICAgICAgIC8vIOaPkOWPlnJvd1xuICAgICAgICBjb25zdCBtYXhfcm93ID0gcmVmWzFdLm1hdGNoKC9bQS1aXS9nKSEuam9pbihcIlwiKTtcblxuICAgICAgICAvLyDmj5Dlj5Zjb2xcbiAgICAgICAgY29uc3QgbWF4X2NvbCA9ICtyZWZbMV0ubWF0Y2goL1swLTldL2dpKSEuam9pbihcIlwiKTtcbiAgICAgICAgY29uc3QgbWF4X3Jvd192YWx1ZSA9IGNoYXJUb051bShtYXhfcm93KTtcblxuICAgICAgICAvLyDpnIDopoHnmoRqc29u5b+F6aG75aSW5bGC5pivcm93cyzlhoXlsYLmmK9jZWxsc1xuICAgICAgICBmb3IgKGxldCBpID0gMSwgbCA9IG1heF9jb2w7IGkgPD0gbDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY2VsbHMgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMSwgbGVuID0gbWF4X3Jvd192YWx1ZTsgaiA8PSBsZW47IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBrZXkgPSBudW1Ub0NoYXIoaikgKyBpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGwgPSB2YWx1ZVtrZXldO1xuXG4gICAgICAgICAgICAgICAgLy8g5YWz6ZSu5o+P6L+wXG4gICAgICAgICAgICAgICAgLy8gdiDljp/lp4vlgLzvvIjor6bop4HmlbDmja7nsbvlnovpg6jliIbvvIlcbiAgICAgICAgICAgICAgICAvLyB3IOagvOW8j+WMluaWh+acrO+8iOWmgumAgueUqO+8iVxuICAgICAgICAgICAgICAgIC8vIHQg57G75Z6L77yaYuW4g+WwlOWAvO+8jGXplJnor6/vvIxu5pWw5a2X77yMZOaXpeacn++8jHPmlofmnKzvvIx65a2Y5qC5XG4gICAgICAgICAgICAgICAgLy8gZiDljZXlhYPmoLzlhazlvI/nvJbnoIHkuLpBMeagt+W8j+eahOWtl+espuS4su+8iOWmguaenOmAgueUqO+8iVxuICAgICAgICAgICAgICAgIC8vIEYg5aaC5p6c5YWs5byP5piv5pWw57uE5YWs5byP77yM5YiZ5YyF5Zu05pWw57uE55qE6IyD5Zu077yI5aaC5p6c6YCC55So77yJXG4gICAgICAgICAgICAgICAgLy8gciDlr4zmlofmnKznvJbnoIEo5aaC5p6c6YCC55SoKVxuICAgICAgICAgICAgICAgIC8vIGgg5Liw5a+M5paH5pys55qESFRNTOa4suafk++8iOWmgumAgueUqO+8iVxuICAgICAgICAgICAgICAgIC8vIGMg5LiO6K+l55S15rGg5pyJ5YWz55qE6K+E6K66XG4gICAgICAgICAgICAgICAgLy8geiDkuI7ljZXlhYPmoLznm7jlhbPogZTnmoTmlbDlrZfmoLzlvI/lrZfnrKbkuLLvvIjlpoLmnpzopoHmsYLvvIlcbiAgICAgICAgICAgICAgICAvLyBsIOWNleWFg+agvOi2hemTvuaOpeWvueixoe+8iC5UYXJnZXTkuLrpk77mjqXvvIwuVG9vbHRpcOS4uuW3peWFt+aPkOekuu+8iVxuICAgICAgICAgICAgICAgIC8vIHMg5piv5Y2V5YWD5qC855qE6aOO5qC8L+S4u+mimO+8iOWmguaenOmAgueUqO+8iVxuXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNbaiAtIDFdID0geyB0ZXh0OiBjZWxsLnYgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLnJvd3NbaSAtIDFdID0geyBjZWxsczogY2VsbHMgfTtcblxuICAgICAgICAgICAgLy8g57Si5byVSUTkuLo055qE5Luj6KGo57G75Z6LXG4gICAgICAgICAgICBpZiAoaSAtIDEgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8vIOe0ouW8lUlE5Li6M+eahOS7o+ihqOWxnuaAp+WQjeensFxuICAgICAgICAgICAgICAgIGNvbnN0IHZuID0gby5yb3dzWzNdLmNlbGxzO1xuICAgICAgICAgICAgICAgIC8vIOe0ouW8lUlE5Li6NOeahOS7o+ihqOWxnuaAp+exu+Wei1xuICAgICAgICAgICAgICAgIGNvbnN0IHZ0ID0gby5yb3dzWzRdLmNlbGxzO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGsgaW4gdnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtrICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8udHlwZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5keDogayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB2bltrXS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHZ0W2tdLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvdXQuc2V0KG5hbWUsIG8pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0ITtcbn07XG5cbmNvbnN0IGdldFZhbHVlID0gKHQ6IHN0cmluZykgPT4ge1xuICAgIGlmICh0LnN0YXJ0c1dpdGgoXCJvYmplY3RcIikgfHwgdC5zdGFydHNXaXRoKFwiZW51bVwiKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gdmFsdWVPZlBhdHRlcm4odCk7XG4gICAgICAgIGlmICghbmFtZSB8fCBuYW1lIS5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLlr7nosaHooajovr7lvI/plJnor69cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmFtZSFbMF07XG4gICAgfVxufTtcblxuY2xhc3MgUmVhZEV4Y2VsVHlwZSB7XG4gICAgcHVibGljIHJlOiBSZWFkRXhjZWw7XG4gICAgcHVibGljIG1haW46IFBRV29ya0Jvb2s7XG5cbiAgICAvKipcbiAgICAgKiDmiJDlkZjms6jph4pcbiAgICAgKlxuICAgICAqIEB0eXBlIHsoKHN0cmluZyB8IG51bWJlcilbXSl9XG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFR5cGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZG9jcyE6IChzdHJpbmcgfCBudW1iZXIpW107XG5cbiAgICAvKipcbiAgICAgKiDmiJDlkZjnsbvlnotcbiAgICAgKlxuICAgICAqIEB0eXBlIHsoKHN0cmluZyB8IG51bWJlcilbXSl9XG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFR5cGVcbiAgICAgKi9cbiAgICBwdWJsaWMgdHlwZXMhOiAoc3RyaW5nIHwgbnVtYmVyKVtdO1xuXG4gICAgLyoqXG4gICAgICog5oiQ5ZGY5ZCN56ewXG4gICAgICpcbiAgICAgKiBAdHlwZSB7KChzdHJpbmcgfCBudW1iZXIpW10pfVxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxUeXBlXG4gICAgICovXG4gICAgcHVibGljIG5hbWVzITogKHN0cmluZyB8IG51bWJlcilbXTtcblxuICAgIC8qKlxuICAgICAqIOaJk+WMheino+WMheexu+Wei+S/oeaBr1xuICAgICAqXG4gICAgICogQHR5cGUgeygoc3RyaW5nIHwgbnVtYmVyKVtdKX1cbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsVHlwZVxuICAgICAqL1xuICAgIHB1YmxpYyBwYWNrcyE6IChzdHJpbmcgfCBudW1iZXIpW107XG5cbiAgICBwdWJsaWMgbW9kITogTWFwPHN0cmluZywgc3RyaW5nPjtcblxuICAgIC8qKlxuICAgICAqIOino+aekOWlveeahOWvueixoS/mnprkuL7nsbvlnotcbiAgICAgKi9cbiAgICBwdWJsaWMgb2U6IE1hcDxzdHJpbmcsIFJlYWRFeGNlbD47XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocmU6IFJlYWRFeGNlbCwgbWFpbjogUFFXb3JrQm9vaykge1xuICAgICAgICB0aGlzLnJlID0gcmU7XG4gICAgICAgIHRoaXMubWFpbiA9IG1haW47XG4gICAgICAgIHRoaXMub2UgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubW9kID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLm1ha2VUeXBlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG1ha2VUeXBlKCkge1xuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcbiAgICAgICAgY29uc3QgZG9jcyA9IHdiLnJvd3NbMV0uY2VsbHM7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gd2Iucm93c1szXS5jZWxscztcbiAgICAgICAgY29uc3QgdHlwZXMgPSB3Yi5yb3dzWzRdLmNlbGxzO1xuICAgICAgICBjb25zdCBwYWNrcyA9IHdiLnJvd3NbNV0uY2VsbHM7XG5cbiAgICAgICAgY29uc3QgZG9jc190ZXh0czogKHN0cmluZyB8IG51bWJlcilbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZG9jcykge1xuICAgICAgICAgICAgZG9jc190ZXh0cy5wdXNoKGRvY3Nba2V5XS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWVfdGV4dHM6IChzdHJpbmcgfCBudW1iZXIpW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG5hbWVzKSB7XG4gICAgICAgICAgICBuYW1lX3RleHRzLnB1c2gobmFtZXNba2V5XS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGVfdGV4dHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHR5cGVzKSB7XG4gICAgICAgICAgICB0eXBlX3RleHRzLnB1c2godHlwZXNba2V5XS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhY2tfdGV4dHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBhY2tzKSB7XG4gICAgICAgICAgICBwYWNrX3RleHRzLnB1c2gocGFja3Nba2V5XS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZG9jcyA9IGRvY3NfdGV4dHM7XG4gICAgICAgIHRoaXMudHlwZXMgPSB0eXBlX3RleHRzO1xuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZV90ZXh0cztcbiAgICAgICAgdGhpcy5wYWNrcyA9IHBhY2tfdGV4dHM7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnBhY2tzWzBdKSB7XG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9LVjpcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLnBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURPQkopO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgaW4gd2Iucm93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCtpIDw9IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gd2Iucm93c1tpXS5jZWxscztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGsgPSBjZWxsc1sxXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZC5zZXQoayBhcyBzdHJpbmcsIGdlbmVyYXRvclByb3RvSUQoayBhcyBzdHJpbmcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnNlKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpID0gMSwgbCA9IHRoaXMudHlwZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy50eXBlc1tpXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZ2V0VmFsdWUodCk7XG4gICAgICAgICAgICB0aGlzLnBhcnNlT2JqZWN0KG5hbWUhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBwYXJzZU9iamVjdChuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVldCA9IHRoaXMucmUud2JzLmdldChuYW1lKSE7XG4gICAgICAgIGlmICghc2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5a+56LGh6KGo6L6+5byP6ZSZ6K+vXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmUgPSBuZXcgU3ViUmVhZEV4Y2VsKG5hbWUsIHNoZWV0LCB0aGlzKTtcbiAgICAgICAgcmUucGFyc2UoKTtcbiAgICAgICAgdGhpcy5vZS5zZXQobmFtZSwgcmUpO1xuICAgIH1cbn1cblxuY2xhc3MgUmVhZEV4Y2VsIHtcbiAgICAvKipcbiAgICAgKiBleGNlbOaWh+S7tuS9jee9rlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RmlsZX1cbiAgICAgKiBAbWVtYmVyb2YgUmVhZFxuICAgICAqL1xuICAgIHByaXZhdGUgX3VybCE6IEZpbGU7XG4gICAgcHJpdmF0ZSBfb3V0ITogRmlsZTtcblxuICAgIC8qKlxuICAgICAqIGV4Y2Vs5pWw5o2u6Kej5p6EXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHt4bHN4LldvcmtCb29rfVxuICAgICAqIEBtZW1iZXJvZiBSZWFkXG4gICAgICovXG4gICAgcHJpdmF0ZSBfd3MhOiB4bHN4LldvcmtCb29rO1xuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65p2l55qEanNvbuaVsOaNruino+aehFxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7UFFXb3JrQm9va1tdfVxuICAgICAqIEBtZW1iZXJvZiBSZWFkXG4gICAgICovXG4gICAgcHVibGljIG1haW4hOiBQUVdvcmtCb29rO1xuICAgIHB1YmxpYyB3YnMhOiBNYXA8c3RyaW5nLCBQUVdvcmtCb29rPjtcblxuICAgIHB1YmxpYyBzbHMhOiBNYXA8c3RyaW5nLCBSZWFkRXhjZWw+O1xuXG4gICAgLyoqXG4gICAgICogZXhjZWwg5a+55bqU55qE5o6l5Y+j5ZCNXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFJlYWRcbiAgICAgKi9cbiAgICBwdWJsaWMgaW50ZXJmYWNlTmFtZSE6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIOmhueebrlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7UHJvamVjdH1cbiAgICAgKiBAbWVtYmVyb2YgUmVhZFxuICAgICAqL1xuICAgIHB1YmxpYyBwcm9qZWN0ITogUHJvamVjdDtcblxuICAgIC8qKlxuICAgICAqIOexu+Wei+ino+WMheWZqFxuICAgICAqXG4gICAgICogQHR5cGUge1JlYWRFeGNlbFR5cGV9XG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFxuICAgICAqL1xuICAgIHB1YmxpYyB0eXBlcyE6IFJlYWRFeGNlbFR5cGU7XG5cbiAgICAvKipcbiAgICAgKiDmupDmlofku7ZcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTb3VyY2VGaWxlfVxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc2YhOiBTb3VyY2VGaWxlO1xuXG4gICAgLyoqXG4gICAgICog5omT5YyF5ZCO55qE5pWw5o2uKGJvZHkpXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VWludDhBcnJheX1cbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXG4gICAgICovXG4gICAgcHVibGljIGJ1ZmZlciE6IFVpbnQ4QXJyYXk7XG5cbiAgICBwdWJsaWMgZmlsZU5hbWUhOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMga3ZLZXlUeXBlITogc3RyaW5nO1xuICAgIHB1YmxpYyBrdktleSE6IHN0cmluZztcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih1cmw/OiBGaWxlLCBwPzogUHJvamVjdCwgb3V0PzogRmlsZSkge1xuICAgICAgICBpZiAodXJsID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb2plY3QgPSBwITtcbiAgICAgICAgdGhpcy5fb3V0ID0gb3V0ITtcbiAgICAgICAgdGhpcy5fdXJsID0gdXJsO1xuICAgICAgICB0aGlzLnNscyA9IG5ldyBNYXA8c3RyaW5nLCBSZWFkRXhjZWw+KCk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlTmFtZSA9IGZpcnN0VXBwZXJDYXNlKHVybC51bkV4dE5hbWUpO1xuICAgICAgICB0aGlzLmFkZFJlYWRFeGNlbChcIm1haW5cIiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFJlYWRFeGNlbChuYW1lOiBzdHJpbmcsIHJlYWQ6IFJlYWRFeGNlbCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNscy5zZXQobmFtZSwgcmVhZCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlYWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3dzID0geGxzeC5yZWFkRmlsZSh0aGlzLl91cmwubmF0aXZlUGF0aCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnNlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLndicyA9IHN0b3godGhpcy5fd3MsIHRoaXMuX3VybC5uYW1lKSE7XG5cbiAgICAgICAgdGhpcy5maWxlTmFtZSA9IG5hbWVKb2luKHRoaXMuX3VybC51bkV4dE5hbWUpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhgJHt0aGlzLl9vdXQubmF0aXZlUGF0aH0vJHt0aGlzLmZpbGVOYW1lfS50c2ApKSB7XG4gICAgICAgICAgICB1bmxpbmtTeW5jKGAke3RoaXMuX291dC5uYXRpdmVQYXRofS8ke3RoaXMuZmlsZU5hbWV9LnRzYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZiA9IHRoaXMucHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKGAke3RoaXMuX291dC5uYXRpdmVQYXRofS8ke3RoaXMuZmlsZU5hbWV9LnRzYCwgXCJcIik7XG4gICAgICAgIHRoaXMuc2YgPSBzZjtcblxuICAgICAgICB0aGlzLm1haW4gPSB0aGlzLndicy5nZXQoXCJtYWluXCIpITtcbiAgICAgICAgdGhpcy50eXBlcyA9IG5ldyBSZWFkRXhjZWxUeXBlKHRoaXMsIHRoaXMubWFpbik7XG4gICAgICAgIHRoaXMudHlwZXMucGFyc2UoKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZUludGVyZmFjZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnbG9iYWwodzogQ29kZUJsb2NrV3JpdGVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNmID0gdGhpcy5zZjtcbiAgICAgICAgLy8g55u05o6l5om+MSwz5ZKMNFxuICAgICAgICAvLyAx5piv5Y+Y6YeP55+t5rOo6YeKXG4gICAgICAgIC8vIDPmmK/lj5jph4/lkI3np7BcbiAgICAgICAgLy8gNOaYr+WPmOmHj+exu+Wei1xuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcbiAgICAgICAgY29uc3QgcGFja2VyID0gd2Iucm93c1s1XS5jZWxscztcbiAgICAgICAgLy8g55yL55yL57G75Z6LXG4gICAgICAgIHN3aXRjaCAocGFja2VyWzBdLnRleHQpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0xJU1Q6XG4gICAgICAgICAgICAgICAgdy53cml0ZSh0aGlzLmludGVyZmFjZU5hbWUpO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoXCI6XCIpO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoZmlyc3RVcHBlckNhc2UodGhpcy5pbnRlcmZhY2VOYW1lKSk7XG4gICAgICAgICAgICAgICAgdy53cml0ZShcIltdXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTUFQOlxuICAgICAgICAgICAgICAgIHcud3JpdGUodGhpcy5pbnRlcmZhY2VOYW1lKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKFwiOlwiKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKGBSZWNvcmQ8JHt0aGlzLmt2S2V5VHlwZX0sYCk7XG4gICAgICAgICAgICAgICAgdy53cml0ZShmaXJzdFVwcGVyQ2FzZSh0aGlzLmludGVyZmFjZU5hbWUpKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKFwiPlwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0VOVU06XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9LVjpcbiAgICAgICAgICAgICAgICB3LndyaXRlKHRoaXMuaW50ZXJmYWNlTmFtZSk7XG4gICAgICAgICAgICAgICAgdy53cml0ZShcIjpcIik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShmaXJzdFVwcGVyQ2FzZSh0aGlzLmludGVyZmFjZU5hbWUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLpmaTkuIDnu7TmiZPljIXmlrnlvI/lpJYs5pqC5LiN5pSv5oyB5YW25LuW5omT5YyF5pa55byPXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUludGVyZmFjZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2YgPSB0aGlzLnNmO1xuICAgICAgICAvLyDnm7TmjqXmib4xLDPlkow0XG4gICAgICAgIC8vIDHmmK/lj5jph4/nn63ms6jph4pcbiAgICAgICAgLy8gM+aYr+WPmOmHj+WQjeensFxuICAgICAgICAvLyA05piv5Y+Y6YeP57G75Z6LXG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xuICAgICAgICBjb25zdCBwYWNrZXIgPSB3Yi5yb3dzWzVdLmNlbGxzO1xuICAgICAgICAvLyDnnIvnnIvnsbvlnotcbiAgICAgICAgc3dpdGNoIChwYWNrZXJbMF0udGV4dCkge1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTElTVDpcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX01BUDpcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxNKHNmKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0VOVU06XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVFbnVtKHNmKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0tWOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlS1Yoc2YpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2xpZW50S1Yoc2YpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIumZpOS4gOe7tOaJk+WMheaWueW8j+WklizmmoLkuI3mlK/mjIHlhbbku5bmiZPljIXmlrnlvI9cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ2xpZW50S1Yoc2Y6IFNvdXJjZUZpbGUpIHtcbiAgICAgICAgY29uc3QgcGFja3MgPSB0aGlzLnR5cGVzLnBhY2tzO1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMudHlwZXMubmFtZXM7XG5cbiAgICAgICAgY29uc3QgaGFzT2JqID0gcGFja3MuaW5kZXhPZihLZXlXb3Jkcy5JRE9CSik7XG4gICAgICAgIGNvbnN0IGlzS2V5ID0gcGFja3MuaW5kZXhPZihLZXlXb3Jkcy5JREtFWSk7XG4gICAgICAgIGNvbnN0IGlzTmFtZSA9IG5hbWVzLmluZGV4T2YoS2V5V29yZHMuTkFNRSk7XG4gICAgICAgIGNvbnN0IGlzVHlwZSA9IHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURUWVBFKTtcblxuICAgICAgICBpZiAoaGFzT2JqIDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJLVuexu+Wei+W+l+mFjeihqOW/hemhu+aciUlET0JK6aG5XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd2IgPSB0aGlzLm1haW47XG4gICAgICAgIGxldCBjaGlsZF9uYW1lID0gdGhpcy5pbnRlcmZhY2VOYW1lICsgXCJfdmFsdWVcIjtcbiAgICAgICAgdGhpcy5jcmVhdGVMTShzZiwgY2hpbGRfbmFtZSwgdHJ1ZSk7XG5cbiAgICAgICAgbGV0IHBpZDogc3RyaW5nO1xuICAgICAgICBsZXQgbjogc3RyaW5nO1xuICAgICAgICBsZXQgbGFzdDogc3RyaW5nO1xuICAgICAgICBsZXQgaWQ6IEludGVyZmFjZURlY2xhcmF0aW9uO1xuICAgICAgICBsZXQgY3RvcjogQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcbiAgICAgICAgbGV0IHc6IENvZGVCbG9ja1dyaXRlcjtcbiAgICAgICAgbGV0IG5vOiBudW1iZXIgPSAxO1xuXG4gICAgICAgIGxldCB3cml0ZUJvZHkgPSAoYzogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHchICYmIHchLnRvU3RyaW5nKCkgJiYgY3RvciEpIHtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNsb3NlQnJhY2tldFRva2VuKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNsb3NlUGFyZW5Ub2tlbik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5TZW1pY29sb25Ub2tlbik7XG4gICAgICAgICAgICAgICAgY3RvciEuc2V0Qm9keVRleHQodyEudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgICAgICBjKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNyZWF0ZUN0b3IgPSAobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB3ID0gdGhpcy5wcm9qZWN0LmNyZWF0ZVdyaXRlcigpO1xuICAgICAgICAgICAgaWQgPSBzZi5hZGRJbnRlcmZhY2UoeyBuYW1lOiBmaXJzdFVwcGVyQ2FzZShuYW1lKSwgaXNFeHBvcnRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgd3JpdGVTdXBlckNhbGwgPSAobmFtZTogc3RyaW5nLCBwcm90bzogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5TdXBlcik7XG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5PcGVuUGFyZW5Ub2tlbik7XG4gICAgICAgICAgICB3IS53cml0ZShgJHtwcm90b31gKTtcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xuICAgICAgICAgICAgdyEud3JpdGUoYFwiJHtmaXJzdFVwcGVyQ2FzZShuYW1lKX1cImApO1xuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5PcGVuQnJhY2tldFRva2VuKTtcbiAgICAgICAgICAgIHchLm5ld0xpbmUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgd3JpdGVSZWdpc3RlciA9IChuYW1lOiBzdHJpbmcsIHByb3RvOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHNmLmFkZFZhcmlhYmxlU3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBpc0V4cG9ydGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uS2luZDogVmFyaWFibGVEZWNsYXJhdGlvbktpbmQuQ29uc3QsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IGBuZXcgJHtuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZX0kVHlwZSgpYCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSBhcyBWYXJpYWJsZVN0YXRlbWVudFN0cnVjdHVyZSk7XG5cbiAgICAgICAgICAgIHNmLmFkZFN0YXRlbWVudHModyA9PiB7XG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5SZWdpc3Rlcik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5PcGVuUGFyZW5Ub2tlbik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShgJyR7cHJvdG8gfHwgdGhpcy5nZXRQcm90b0lEKCl9J2ApO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShgbmV3ICR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9JFR5cGUoKWApO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VQYXJlblRva2VuKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLlNlbWljb2xvblRva2VuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAobGV0IGkgaW4gd2Iucm93cykge1xuICAgICAgICAgICAgaWYgKCtpIDw9IDUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gd2Iucm93c1tpXS5jZWxscztcbiAgICAgICAgICAgIGxldCBpZmMgPSBjZWxsc1toYXNPYmpdICYmIChjZWxsc1toYXNPYmpdLnRleHQgYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgaWYgKGlmYykge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBuITtcbiAgICAgICAgICAgICAgICBuID0gXCJJXCIgKyBpZmM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpZmMpIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbiE7XG4gICAgICAgICAgICAgICAgbiA9IFwiSVwiICsgdGhpcy5pbnRlcmZhY2VOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgc3RhcnRcbiAgICAgICAgICAgIGlkID0gc2YuZ2V0SW50ZXJmYWNlKGZpcnN0VXBwZXJDYXNlKG4hKSkhO1xuICAgICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgICAgIHBpZCA9IHRoaXMudHlwZXMubW9kLmdldChuISkhO1xuICAgICAgICAgICAgICAgIHdyaXRlQm9keSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlUmVnaXN0ZXIoZmlyc3RVcHBlckNhc2UobGFzdCEpLCB0aGlzLnR5cGVzLm1vZC5nZXQobGFzdCEpISk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY3JlYXRlQ3RvcihmaXJzdFVwcGVyQ2FzZShuISkpO1xuICAgICAgICAgICAgICAgIG5vID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5YWI5Yib5bu65bGe5oCnXG4gICAgICAgICAgICAvLyDlsZ7mgKfpm4blkIhcbiAgICAgICAgICAgIGlkIS5hZGRQcm9wZXJ0eSh7XG4gICAgICAgICAgICAgICAgbmFtZTogY2VsbHNbaXNLZXldLnRleHQgYXMgc3RyaW5nLFxuXG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlKChpc1R5cGUgJiYgKGNlbGxzW2lzVHlwZV0udGV4dCBhcyBzdHJpbmcpKSB8fCBjaGlsZF9uYW1lKSB8fCBjaGlsZF9uYW1lLFxuICAgICAgICAgICAgICAgIGhhc1F1ZXN0aW9uVG9rZW46IHRydWUsXG4gICAgICAgICAgICAgICAgZG9jczogW2NlbGxzW2lzTmFtZV0gJiYgKGNlbGxzW2lzTmFtZV0udGV4dCBhcyBzdHJpbmcpXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBubysrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0LmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChmID0+IGYuZm9ybWF0VGV4dCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7pLVlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBwYXJhbSB7U291cmNlRmlsZX0gc2ZcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUtWKHNmOiBTb3VyY2VGaWxlKSB7XG4gICAgICAgIGNvbnN0IHBhY2tzID0gdGhpcy50eXBlcy5wYWNrcztcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnR5cGVzLm5hbWVzO1xuXG4gICAgICAgIGNvbnN0IGhhc09iaiA9IHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURPQkopO1xuICAgICAgICBjb25zdCBpc0tleSA9IHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpO1xuICAgICAgICBjb25zdCBpc05hbWUgPSBuYW1lcy5pbmRleE9mKEtleVdvcmRzLk5BTUUpO1xuXG4gICAgICAgIGlmIChoYXNPYmogPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIktW57G75Z6L5b6X6YWN6KGo5b+F6aG75pyJSURPQkrpoblcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcbiAgICAgICAgbGV0IGNoaWxkX25hbWUgPSB0aGlzLmludGVyZmFjZU5hbWUgKyBcIl92YWx1ZVwiO1xuICAgICAgICB0aGlzLmNyZWF0ZUxNKHNmLCBjaGlsZF9uYW1lLCB0cnVlKTtcblxuICAgICAgICBsZXQgcGlkOiBzdHJpbmc7XG4gICAgICAgIGxldCBuOiBzdHJpbmc7XG4gICAgICAgIGxldCBsYXN0OiBzdHJpbmc7XG4gICAgICAgIGxldCBpZDogSW50ZXJmYWNlRGVjbGFyYXRpb247XG4gICAgICAgIGxldCBjdG9yOiBDb25zdHJ1Y3RvckRlY2xhcmF0aW9uO1xuICAgICAgICBsZXQgdzogQ29kZUJsb2NrV3JpdGVyO1xuICAgICAgICBsZXQgbm86IG51bWJlciA9IDE7XG5cbiAgICAgICAgbGV0IHdyaXRlQm9keSA9IChjOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBpZiAodyEgJiYgdyEudG9TdHJpbmcoKSAmJiBjdG9yISkge1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VCcmFja2V0VG9rZW4pO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VQYXJlblRva2VuKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLlNlbWljb2xvblRva2VuKTtcbiAgICAgICAgICAgICAgICBjdG9yIS5zZXRCb2R5VGV4dCh3IS50b1N0cmluZygpKTtcblxuICAgICAgICAgICAgICAgIGMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgY3JlYXRlQ3RvciA9IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIOWIm+W7uuaehOmAoOWHveaVsFxuICAgICAgICAgICAgY29uc3QgY3QgPSBzZi5hZGRDbGFzcyh7XG4gICAgICAgICAgICAgICAgbmFtZTogYCR7Zmlyc3RVcHBlckNhc2UobmFtZSl9JFR5cGVgLFxuICAgICAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgZXh0ZW5kczogYE1lc3NhZ2VUeXBlPCR7Zmlyc3RVcHBlckNhc2UobmFtZSl9PmAsXG4gICAgICAgICAgICB9IGFzIENsYXNzRGVjbGFyYXRpb25TdHJ1Y3R1cmUpO1xuICAgICAgICAgICAgY3RvciA9IGN0LmFkZENvbnN0cnVjdG9yKHt9KTtcbiAgICAgICAgICAgIHcgPSB0aGlzLnByb2plY3QuY3JlYXRlV3JpdGVyKCk7XG4gICAgICAgICAgICBpZCA9IHNmLmFkZEludGVyZmFjZSh7IG5hbWU6IGZpcnN0VXBwZXJDYXNlKG5hbWUpLCBpc0V4cG9ydGVkOiB0cnVlIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB3cml0ZVN1cGVyQ2FsbCA9IChuYW1lOiBzdHJpbmcsIHByb3RvOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLlN1cGVyKTtcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLk9wZW5QYXJlblRva2VuKTtcbiAgICAgICAgICAgIHchLndyaXRlKGAnJHtwcm90b30nYCk7XG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcbiAgICAgICAgICAgIHchLndyaXRlKGBcIiR7Zmlyc3RVcHBlckNhc2UobmFtZSl9XCJgKTtcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuT3BlbkJyYWNrZXRUb2tlbik7XG4gICAgICAgICAgICB3IS5uZXdMaW5lKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHdyaXRlUmVnaXN0ZXIgPSAobmFtZTogc3RyaW5nLCBwcm90bzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBzZi5hZGRWYXJpYWJsZVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgaXNFeHBvcnRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbktpbmQ6IFZhcmlhYmxlRGVjbGFyYXRpb25LaW5kLkNvbnN0LFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVyOiBgbmV3ICR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9JFR5cGUoKWAsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0gYXMgVmFyaWFibGVTdGF0ZW1lbnRTdHJ1Y3R1cmUpO1xuXG4gICAgICAgICAgICBzZi5hZGRTdGF0ZW1lbnRzKHcgPT4ge1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuUmVnaXN0ZXIpO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuT3BlblBhcmVuVG9rZW4pO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoYCcke3Byb3RvIHx8IHRoaXMuZ2V0UHJvdG9JRCgpfSdgKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xuICAgICAgICAgICAgICAgIHcud3JpdGUoYG5ldyAke25hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lfSRUeXBlKClgKTtcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNsb3NlUGFyZW5Ub2tlbik7XG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5TZW1pY29sb25Ub2tlbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGxldCBpIGluIHdiLnJvd3MpIHtcbiAgICAgICAgICAgIGlmICgraSA8PSA1KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjZWxscyA9IHdiLnJvd3NbaV0uY2VsbHM7XG4gICAgICAgICAgICBsZXQgaWZjID0gY2VsbHNbaGFzT2JqXSAmJiAoY2VsbHNbaGFzT2JqXS50ZXh0IGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGlmIChpZmMpIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbiE7XG4gICAgICAgICAgICAgICAgbiA9IGlmYztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlmYykge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBuITtcbiAgICAgICAgICAgICAgICBuID0gdGhpcy5pbnRlcmZhY2VOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgc3RhcnRcbiAgICAgICAgICAgIGlkID0gc2YuZ2V0SW50ZXJmYWNlKGZpcnN0VXBwZXJDYXNlKG4hKSkhO1xuICAgICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgICAgIHBpZCA9IHRoaXMudHlwZXMubW9kLmdldChuISkhO1xuICAgICAgICAgICAgICAgIHdyaXRlQm9keSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlUmVnaXN0ZXIoZmlyc3RVcHBlckNhc2UobGFzdCEpLCB0aGlzLnR5cGVzLm1vZC5nZXQobGFzdCEpISk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY3JlYXRlQ3RvcihmaXJzdFVwcGVyQ2FzZShuISkpO1xuICAgICAgICAgICAgICAgIHdyaXRlU3VwZXJDYWxsKGZpcnN0VXBwZXJDYXNlKG4hKSwgcGlkKTtcbiAgICAgICAgICAgICAgICBubyA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWFiOWIm+W7uuWxnuaAp1xuICAgICAgICAgICAgLy8g5bGe5oCn6ZuG5ZCIXG4gICAgICAgICAgICBpZCEuYWRkUHJvcGVydHkoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGNlbGxzW2lzS2V5XS50ZXh0IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZF9uYW1lLFxuICAgICAgICAgICAgICAgIGhhc1F1ZXN0aW9uVG9rZW46IHRydWUsXG4gICAgICAgICAgICAgICAgZG9jczogW2NlbGxzW2lzTmFtZV0gJiYgKGNlbGxzW2lzTmFtZV0udGV4dCBhcyBzdHJpbmcpXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgZW5kXG5cbiAgICAgICAgICAgIC8vIOWIm+W7uuWuouaIt+err+S8oOi+k+WNj+iuruWvueixoSBlbmRcblxuICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICB3IS53cml0ZShzY2FsYXIobm8sIGNlbGxzW2lzS2V5XS50ZXh0IGFzIHN0cmluZywgXCJtZXNzYWdlXCIsIGZhbHNlLCBgb2JqZWN0KCR7Y2hpbGRfbmFtZX0pYCkpO1xuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XG4gICAgICAgICAgICB3IS5uZXdMaW5lKCk7XG5cbiAgICAgICAgICAgIG5vKys7XG4gICAgICAgIH1cblxuICAgICAgICB3cml0ZUJvZHkoKCkgPT4ge1xuICAgICAgICAgICAgd3JpdGVSZWdpc3RlcihmaXJzdFVwcGVyQ2FzZShuISksIHBpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOWIm+W7uuihqFxuICAgICAgICBubyA9IDE7XG4gICAgICAgIGNyZWF0ZUN0b3IodGhpcy5pbnRlcmZhY2VOYW1lKTtcbiAgICAgICAgd3JpdGVTdXBlckNhbGwoZmlyc3RVcHBlckNhc2UodGhpcy5pbnRlcmZhY2VOYW1lISksIHRoaXMuZ2V0UHJvdG9JRCgpKTtcbiAgICAgICAgdGhpcy50eXBlcy5tb2QuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICAgICAgaWQuYWRkUHJvcGVydHkoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGshLFxuICAgICAgICAgICAgICAgIHR5cGU6IGZpcnN0VXBwZXJDYXNlKGshKSxcbiAgICAgICAgICAgICAgICBoYXNRdWVzdGlvblRva2VuOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudHlwZXMubW9kLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgdyEud3JpdGUoc2NhbGFyKG5vLCBrIGFzIHN0cmluZywgXCJtZXNzYWdlXCIsIGZhbHNlLCBgb2JqZWN0KCR7ayF9KWApKTtcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xuICAgICAgICAgICAgdyEubmV3TGluZSgpO1xuICAgICAgICAgICAgbm8rKztcbiAgICAgICAgfSk7XG4gICAgICAgIHdyaXRlQm9keSgoKSA9PiB7XG4gICAgICAgICAgICB3cml0ZVJlZ2lzdGVyKGZpcnN0VXBwZXJDYXNlKHRoaXMuaW50ZXJmYWNlTmFtZSEpLCB0aGlzLmdldFByb3RvSUQoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucHJvamVjdC5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goZiA9PiBmLmZvcm1hdFRleHQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65p6a5Li+XG4gICAgICpcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHBhcmFtIHtTb3VyY2VGaWxlfSBzZlxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlRW51bShzZjogU291cmNlRmlsZSkge1xuICAgICAgICBjb25zdCBkb2NzX3RleHRzID0gdGhpcy50eXBlcy5kb2NzO1xuICAgICAgICBjb25zdCBuYW1lX3RleHRzID0gdGhpcy50eXBlcy5uYW1lcztcbiAgICAgICAgY29uc3QgdHlwZV90ZXh0cyA9IHRoaXMudHlwZXMudHlwZXM7XG4gICAgICAgIGNvbnN0IHBhY2tfdGV4dHMgPSB0aGlzLnR5cGVzLnBhY2tzO1xuXG4gICAgICAgIGNvbnN0IGhhcyA9IHNmLmdldEVudW0odGhpcy5pbnRlcmZhY2VOYW1lKTtcbiAgICAgICAgaWYgKGhhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW51ID0gc2YuYWRkRW51bSh7XG4gICAgICAgICAgICBpc0V4cG9ydGVkOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogdGhpcy5pbnRlcmZhY2VOYW1lLFxuICAgICAgICB9IGFzIEVudW1EZWNsYXJhdGlvblN0cnVjdHVyZSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDEsIGwgPSBuYW1lX3RleHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbiA9IG5hbWVfdGV4dHNbaV0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgY29uc3QgdCA9IHR5cGVfdGV4dHNbaV0gYXMgc3RyaW5nO1xuXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHQgPT0gXCJzdHJpbmdcIiA/IGBcIiR7cGFja190ZXh0c1tpXX1cImAgOiBwYWNrX3RleHRzW2ldO1xuICAgICAgICAgICAgZW51LmFkZE1lbWJlcih7XG4gICAgICAgICAgICAgICAgbmFtZTogbixcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgZG9jczogW3sgZGVzY3JpcHRpb246IGAke2RvY3NfdGV4dHNbaV19YCB9XSxcbiAgICAgICAgICAgIH0gYXMgRW51bU1lbWJlclN0cnVjdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7ppbnRlcmZhY2VcbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge1NvdXJjZUZpbGV9IHNmXG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMTShzZjogU291cmNlRmlsZSwgbmFtZT86IHN0cmluZywgZmlsdGVyOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgLy8g55u05o6l5om+MSwz5ZKMNFxuICAgICAgICAvLyAx5piv5Y+Y6YeP55+t5rOo6YeKXG4gICAgICAgIC8vIDPmmK/lj5jph4/lkI3np7BcbiAgICAgICAgLy8gNOaYr+WPmOmHj+exu+Wei1xuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcblxuICAgICAgICBjb25zdCBkb2NzID0gdGhpcy50eXBlcy5kb2NzO1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMudHlwZXMubmFtZXM7XG4gICAgICAgIGNvbnN0IHR5cGVzID0gdGhpcy50eXBlcy50eXBlcztcbiAgICAgICAgY29uc3QgcGFja3MgPSB0aGlzLnR5cGVzLnBhY2tzO1xuXG4gICAgICAgIC8vIOWFiOWIm+W7uuWxnuaAp1xuICAgICAgICAvLyDlsZ7mgKfpm4blkIhcbiAgICAgICAgY29uc3QgbWVtYmVyczogUHJvcGVydHlTaWduYXR1cmVTdHJ1Y3R1cmVbXSA9IHRoaXMuY3JlYXRlUHJvcGVydHkoZG9jcywgbmFtZXMsIHR5cGVzLCBwYWNrcywgZmlsdGVyKTtcblxuICAgICAgICBpZiAocGFja3MuaW5kZXhPZihLZXlXb3Jkcy5JREtFWSkgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5rdktleSA9IG5hbWVzW3BhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLmt2S2V5VHlwZSA9IHRoaXMuZ2V0VHlwZSh0eXBlc1twYWNrcy5pbmRleE9mKEtleVdvcmRzLklES0VZKV0gYXMgUHJvdG9CdWZTY2FsYXJUeXBlKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOW9k+WJjU1BUOexu+Wei+eahOmFjeihqEtWS2V55Li6OiR7dGhpcy5rdktleX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhcyA9IHNmLmdldEludGVyZmFjZShuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZSk7XG4gICAgICAgIGlmIChoYXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvSUQgPSBnZW5lcmF0b3JQcm90b0lEKG5hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lKTtcblxuICAgICAgICAvLyDmt7vliqDmjqXlj6NcbiAgICAgICAgc2YuYWRkSW50ZXJmYWNlKHtcbiAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiBuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZSxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMsXG4gICAgICAgICAgICBkb2NzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYCcke3Byb3RvSUR9J2AsXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGFnTmFtZTogXCJhdXRob3JcIiwgdGV4dDogXCJrc2dhbWVzMjZcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0YWdOYW1lOiBcInByb3RvYnVmXCIsIHRleHQ6IGAnJHtwcm90b0lEfSdgIH0sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0gYXMgSW50ZXJmYWNlRGVjbGFyYXRpb25TdHJ1Y3R1cmUpO1xuXG4gICAgICAgIC8vIOWIm+W7uuexu1xuICAgICAgICBjb25zdCBjdCA9IHNmLmFkZENsYXNzKHtcbiAgICAgICAgICAgIG5hbWU6IGAke25hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lfSRUeXBlYCxcbiAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZXh0ZW5kczogYE1lc3NhZ2VUeXBlPCR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9PmAsXG4gICAgICAgICAgICBpbXBsZW1lbnRzOiBbYElHYW1lRnJhbWV3b3JrLklTZXJpYWxpemVyYF0sXG4gICAgICAgIH0gYXMgQ2xhc3NEZWNsYXJhdGlvblN0cnVjdHVyZSk7XG5cbiAgICAgICAgLy8g5Yib5bu65p6E6YCg5Ye95pWwXG4gICAgICAgIGxldCBjdG9yID0gY3QuYWRkQ29uc3RydWN0b3Ioe30pO1xuXG5cbiAgICAgICAge1xuICAgICAgICAgICAgY3QuYWRkR2V0QWNjZXNzb3Ioe1xuICAgICAgICAgICAgICAgIG5hbWU6IFwicHJvdG9JZFwiLFxuICAgICAgICAgICAgICAgIHJldHVyblR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgc3RhdGVtZW50czogKHdyaXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlLndyaXRlKGByZXR1cm4gJHtwYXJzZUludChwcm90b0lEKX07YClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWhq+WFheaWueazleS9k1xuICAgICAgICBjb25zdCB3cml0ZSA9IHRoaXMucHJvamVjdC5jcmVhdGVXcml0ZXIoKTtcbiAgICAgICAgd3JpdGUud3JpdGUoS2V5V29yZHMuU3VwZXIpO1xuICAgICAgICB3cml0ZS53cml0ZShLZXlXb3Jkcy5PcGVuUGFyZW5Ub2tlbik7XG4gICAgICAgIHdyaXRlLndyaXRlKGBcIiR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9XCJgKTtcbiAgICAgICAgd3JpdGUud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLk9wZW5CcmFja2V0VG9rZW4pO1xuICAgICAgICB3cml0ZS5uZXdMaW5lKCk7XG5cbiAgICAgICAgLy8g5a6e546w5p6E6YCg5Ye95pWwYm9keVxuICAgICAgICBsZXQgbm8gPSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMSwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbiA9IG5hbWVzW2ldIGFzIHN0cmluZztcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0eXBlc1tpXSBhcyBQcm90b0J1ZlNjYWxhclR5cGU7XG5cbiAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgcGFja3NbaV0gIT0gS2V5V29yZHMuSURWQUxVRSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlrp7njrDmr4/kuKrlrZfmrrXnmoRydHRp5L+h5oGvXG4gICAgICAgICAgICB3cml0ZS53cml0ZShzY2FsYXIobm8sIG4sIGdldFByb3RvQnVmU2NhbGFyVHlwZSh0KSwgdC5lbmRzV2l0aChcIltdXCIpID8gdHJ1ZSA6IGZhbHNlLCB0KSk7XG4gICAgICAgICAgICB3cml0ZS53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcbiAgICAgICAgICAgIHdyaXRlLm5ld0xpbmUoKTtcblxuICAgICAgICAgICAgbm8rKztcbiAgICAgICAgfVxuICAgICAgICB3cml0ZS53cml0ZShLZXlXb3Jkcy5DbG9zZUJyYWNrZXRUb2tlbik7XG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLkNsb3NlUGFyZW5Ub2tlbik7XG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLlNlbWljb2xvblRva2VuKTtcbiAgICAgICAgY3Rvci5zZXRCb2R5VGV4dCh3cml0ZS50b1N0cmluZygpKTtcblxuICAgICAgICAvLyDmt7vliqDlr7zlh7pcbiAgICAgICAgc2YuYWRkVmFyaWFibGVTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgaXNFeHBvcnRlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRlY2xhcmF0aW9uS2luZDogVmFyaWFibGVEZWNsYXJhdGlvbktpbmQuQ29uc3QsXG4gICAgICAgICAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplcjogYG5ldyAke25hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lfSRUeXBlKClgLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9IGFzIFZhcmlhYmxlU3RhdGVtZW50U3RydWN0dXJlKTtcblxuICAgICAgICAvLyDmt7vliqDms6jlhoxcbiAgICAgICAgc2YuYWRkU3RhdGVtZW50cyh3ID0+IHtcbiAgICAgICAgICAgIHcud3JpdGUoYFxuICAgICAgICAgICAgICAgIGRpcmVjdG9yLm9uKFwiZ2FtZS1mcmFtZXdvcmstaW5pdGlhbGl6ZVwiLCgpPT57XG4gICAgICAgICAgICAgICAgICAgIENvbnRhaW5lci5nZXRJbnRlcmZhY2UoXCJJR2FtZUZyYW1ld29yay5JU2VyaWFsaXphYmxlXCIpPy5yZWdpc3Rlckluc3QoJHtuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZX0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5qC85byP5YyW5omA5pyJ5paH5Lu2XG4gICAgICAgIHRoaXMucHJvamVjdC5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goZmlsZSA9PiBmaWxlLmZvcm1hdFRleHQoKSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNhdmUoY2xpZW50OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmIChjbGllbnQpIHtcbiAgICAgICAgICAgIC8vIOWFiOa3u+WKoHByb3RvYnVm55u45YWzXG4gICAgICAgICAgICB0aGlzLnNmLmFkZEltcG9ydERlY2xhcmF0aW9ucyhbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpc1R5cGVPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRJbXBvcnRzOiBbXCJNZXNzYWdlVHlwZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlU3BlY2lmaWVyOiBcImRiOi8vZ2FtZS1wcm90b2J1Zi9nYW1lLWZyYW1ld29ya1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgLy8g5Zyo5re75YqgLOWGjea3u+WKoOihqOi+vuW8j1xuICAgICAgICAgICAgdGhpcy5zZi5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXNUeXBlT25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiRXhwcmVzc2lvbnNcIiwgXCJFeHByZXNzaW9uc0hhbmRsZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29uZmlndXJlL2dhbWUtZnJhbWV3b3JrXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICAvLyDlnKjmt7vliqAs5YaN5re75Yqg5a655ZmoXG4gICAgICAgICAgICB0aGlzLnNmLmFkZEltcG9ydERlY2xhcmF0aW9ucyhbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpc1R5cGVPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRJbXBvcnRzOiBbXCJDb250YWluZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29yZS9nYW1lLWZyYW1ld29ya1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgLy8g5re75YqgY2Plr7zlhaVcbiAgICAgICAgICAgIHRoaXMuc2YuYWRkSW1wb3J0RGVjbGFyYXRpb25zKFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lZEltcG9ydHM6IFtcImRpcmVjdG9yXCJdLFxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVTcGVjaWZpZXI6IFwiY2NcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXcgRXJyb3IoXCJub3Qgc3VwcG9ydCBzZXJ2ZXJcIilcbiAgICAgICAgfVxuICAgICAgICAvLyDkv53lrZjmlofku7ZcbiAgICAgICAgdGhpcy5wcm9qZWN0LnNhdmVTeW5jKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omT5YyF5pWw5o2uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXG4gICAgICovXG4gICAgcHVibGljIHBhY2soZmlsZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsZXQgc291cmNlID0gdGhpcy5wcm9qZWN0XG4gICAgICAgICAgICAuZ2V0U291cmNlRmlsZXMoKVxuICAgICAgICAgICAgLm1hcChmaWxlID0+IChmaWxlLmdldEZpbGVQYXRoKCkuaW5jbHVkZXMoZmlsZU5hbWUpID8gXCJcIiA6IGZpbGUuZ2V0VGV4dCgpKSlcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xuICAgICAgICBjb25zdCBwYWNrVHlwZSA9IHRoaXMuZ2V0UGFja2VyVHlwZSgpO1xuXG4gICAgICAgIC8vIOebtOaOpeaJvjEsM+WSjDRcbiAgICAgICAgLy8gMeaYr+WPmOmHj+efreazqOmHilxuICAgICAgICAvLyAz5piv5Y+Y6YeP5ZCN56ewXG4gICAgICAgIC8vIDTmmK/lj5jph4/nsbvlnotcbiAgICAgICAgY29uc3Qgd2IgPSB0aGlzLm1haW47XG4gICAgICAgIGNvbnN0IHBhY2tlciA9IHdiLnJvd3NbNV0uY2VsbHM7XG4gICAgICAgIGNvbnN0IGhlYWQgPSBgXG4gICAgICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBCeXRlKCk7XG5cbiAgICAgICAgICAgIC8vIOWGmeWGheWuueaVsOmHj1xuICAgICAgICAgICAgYnl0ZXMud3JpdGVJbnQxNihjb3VudCk7XG4gICAgICAgICAgICAvLyDlhpnmiZPljIXop6PljIXooajlkI1cbiAgICAgICAgICAgIGJ5dGVzLndyaXRlVVRGOFN0cmluZyhwcm90b05BKTtcbiAgICAgICAgICAgIC8vIOWGmeaJk+WMheino+WMhUlEXG4gICAgICAgICAgICBieXRlcy53cml0ZUludDMyKHByb3RvSUQpO1xuICAgICAgICAgICAgLy8g5YaZ5YWl5omT5YyF57G75Z6LXG4gICAgICAgICAgICBieXRlcy53cml0ZVVpbnQ4KHBhY2tUeXBlKTtcbiAgICAgICAgYDtcbiAgICAgICAgc291cmNlICs9IGhlYWQ7XG4gICAgICAgIGxldCBkYXRhOiB1bmtub3duO1xuXG4gICAgICAgIGxldCBmdW5jID0gXCJcIjtcblxuICAgICAgICAvLyDnnIvnnIvnsbvlnotcbiAgICAgICAgc3dpdGNoIChwYWNrZXJbMF0udGV4dCkge1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTUFQOlxuICAgICAgICAgICAgICAgIGZ1bmMgKz0gYFxuICAgICAgICAgICAgICAgICAgICAvLyDlhpnlhaVrZXlcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVVVEY4U3RyaW5nKGlka2V5KTtcbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTElTVDoge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB0aGlzLnBhY2tMTURhdGEoKTtcbiAgICAgICAgICAgICAgICAvLyDmnoTlu7rkuIDmrrXku6PnoIHnlKjmnaXmiZPljIVcbiAgICAgICAgICAgICAgICAvLyBpbnQxNijmlbDmja7mlbDph48pICsgaW50MTYo5omT5YyF6Kej5YyFSUQpICsgaW50MzIo5Y2V5p2h5pWw5o2u6ZW/5bqmKSArIGJvZHko5Y2V5p2h5pWw5o2u5YaF5a65KVxuICAgICAgICAgICAgICAgIGZ1bmMgKz0gYFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpbiA9ICgke3RoaXMuaW50ZXJmYWNlTmFtZX0gYXMgTWVzc2FnZVR5cGU8b2JqZWN0PikudG9CaW5hcnkoZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YaZ5Y2P6K6u6ZW/5bqmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVJbnQzMihiaW4ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlhpnlhaXmiZPljIXlkI7nmoTlhoXlrrlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlcy53cml0ZUFycmF5QnVmZmVyKGJpbi5idWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5oiq5pat6aKd5aSWMOWAvOWGheWuuVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+q5L+d55WZ5pyJ5pWI5YC8XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBieXRlcy5idWZmZXIuc2xpY2UoMCwgYnl0ZXMucG9zKVxuICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfRU5VTTpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0tWOiB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMucGFja0tWRGF0YSgpO1xuICAgICAgICAgICAgICAgIC8vIOaehOW7uuS4gOauteS7o+eggeeUqOadpeaJk+WMhVxuICAgICAgICAgICAgICAgIC8vIGludDE2KOaVsOaNruaVsOmHjykgKyBpbnQxNijmiZPljIXop6PljIVJRCkgKyBpbnQzMijljZXmnaHmlbDmja7plb/luqYpICsgYm9keSjljZXmnaHmlbDmja7lhoXlrrkpXG5cbiAgICAgICAgICAgICAgICBmdW5jID0gYFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmluID0gKCR7dGhpcy5pbnRlcmZhY2VOYW1lfSBhcyBNZXNzYWdlVHlwZTxvYmplY3Q+KS50b0JpbmFyeShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWGmeWNj+iurumVv+W6plxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVJbnQzMihiaW4ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWGmeWFpeaJk+WMheWQjueahOWGheWuuVxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVBcnJheUJ1ZmZlcihiaW4uYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaIquaWremineWkljDlgLzlhoXlrrlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWPquS/neeVmeacieaViOWAvFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gYnl0ZXMuYnVmZmVyLnNsaWNlKDAsIGJ5dGVzLnBvcylcbiAgICAgICAgICAgICAgICAgICAgYDtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIumZpOS4gOe7tOaJk+WMheaWueW8j+WklizmmoLkuI3mlK/mjIHlhbbku5bmiZPljIXmlrnlvI9cIik7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlICs9IGZ1bmM7XG5cbiAgICAgICAgLy8g57yW6K+R5Luj56CB5bm25Yib5bu66L+Q6KGM5pe25LiK5LiL5paHXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRzLnRyYW5zcGlsZShzb3VyY2UsIHtcbiAgICAgICAgICAgIG1vZHVsZTogdHMuTW9kdWxlS2luZC5Db21tb25KUyxcbiAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGNyZWF0ZUNvbnRleHQoe1xuICAgICAgICAgICAgYnVmZmVyOiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhY2tUeXBlOiBwYWNrVHlwZSxcbiAgICAgICAgICAgIHByb3RvSUQ6IFwiXCIgKyB0aGlzLmdldFByb3RvSUQoKSxcbiAgICAgICAgICAgIHByb3RvTkE6IHRoaXMuaW50ZXJmYWNlTmFtZSxcbiAgICAgICAgICAgIGV4cG9ydHM6IHt9LFxuICAgICAgICAgICAgaWRrZXk6IHRoaXMua3ZLZXkgfHwgXCJcIixcbiAgICAgICAgICAgIGNvdW50OiBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5sZW5ndGggOiAxLFxuICAgICAgICAgICAgTWVzc2FnZVR5cGUsXG4gICAgICAgICAgICBDb250YWluZXIsXG4gICAgICAgICAgICBFeHByZXNzaW9uc0hhbmRsZXIsXG4gICAgICAgICAgICBFeHByZXNzaW9ucyxcbiAgICAgICAgICAgIEJ5dGUsXG4gICAgICAgICAgICBkaXJlY3RvclxuICAgICAgICB9IGFzIHsgYnVmZmVyOiBVaW50OEFycmF5IHwgbnVsbCB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQocmVzdWx0KTtcbiAgICAgICAgICAgIHNjcmlwdC5ydW5JbkNvbnRleHQoY29udGV4dCk7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IGNvbnRleHQuYnVmZmVyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UHJvdG9JRCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdG9yUHJvdG9JRCh0aGlzLmludGVyZmFjZU5hbWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQYWNrZXJUeXBlKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xuICAgICAgICBzd2l0Y2ggKHdiLnJvd3NbNV0uY2VsbHNbMF0udGV4dCkge1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTElTVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gUEFDS0VSLkxJU1Q7XG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9LVjpcbiAgICAgICAgICAgICAgICByZXR1cm4gUEFDS0VSLktWO1xuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTUFQOlxuICAgICAgICAgICAgICAgIHJldHVybiBQQUNLRVIuTUFQO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCLlhbbku5bnsbvlnovkuI3mlK/mjIHlrZjlnKjkuI5NQUlOIFNIRUVU5LitXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBhY2tLVkRhdGEoKSB7XG4gICAgICAgIGNvbnN0IG1haW4gPSB0aGlzLndicy5nZXQoXCJtYWluXCIpO1xuICAgICAgICBjb25zdCB0eXBlcyA9IG1haW4/LnR5cGVzITtcbiAgICAgICAgY29uc3QgZGF0YTogRGljdCA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGlzT2JqID0gdGhpcy50eXBlcy5wYWNrcy5pbmRleE9mKEtleVdvcmRzLklET0JKKTtcbiAgICAgICAgY29uc3QgaXNLZXkgPSB0aGlzLnR5cGVzLnBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpO1xuXG4gICAgICAgIHRoaXMudHlwZXMubW9kLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgICAgIGRhdGFba10gPSB7fTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5oyJ54WnaW50ZXJmYWNl5omT5YyFXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBtYWluPy5yb3dzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCtrZXkgPD0gNSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1haW4/LnJvd3NbK2tleV0uY2VsbHMhO1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgayA9IHZhbHVlW2lzT2JqXS50ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IGRhdGFba107XG5cbiAgICAgICAgICAgICAgICAvLyDov4fmu6RPQkrlkoxLRVnmiYDlnKjlvpfliJfmlbDmja5cbiAgICAgICAgICAgICAgICAvLyDkuI3pnIDopoHmiZPljIVcbiAgICAgICAgICAgICAgICAvLyDmmK/kvZzkuLrplK7lrZjlnKjnmoRcbiAgICAgICAgICAgICAgICBpZiAoK3R5cGVzW2ldLmluZHggPT0gaXNPYmogfHwgK3R5cGVzW2ldLmluZHggPT0gaXNLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViID0gdmFsdWVbaXNLZXldLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmpbc3ViXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpbc3ViXSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG91dCA9IG9ialtzdWJdO1xuXG4gICAgICAgICAgICAgICAgLy8g5LuO5ZywNuihjOW8gOWni+aJjeaYr+aVsOaNrmJvZHnpg6jliIZcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAra2V5IC0gNjtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0eXBlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgLy8g6L+Z6YeM6ZyA6KaB5Yqg5Zue5p2lXG4gICAgICAgICAgICAgICAgICAgIC8vIOWboOS4uuWQjumdoumcgOimgemdoOi/meS4que0ouW8leWOu+aLv+i/meS4gOihjOeahOWAvFxuICAgICAgICAgICAgICAgICAgICBpZHg6IGlkeCArIDYsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG91dCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0VHlwZVZhbHVlKGlucHV0IGFzIFBRSW5wdXQsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYWNrTE1EYXRhKCk6IERpY3RbXSB7XG4gICAgICAgIC8vIOaYr+S4gOS4qmludGVyZmFjZeaVsOe7hFxuICAgICAgICBjb25zdCBkYXRhOiBEaWN0W10gPSBbXTtcbiAgICAgICAgLy8g5LuObWFpbiBzaGVldCDlvIDlp4vmiZPljIVcbiAgICAgICAgY29uc3QgbWFpbiA9IHRoaXMud2JzLmdldChcIm1haW5cIik7XG4gICAgICAgIGNvbnN0IHR5cGVzID0gbWFpbj8udHlwZXMhO1xuXG4gICAgICAgIC8vIOaMieeFp2ludGVyZmFjZeaJk+WMhVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gbWFpbj8ucm93cykge1xuICAgICAgICAgICAgICAgIGlmICgra2V5IDw9IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtYWluPy5yb3dzWytrZXldLmNlbGxzITtcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOS7juWcsDbooYzlvIDlp4vmiY3mmK/mlbDmja5ib2R56YOo5YiGXG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gK2tleSAtIDY7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhW2lkeF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpZHhdID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGlmYWNlID0gZGF0YVtpZHhdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0ge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHR5cGVzW2ldLFxuICAgICAgICAgICAgICAgICAgICAvLyDov5nph4zpnIDopoHliqDlm57mnaVcbiAgICAgICAgICAgICAgICAgICAgLy8g5Zug5Li65ZCO6Z2i6ZyA6KaB6Z2g6L+Z5Liq57Si5byV5Y675ou/6L+Z5LiA6KGM55qE5YC8XG4gICAgICAgICAgICAgICAgICAgIGlkeDogaWR4ICsgNixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogaWZhY2UsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFR5cGVWYWx1ZShpbnB1dCBhcyBQUUlucHV0LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VHlwZVZhbHVlKHQ6IFBRSW5wdXQsIHJlOiBSZWFkRXhjZWwpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBg6YWN572u6KGoJHtyZS5pbnRlcmZhY2VOYW1lfeino+aekOWksei0pWAgKyB0LnNvdXJjZS5pbmR4ICsgXCJfXCIgKyB0LnNvdXJjZS5uYW1lICsgXCJfXCIgKyB0LnNvdXJjZS5pbmR4O1xuXG4gICAgICAgIGNvbnN0IGlzQXJyYXkgPSB0LnNvdXJjZS50eXBlLmVuZHNXaXRoKFwiW11cIik7XG4gICAgICAgIGxldCB0eSA9IHQuc291cmNlLnR5cGUgYXMgUHJvdG9CdWZTY2FsYXJUeXBlO1xuICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgdHkgPSB0LnNvdXJjZS50eXBlLnJlcGxhY2UoXCJbXVwiLCBcIlwiKSBhcyBQcm90b0J1ZlNjYWxhclR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHR5KSB7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJpbnQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcImludDY0XCI6XG4gICAgICAgICAgICBjYXNlIFwidWludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwidWludDY0XCI6XG4gICAgICAgICAgICBjYXNlIFwic2ludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic2ludDY0XCI6XG4gICAgICAgICAgICBjYXNlIFwiZml4ZWQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcImZpeGVkNjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzZml4ZWQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcInNmaXhlZDY0XCI6IHtcbiAgICAgICAgICAgICAgICBpZiAodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHQudmFsdWVzW3Quc291cmNlLmluZHhdID0geyB0ZXh0OiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g56m65pWw57uEXG4gICAgICAgICAgICAgICAgICAgICAgICB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g56m65YC86buY6K6k5Li6MFxuICAgICAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQgKyBcIlwiO1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IChsaXN0IGFzIHN0cmluZykuc3BsaXQoXCI7XCIpLm1hcCh2ID0+ICt2KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSArbGlzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9PSB2b2lkIDAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJib29sXCI6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGlzQXJyYXksIFwi5pqC5LiN5pSv5oyB5pWw57uE57G75Z6LXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHQudmFsdWVzW3Quc291cmNlLmluZHhdID09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgICAgICB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XSA9IHsgdGV4dDogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHYgIT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoK3YgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2ID09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSB2O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9PSB2b2lkIDApIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyDnqbrlgLzpu5jorqTkuLpmYWxzZVxuICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhc3NlcnQodC5kYXRhW3Quc291cmNlLm5hbWVdID09IHZvaWQgMCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XSA9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPSB7IHRleHQ6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgICAgICB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQgKyBcIlwiO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gKGxpc3QgYXMgc3RyaW5nKS5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gbGlzdCArIFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzc2VydCh0LmRhdGFbdC5zb3VyY2UubmFtZV0gPT0gdm9pZCAwLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYnl0ZXNcIjpcbiAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLkuI3mlK/mjIFcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibGltaXRcIjpcbiAgICAgICAgICAgIC8vIOWHveaVsOexu+Wei1xuICAgICAgICAgICAgY2FzZSBcImZuXCI6XG4gICAgICAgICAgICAvLyDmnaHku7bnsbvlnotcbiAgICAgICAgICAgIGNhc2UgXCJjb25kaXRpb25cIjpcbiAgICAgICAgICAgIC8vIOWFrOW8j+exu+Wei1xuICAgICAgICAgICAgY2FzZSBcImZvcm11bGFcIjpcbiAgICAgICAgICAgICAgICBhc3NlcnQoaXNBcnJheSwgXCLmmoLkuI3mlK/mjIHmlbDnu4TnsbvlnotcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCF0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XSwgXCLor7fmo4Dmn6XmlbDmja7mupBcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCF0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ICYmIHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQgIT0gXCIwXCIsIFwi6K+35qOA5p+l5pWw5o2u5rqQXCIpO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IGNvbXBpbGUodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCBhcyBzdHJpbmcsIHR5KTtcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gcDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIChg6Kej5p6Q5aSN5p2C57G75Z6L5aSx6LSlOuexu+Weizoke3R5fWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzb3VyY2U6XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQpIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhc3NlcnQodC5kYXRhW3Quc291cmNlLm5hbWVdID09IHZvaWQgMCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBvYmplY3Qgb3IgZW51bSBvciBvdGhlcnNcbiAgICAgICAgICAgICAgICBhc3NlcnQoaXNBcnJheSwgXCLmmoLkuI3mlK/mjIHmlbDnu4TnsbvlnotcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzaGVldCA9IGdldFZhbHVlKHR5KSE7XG4gICAgICAgICAgICAgICAgaWYgKCh0eSBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoS2V5V29yZHMuT2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDmjqXlj6NcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZmFjZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YiA9IHJlLnNscy5nZXQoc2hlZXQpITtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZXMgPSBzdWI/Lm1haW4hLnR5cGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYWluID0gc3ViPy5tYWluO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBtYWluPy5yb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoK2tleSA9PSB0LmlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtYWluPy5yb3dzWytrZXldLmNlbGxzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdHlwZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZHg6IHQuaWR4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGlmYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0VHlwZVZhbHVlKGlucHV0IGFzIFBRSW5wdXQsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IGlmYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgodHkgYXMgc3RyaW5nKS5zdGFydHNXaXRoKEtleVdvcmRzLkVudW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaemuS4vlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWIgPSByZS5zbHMuZ2V0KHNoZWV0KSE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVzID0gc3ViPy50eXBlcy5uYW1lcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFja3MgPSBzdWI/LnR5cGVzLnBhY2tzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IHZvaWQgMCwgXCLop6PmnpDmnprkuL7lpLHotKVcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbmFtZXMuaW5kZXhPZih0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ISk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSBwYWNrc1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIGDlnKgke25hbWVzfeS4reacquaJvuWIsOaemuS4vumhuSAke3QudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9PSB2b2lkIDAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaOpeWPo+WxnuaAp1xuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJuIHsqfSAge1Byb3BlcnR5U2lnbmF0dXJlU3RydWN0dXJlW119XG4gICAgICogQG1lbWJlcm9mIFJlYWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVByb3BlcnR5KFxuICAgICAgICBkb2NzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxuICAgICAgICBuYW1lczogKHN0cmluZyB8IG51bWJlcilbXSxcbiAgICAgICAgdHlwZXM6IChzdHJpbmcgfCBudW1iZXIpW10sXG4gICAgICAgIHBhY2tzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxuICAgICAgICBmaWx0ZXI6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICApOiBQcm9wZXJ0eVNpZ25hdHVyZVN0cnVjdHVyZVtdIHtcbiAgICAgICAgY29uc3QgcHJvcHM6IFByb3BlcnR5U2lnbmF0dXJlU3RydWN0dXJlW10gPSBbXTtcblxuICAgICAgICAvLyDku44x5byA5aeLXG4gICAgICAgIC8vIOWboOS4ujAg5piv5rOo6YeKXG4gICAgICAgIGZvciAobGV0IGkgPSAxLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gbmFtZXNbaV0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgY29uc3QgdCA9IHR5cGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmIHBhY2tzW2ldICE9IEtleVdvcmRzLklEVkFMVUUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdG4gPSB0aGlzLmdldFR5cGUodCBhcyBQcm90b0J1ZlNjYWxhclR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoIXRuKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLlr7nosaHooajovr7lvI/plJnor69cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBuLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRuLFxuICAgICAgICAgICAgICAgIGRvY3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRvY3NbaV0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0gYXMgUHJvcGVydHlTaWduYXR1cmVTdHJ1Y3R1cmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VHlwZSh0OiBQcm90b0J1ZlNjYWxhclR5cGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpc0FycmF5ID0gdC5lbmRzV2l0aChcIltdXCIpO1xuICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZShcIltdXCIsIFwiXCIpIGFzIFByb3RvQnVmU2NhbGFyVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwiaW50NjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ1aW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ1aW50NjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzaW50NjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJmaXhlZDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwiZml4ZWQ2NFwiOlxuICAgICAgICAgICAgY2FzZSBcInNmaXhlZDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic2ZpeGVkNjRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNBcnJheSA/IFwibnVtYmVyW11cIiA6IFwibnVtYmVyXCI7XG4gICAgICAgICAgICBjYXNlIFwiYm9vbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc0FycmF5ID8gXCJib29sZWFuW11cIiA6IFwiYm9vbGVhblwiO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc0FycmF5ID8gXCJzdHJpbmdbXVwiIDogXCJzdHJpbmdcIjtcbiAgICAgICAgICAgIGNhc2UgXCJieXRlc1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc0FycmF5ID8gXCJVaW50OEFycmF5W11cIiA6IFwiVWludDhBcnJheVwiO1xuICAgICAgICAgICAgLy8g5Ye95pWw57G75Z6LXG4gICAgICAgICAgICBjYXNlIFwiZm5cIjpcbiAgICAgICAgICAgIC8vIOadoeS7tuexu+Wei1xuICAgICAgICAgICAgY2FzZSBcImNvbmRpdGlvblwiOlxuICAgICAgICAgICAgLy8g5YWs5byP57G75Z6LXG4gICAgICAgICAgICBjYXNlIFwiZm9ybXVsYVwiOlxuICAgICAgICAgICAgLy8g6ZmQ5Yi257G75Z6LXG4gICAgICAgICAgICBjYXNlIFwibGltaXRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJFeHByZXNzaW9uc1wiO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBvYmplY3Qgb3IgZW51bSBvciBvdGhlcnNcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3RVcHBlckNhc2UoZ2V0VmFsdWUodCkhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgU3ViUmVhZEV4Y2VsIGV4dGVuZHMgUmVhZEV4Y2VsIHtcbiAgICBwdWJsaWMgcmU6IFJlYWRFeGNlbDtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzaGVldDogUFFXb3JrQm9vaywgdHlwZXM6IFJlYWRFeGNlbFR5cGUpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlID0gdHlwZXMucmU7XG4gICAgICAgIHRoaXMucmUuYWRkUmVhZEV4Y2VsKG5hbWUsIHRoaXMpO1xuICAgICAgICB0aGlzLmludGVyZmFjZU5hbWUgPSBmaXJzdFVwcGVyQ2FzZShuYW1lKTtcbiAgICAgICAgdGhpcy5tYWluID0gc2hlZXQ7XG4gICAgICAgIHRoaXMucHJvamVjdCA9IHR5cGVzLnJlLnByb2plY3Q7XG4gICAgICAgIHRoaXMuc2YgPSB0eXBlcy5yZS5zZjtcbiAgICAgICAgdGhpcy50eXBlcyA9IG5ldyBSZWFkRXhjZWxUeXBlKHR5cGVzLnJlLCB0aGlzLm1haW4pO1xuICAgICAgICB0aGlzLnR5cGVzLnBhcnNlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnNlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNyZWF0ZUludGVyZmFjZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVJbnRlcmZhY2UoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNmID0gdGhpcy5zZjtcblxuICAgICAgICAvLyDnm7TmjqXmib4xLDPlkow0XG4gICAgICAgIC8vIDHmmK/lj5jph4/nn63ms6jph4pcbiAgICAgICAgLy8gM+aYr+WPmOmHj+WQjeensFxuICAgICAgICAvLyA05piv5Y+Y6YeP57G75Z6LXG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xuICAgICAgICBjb25zdCBwYWNrZXIgPSB3Yi5yb3dzWzVdLmNlbGxzO1xuICAgICAgICAvLyDnnIvnnIvnsbvlnotcbiAgICAgICAgc3dpdGNoIChwYWNrZXJbMF0udGV4dCkge1xuICAgICAgICAgICAgLy8g5LiA57u055qES1bmiZPljIVcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0xJU1Q6XG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9NQVA6XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMTShzZik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9FTlVNOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRW51bShzZik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyDlpJrnu7TnmoRLVuaJk+WMhVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWtkOmhueaXoOazleS9v+eUqOmZpFBBQ0tFUl9MSVNU5ZKMUEFDS0VSX0VOVU3miZPljIXku6XlpJbnmoTku7vkvZXmlrnlvI9cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZXJPcHRpb25zIHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyBpbnB1dDogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgb3V0cHV0X2Jpbjogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgb3V0cHV0X3RzOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyBjc3R5cGU6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGdsb2JhbE1vZHVsZU5hbWU6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGdsb2JhbE1vZHVsZVRTTmFtZTogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogc3RyaW5nXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlciB7XG4gICAgcHVibGljIGFyZ3MgPSB7XG4gICAgICAgIGlucHV0OiBcIlwiLFxuICAgICAgICBvdXRwdXQ6IFwiXCIsXG4gICAgICAgIHRzOiBcIlwiLFxuICAgICAgICBjc3R5cGU6IFwic2VydmVyXCIsXG4gICAgICAgIGdsb2JhbE1vZHVsZU5hbWU6IFwiXCIsXG4gICAgICAgIGdsb2JhbE1vZHVsZVRTTmFtZTogXCJcIixcbiAgICAgICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogXCJcIlxuICAgIH07XG4gICAgcHJpdmF0ZSBwcm9qZWN0ITogUHJvamVjdDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBQYXJzZXJPcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5pbnB1dCkge1xuICAgICAgICAgICAgRWRpdG9yLkRpYWxvZy5lcnJvcihgJHtFZGl0b3IuSTE4bi50KFwieGxzeF9wYXRoXCIpfemUmeivr2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLm91dHB1dF9iaW4pIHtcbiAgICAgICAgICAgIEVkaXRvci5EaWFsb2cuZXJyb3IoYCR7RWRpdG9yLkkxOG4udChcImV4cG9ydF9kaXJlY3RvclwiKX3plJnor69gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb3B0aW9ucy5vdXRwdXRfdHMpIHtcbiAgICAgICAgICAgIEVkaXRvci5EaWFsb2cuZXJyb3IoYCR7RWRpdG9yLkkxOG4udChcImV4cG9ydF90c19kaXJlY3RvclwiKX3plJnor69gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXJncy5pbnB1dCA9IHRoaXMucHJvamVjdFBhdGgob3B0aW9ucy5pbnB1dCk7XG4gICAgICAgIHRoaXMuYXJncy5vdXRwdXQgPSB0aGlzLnByb2plY3RQYXRoKG9wdGlvbnMub3V0cHV0X2Jpbik7XG4gICAgICAgIHRoaXMuYXJncy50cyA9IHRoaXMucHJvamVjdFBhdGgob3B0aW9ucy5vdXRwdXRfdHMpO1xuICAgICAgICB0aGlzLmFyZ3MuY3N0eXBlID0gdGhpcy5wcm9qZWN0UGF0aChvcHRpb25zLmNzdHlwZSk7XG5cbiAgICAgICAgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZU5hbWUgPSBvcHRpb25zLmdsb2JhbE1vZHVsZU5hbWUgfHwgXCJrc2dhbWVzMjZcIjtcbiAgICAgICAgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZSA9IG9wdGlvbnMuZ2xvYmFsTW9kdWxlVFNOYW1lIHx8IFwia3NnYW1lczI2XCI7XG4gICAgICAgIGlmICh0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lLmVuZHNXaXRoKFwiLnRzXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lID0gdGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZS5zdWJzdHJpbmcoMCwgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZS5sZW5ndGggLSAzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSA9IG9wdGlvbnMuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSB8fCBcIklDb25maWd1cmVUYWJsZVwiO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcm9qZWN0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZShcInByb2plY3Q6L1wiLCBFZGl0b3IuUHJvamVjdC5wYXRoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlUHJvamVjdCgpOiBQcm9qZWN0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9qZWN0KHtcbiAgICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGluY3JlbWVudGFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTNSxcbiAgICAgICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlTWFwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbXBvc2l0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVzb2x1dGlvbjogdHMuTW9kdWxlUmVzb2x1dGlvbktpbmQuTm9kZUpzLFxuICAgICAgICAgICAgICAgIGVzTW9kdWxlSW50ZXJvcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBza2lwTGliQ2hlY2s6IHRydWUsXG4gICAgICAgICAgICAgICAgZm9yY2VDb25zaXN0ZW50Q2FzaW5nSW5GaWxlTmFtZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgZXhwZXJpbWVudGFsRGVjb3JhdG9yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBub0ltcGxpY2l0QW55OiB0cnVlLFxuICAgICAgICAgICAgICAgIG5vSW1wbGljaXRUaGlzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlc29sdmVKc29uTW9kdWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNraXBEZWZhdWx0TGliQ2hlY2s6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZShpbml0OiAoZGF0YTogQXJyYXk8eyBpZDogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbiB9PikgPT4gdm9pZCwgY2I6IChuYW1lOiBzdHJpbmcsIHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQsIHByb2dyZXNzOiAocHJvZ3Jlc3M6IG51bWJlcikgPT4gdm9pZCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBCeXRlKCk7XG4gICAgICAgIGNvbnN0IGYgPSBuZXcgRmlsZSh0aGlzLmFyZ3MuaW5wdXQhKTtcblxuICAgICAgICB0aGlzLnByb2plY3QgPSB0aGlzLmNyZWF0ZVByb2plY3QoKTtcblxuICAgICAgICBpZiAoZXhpc3RzU3luYyhqb2luKHRoaXMuYXJncy50cyEsIGAke3RoaXMuYXJncy5nbG9iYWxNb2R1bGVUU05hbWV9LnRzYCkpKSB7XG4gICAgICAgICAgICB1bmxpbmtTeW5jKGpvaW4odGhpcy5hcmdzLnRzISwgYCR7dGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZX0udHNgKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2ZnID0gdGhpcy5wcm9qZWN0LmNyZWF0ZVNvdXJjZUZpbGUoam9pbih0aGlzLmFyZ3MudHMhLCBgJHt0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lfS50c2ApLCBcIlwiKTtcblxuICAgICAgICBsZXQgcHJlc2VudCA9IDA7XG5cbiAgICAgICAgc2ZnLmFkZFN0YXRlbWVudHModyA9PlxuICAgICAgICAgICAgdy53cml0ZShgJHtLZXlXb3Jkcy5EZWNsYXJlfSAke0tleVdvcmRzLkdsb2JhbH1gKS5ibG9jaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFsbEZpbGVzID0gZi5nZXRBbGxGaWxlcyhcIi54bHN4XCIpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGRhdGE6IEFycmF5PHsgaWQ6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4gfT4gPSBbXTtcblxuICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgICAgICAgICAgICBhbGxGaWxlcy5mb3JFYWNoKGYgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/h+a7pGV4Y2Vs5omT5byA5ZCO6Ieq5Yqo5Yib5bu655qE5Ymv5pysXG4gICAgICAgICAgICAgICAgICAgIGlmIChmLm5hbWUuc3RhcnRzV2l0aChcIn4kXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICBpbml0ICYmIGluaXQoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBhbGxGaWxlcy5mb3JFYWNoKGYgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyDov4fmu6RleGNlbOaJk+W8gOWQjuiHquWKqOWIm+W7uueahOWJr+acrFxuICAgICAgICAgICAgICAgICAgICBpZiAoZi5uYW1lLnN0YXJ0c1dpdGgoXCJ+JFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgUmVhZEV4Y2VsKGYsIHRoaXMuY3JlYXRlUHJvamVjdCgpLCBuZXcgRmlsZSh0aGlzLmFyZ3MudHMhKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g6K+75Y+W6YWN572u6KGoXG4gICAgICAgICAgICAgICAgICAgIHIucmVhZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOino+aekOmFjee9ruihqFxuICAgICAgICAgICAgICAgICAgICByLnBhcnNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2ZnLmFkZEltcG9ydERlY2xhcmF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZWRJbXBvcnRzOiBbci5pbnRlcmZhY2VOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogYC4vJHtyLmZpbGVOYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZmcuYWRkRXhwb3J0RGVjbGFyYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNUeXBlT25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVTcGVjaWZpZXI6IGAuLyR7ci5maWxlTmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGBtb2R1bGUgJHt0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlTmFtZX1gKS5ibG9jaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGAke0tleVdvcmRzLkludGVyZmFjZX0gJHt0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZX1gKS5ibG9jaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5p6E5bu6Z2xvYmFs5o6l5Y+j5pa55L6/5o+Q56S6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgci5nbG9iYWwodyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgci5wYWNrKHRoaXMuYXJncy5nbG9iYWxNb2R1bGVUU05hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHIuc2F2ZSh0aGlzLmFyZ3MuY3N0eXBlID09IFwiY2xpZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghci5idWZmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiICYmIGNiKGYubmFtZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLmiZPljIXmlbDmja7mnInor68s5omT5YyF5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2IgJiYgY2IoZi5uYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVBcnJheUJ1ZmZlcihyLmJ1ZmZlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MgJiYgcHJvZ3Jlc3MoKCsrcHJlc2VudCAvIGNvdW50KSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wcm9qZWN0LmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChmID0+IGYuZm9ybWF0VGV4dCgpKTtcbiAgICAgICAgc2ZnLnNhdmUoKTtcbiAgICAgICAgLy8gc2F2ZSBkYXRhXG4gICAgICAgIGF3YWl0IGRpckV4aXN0cyh0aGlzLmFyZ3Mub3V0cHV0ISk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoam9pbih0aGlzLmFyZ3Mub3V0cHV0ISwgXCJjZmcuYmluXCIpLCBieXRlcy5nZXRVaW50OEFycmF5KDAsIGJ5dGVzLnBvcykpO1xuICAgIH1cbn1cbiJdfQ==