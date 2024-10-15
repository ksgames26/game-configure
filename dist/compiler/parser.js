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
                    if (list.endsWith(";")) {
                        // 去掉最后的;
                        list = list.substring(0, list.length - 1);
                    }
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
                    if (list.endsWith(";")) {
                        // 去掉最后的;
                        list = list.substring(0, list.length - 1);
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2NvbXBpbGVyL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7QUFHSCxrREFBK0Q7QUFDL0QsMkJBQTJEO0FBQzNELCtCQUE0QjtBQUM1Qix1Q0Fja0I7QUFDbEIsMkJBQTJDO0FBQzNDLGlDQUF5QztBQUV6QyxnREFBd0I7QUFDeEIsaUNBQThCO0FBQzlCLHlDQUFxQztBQUNyQywrQ0FBZ0U7QUFDaEUsMkNBQWlHO0FBQzFGLE1BQU0sTUFBTSxHQUFHLFVBQVUsU0FBa0IsRUFBRSxPQUFlO0lBQy9ELElBQUksU0FBUyxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFKVyxRQUFBLE1BQU0sVUFJakI7QUFFRixNQUFNLFNBQVM7SUFDSixNQUFNLENBQUMsWUFBWSxDQUFDLEtBQWEsSUFBSSxDQUFDO0NBQ2hEO0FBRUQsTUFBTSxRQUFRLEdBQUc7SUFDYixFQUFFLEtBQUssQ0FBQztDQUNYLENBQUE7QUFFRCxNQUFNLEdBQUcsR0FBRyx1R0FBdUcsQ0FBQztBQUVwSCxTQUFTLEtBQUssQ0FBQyxHQUFXO0lBQ3RCLFNBQVMsVUFBVSxDQUFDLE1BQWM7UUFDOUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7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RyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUvQixNQUFNLFVBQVUsR0FBd0IsRUFBRSxDQUFDO1FBQzNDLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUF3QixFQUFFLENBQUM7UUFDM0MsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFH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QUFDLE1BQU8sQ0FBQyxDQUFDO1FBQ25DLElBQUEsa0JBQWEsRUFBQyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0NBQ0o7QUEvSkQsd0JBK0pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqXHJcbiAqICBAc2VlIGh0dHBzOi8vdHMtYXN0LXZpZXdlci5jb20vXHJcbiAqXHJcbiAqICDnlKjmnaXmiZPljIVFeGNlbOWIsFByb3RvYnVmXHJcbiAqXHJcbiAqL1xyXG5cclxuXHJcbmltcG9ydCB7IE1lc3NhZ2VUeXBlLCBSZXBlYXRUeXBlIH0gZnJvbSBcIkBwcm90b2J1Zi10cy9ydW50aW1lXCI7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHVubGlua1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7XHJcbiAgICBDbGFzc0RlY2xhcmF0aW9uU3RydWN0dXJlLFxyXG4gICAgQ29kZUJsb2NrV3JpdGVyLFxyXG4gICAgQ29uc3RydWN0b3JEZWNsYXJhdGlvbixcclxuICAgIEVudW1EZWNsYXJhdGlvblN0cnVjdHVyZSxcclxuICAgIEVudW1NZW1iZXJTdHJ1Y3R1cmUsXHJcbiAgICBJbnRlcmZhY2VEZWNsYXJhdGlvbixcclxuICAgIEludGVyZmFjZURlY2xhcmF0aW9uU3RydWN0dXJlLFxyXG4gICAgUHJvamVjdCxcclxuICAgIFByb3BlcnR5U2lnbmF0dXJlU3RydWN0dXJlLFxyXG4gICAgU291cmNlRmlsZSxcclxuICAgIFZhcmlhYmxlRGVjbGFyYXRpb25LaW5kLFxyXG4gICAgVmFyaWFibGVTdGF0ZW1lbnRTdHJ1Y3R1cmUsXHJcbiAgICB0c1xyXG59IGZyb20gXCJ0cy1tb3JwaFwiO1xyXG5pbXBvcnQgeyBTY3JpcHQsIGNyZWF0ZUNvbnRleHQgfSBmcm9tIFwidm1cIjtcclxuaW1wb3J0IHsgRmlsZSwgZGlyRXhpc3RzIH0gZnJvbSBcIi4vZmlsZVwiO1xyXG5cclxuaW1wb3J0IHhsc3ggZnJvbSBcInhsc3hcIjtcclxuaW1wb3J0IHsgQnl0ZSB9IGZyb20gXCIuL2J5dGVcIjtcclxuaW1wb3J0IHsgY29tcGlsZSB9IGZyb20gXCIuL2NvbXBpbGVyXCI7XHJcbmltcG9ydCB7IEV4cHJlc3Npb25zLCBFeHByZXNzaW9uc0hhbmRsZXIgfSBmcm9tIFwiLi9leHByZXNzaW9uc1wiO1xyXG5pbXBvcnQgeyBLZXlXb3JkcywgUFFJbnB1dCwgUFFXb3JrQm9vaywgUHJvdG9CdWZTY2FsYXJUeXBlLCBTY2FsYXJUeXBlVmFsdWUgfSBmcm9tIFwiLi93b3JrLWJvb2tcIjtcclxuZXhwb3J0IGNvbnN0IGFzc2VydCA9IGZ1bmN0aW9uIChjb25kaXRpb246IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgaWYgKGNvbmRpdGlvbikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNsYXNzIENvbnRhaW5lciB7XHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEludGVyZmFjZShpZmFjZTogc3RyaW5nKSB7IH1cclxufVxyXG5cclxuY29uc3QgZGlyZWN0b3IgPSB7XHJcbiAgICBvbigpIHsgfVxyXG59XHJcblxyXG5jb25zdCBtc2cgPSBcIlFOPTIwMTYwODAxMDg1ODU3MjIzO1NUPTMyO0NOPTEwNjI7UFc9MTAwMDAwO01OPTAxMDAwMEE4OTAwMDE2RjAwMDE2OURDMDtGbGFnPTU7Q1A9JiZSdGRJbnRlcnZhbD0zMCYmXCI7XHJcblxyXG5mdW5jdGlvbiBjcmMzMihzdHI6IHN0cmluZykge1xyXG4gICAgZnVuY3Rpb24gVXRmOEVuY29kZShzdHJpbmc6IHN0cmluZykge1xyXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9cXHJcXG4vZywgXCJcXG5cIik7XHJcblxyXG4gICAgICAgIHZhciB1dGZ0ZXh0ID0gXCJcIjtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBzdHJpbmcubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBzdHJpbmcuY2hhckNvZGVBdChuKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjIDwgMTI4KSB7XHJcbiAgICAgICAgICAgICAgICB1dGZ0ZXh0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA+IDEyNyAmJiBjIDwgMjA0OCkge1xyXG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDYpIHwgMTkyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB1dGZ0ZXh0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiA2MykgfCAxMjgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDEyKSB8IDIyNCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYyA+PiA2KSAmIDYzKSB8IDEyOCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgNjMpIHwgMTI4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHV0ZnRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RyID0gVXRmOEVuY29kZShzdHIpO1xyXG4gICAgbGV0IGNyYyA9IDA7XHJcblxyXG4gICAgdmFyIHRhYmxlID1cclxuICAgICAgICBcIjAwMDAwMDAwIDc3MDczMDk2IEVFMEU2MTJDIDk5MDk1MUJBIDA3NkRDNDE5IDcwNkFGNDhGIEU5NjNBNTM1IDlFNjQ5NUEzIDBFREI4ODMyIDc5RENCOEE0IEUwRDVFOTFFIDk3RDJEOTg4IDA5QjY0QzJCIDdFQjE3Q0JEIEU3QjgyRDA3IDkwQkYxRDkxIDFEQjcxMDY0IDZBQjAyMEYyIEYzQjk3MTQ4IDg0QkU0MURFIDFBREFENDdEIDZERERFNEVCIEY0RDRCNTUxIDgzRDM4NUM3IDEzNkM5ODU2IDY0NkJBOEMwIEZENjJGOTdBIDhBNjVDOUVDIDE0MDE1QzRGIDYzMDY2Q0Q5IEZBMEYzRDYzIDhEMDgwREY1IDNCNkUyMEM4IDRDNjkxMDVFIEQ1NjA0MUU0IEEyNjc3MTcyIDNDMDNFNEQxIDRCMDRENDQ3IEQyMEQ4NUZEIEE1MEFCNTZCIDM1QjVBOEZBIDQyQjI5ODZDIERCQkJDOUQ2IEFDQkNGOTQwIDMyRDg2Q0UzIDQ1REY1Qzc1IERDRDYwRENGIEFCRDEzRDU5IDI2RDkzMEFDIDUxREUwMDNBIEM4RDc1MTgwIEJGRDA2MTE2IDIxQjRGNEI1IDU2QjNDNDIzIENGQkE5NTk5IEI4QkRBNTBGIDI4MDJCODlFIDVGMDU4ODA4IEM2MENEOUIyIEIxMEJFOTI0IDJGNkY3Qzg3IDU4Njg0QzExIEMxNjExREFCIEI2NjYyRDNEIDc2REM0MTkwIDAxREI3MTA2IDk4RDIyMEJDIEVGRDUxMDJBIDcxQjE4NTg5IDA2QjZCNTFGIDlGQkZFNEE1IEU4QjhENDMzIDc4MDdDOUEyIDBGMDBGOTM0IDk2MDlBODhFIEUxMEU5ODE4IDdGNkEwREJCIDA4NkQzRDJEIDkxNjQ2Qzk3IEU2NjM1QzAxIDZCNkI1MUY0IDFDNkM2MTYyIDg1NjUzMEQ4IEYyNjIwMDRFIDZDMDY5NUVEIDFCMDFBNTdCIDgyMDhGNEMxIEY1MEZDNDU3IDY1QjBEOUM2IDEyQjdFOTUwIDhCQkVCOEVBIEZDQjk4ODdDIDYyREQxRERGIDE1REEyRDQ5IDhDRDM3Q0YzIEZCRDQ0QzY1IDREQjI2MTU4IDNBQjU1MUNFIEEzQkMwMDc0IEQ0QkIzMEUyIDRBREZBNTQxIDNERDg5NUQ3IEE0RDFDNDZEIEQzRDZGNEZCIDQzNjlFOTZBIDM0NkVEOUZDIEFENjc4ODQ2IERBNjBCOEQwIDQ0MDQyRDczIDMzMDMxREU1IEFBMEE0QzVGIEREMEQ3Q0M5IDUwMDU3MTNDIDI3MDI0MUFBIEJFMEIxMDEwIEM5MEMyMDg2IDU3NjhCNTI1IDIwNkY4NUIzIEI5NjZENDA5IENFNjFFNDlGIDVFREVGOTBFIDI5RDlDOTk4IEIwRDA5ODIyIEM3RDdBOEI0IDU5QjMzRDE3IDJFQjQwRDgxIEI3QkQ1QzNCIEMwQkE2Q0FEIEVEQjg4MzIwIDlBQkZCM0I2IDAzQjZFMjBDIDc0QjFEMjlBIEVBRDU0NzM5IDlERDI3N0FGIDA0REIyNjE1IDczREMxNjgzIEUzNjMwQjEyIDk0NjQzQjg0IDBENkQ2QTNFIDdBNkE1QUE4IEU0MEVDRjBCIDkzMDlGRjlEIDBBMDBBRTI3IDdEMDc5RUIxIEYwMEY5MzQ0IDg3MDhBM0QyIDFFMDFGMjY4IDY5MDZDMkZFIEY3NjI1NzVEIDgwNjU2N0NCIDE5NkMzNjcxIDZFNkIwNkU3IEZFRDQxQjc2IDg5RDMyQkUwIDEwREE3QTVBIDY3REQ0QUNDIEY5QjlERjZGIDhFQkVFRkY5IDE3QjdCRTQzIDYwQjA4RUQ1IEQ2RDZBM0U4IEExRDE5MzdFIDM4RDhDMkM0IDRGREZGMjUyIEQxQkI2N0YxIEE2QkM1NzY3IDNGQjUwNkREIDQ4QjIzNjRCIEQ4MEQyQkRBIEFGMEExQjRDIDM2MDM0QUY2IDQxMDQ3QTYwIERGNjBFRkMzIEE4NjdERjU1IDMxNkU4RUVGIDQ2NjlCRTc5IENCNjFCMzhDIEJDNjY4MzFBIDI1NkZEMkEwIDUyNjhFMjM2IENDMEM3Nzk1IEJCMEI0NzAzIDIyMDIxNkI5IDU1MDUyNjJGIEM1QkEzQkJFIEIyQkQwQjI4IDJCQjQ1QTkyIDVDQjM2QTA0IEMyRDdGRkE3IEI1RDBDRjMxIDJDRDk5RThCIDVCREVBRTFEIDlCNjRDMkIwIEVDNjNGMjI2IDc1NkFBMzlDIDAyNkQ5MzBBIDlDMDkwNkE5IEVCMEUzNjNGIDcyMDc2Nzg1IDA1MDA1NzEzIDk1QkY0QTgyIEUyQjg3QTE0IDdCQjEyQkFFIDBDQjYxQjM4IDkyRDI4RTlCIEU1RDVCRTBEIDdDRENFRkI3IDBCREJERjIxIDg2RDNEMkQ0IEYxRDRFMjQyIDY4RERCM0Y4IDFGREE4MzZFIDgxQkUxNkNEIEY2QjkyNjVCIDZGQjA3N0UxIDE4Qjc0Nzc3IDg4MDg1QUU2IEZGMEY2QTcwIDY2MDYzQkNBIDExMDEwQjVDIDhGNjU5RUZGIEY4NjJBRTY5IDYxNkJGRkQzIDE2NkNDRjQ1IEEwMEFFMjc4IEQ3MEREMkVFIDRFMDQ4MzU0IDM5MDNCM0MyIEE3NjcyNjYxIEQwNjAxNkY3IDQ5Njk0NzREIDNFNkU3N0RCIEFFRDE2QTRBIEQ5RDY1QURDIDQwREYwQjY2IDM3RDgzQkYwIEE5QkNBRTUzIERFQkI5RUM1IDQ3QjJDRjdGIDMwQjVGRkU5IEJEQkRGMjFDIENBQkFDMjhBIDUzQjM5MzMwIDI0QjRBM0E2IEJBRDAzNjA1IENERDcwNjkzIDU0REU1NzI5IDIzRDk2N0JGIEIzNjY3QTJFIEM0NjE0QUI4IDVENjgxQjAyIDJBNkYyQjk0IEI0MEJCRTM3IEMzMEM4RUExIDVBMDVERjFCIDJEMDJFRjhEXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBjcmMgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIGNyYyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHg6IHN0cmluZyB8IG51bWJlciA9IDA7XHJcblxyXG4gICAgdmFyIHkgPSAwO1xyXG5cclxuICAgIGNyYyA9IGNyYyBeIC0xO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBpVG9wID0gc3RyLmxlbmd0aDsgaSA8IGlUb3A7IGkrKykge1xyXG4gICAgICAgIHkgPSAoY3JjIF4gc3RyLmNoYXJDb2RlQXQoaSkpICYgMHhmZjtcclxuXHJcbiAgICAgICAgeCA9IFwiMHhcIiArIHRhYmxlLnN1YnN0cih5ICogOSwgOCk7XHJcblxyXG4gICAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gKCh4IGFzIHVua25vd24pIGFzIG51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coY3JjIF4gLTEpO1xyXG5cclxuICAgIC8vIEBzZWUgaHR0cHM6Ly9zZWdtZW50ZmF1bHQuY29tL3EvMTAxMDAwMDAxMjAwMzY3NVxyXG4gICAgcmV0dXJuIGNyYyBeIC0xICsgMHhmZmZmZmZmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaJk+WMheaWueW8j1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVudW0gUEFDS0VSIHtcclxuICAgIC8qKlxyXG4gICAgICogIOaVsOe7hOaJk+WMhVxyXG4gICAgICovXHJcbiAgICBMSVNULFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIEhhc2hNYXDmiZPljIVcclxuICAgICAqL1xyXG4gICAgTUFQLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6ZSu5YC85a+55omT5YyFXHJcbiAgICAgKi9cclxuICAgIEtWLFxyXG59XHJcblxyXG4vL2xldCBpZCA9IDEwMDAwO1xyXG5jb25zdCBpZE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XHJcbmNvbnN0IGdlbmVyYXRvclByb3RvSUQgPSAobmFtZTogc3RyaW5nKSA9PiBpZE1hcC5nZXQobmFtZSkgPz8gaWRNYXAuc2V0KG5hbWUsIGNyYzMyKG5hbWUpLnRvU3RyaW5nKCkpLmdldChuYW1lKSE7XHJcblxyXG5pbnRlcmZhY2UgRGljdCB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDpppblrZfmr43lpKflhplcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxyXG4gKi9cclxuY29uc3QgZmlyc3RVcHBlckNhc2UgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5yZXBsYWNlKHN0clswXSwgc3RyWzBdLnRvVXBwZXJDYXNlKCkpOy8vc3RyLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKCB8XilbYS16XS9nLCBMID0+IEwudG9VcHBlckNhc2UoKSk7XHJcblxyXG5jb25zdCBuYW1lSm9pbiA9IChvbGQ6IHN0cmluZykgPT4ge1xyXG4gICAgLy8g6aaW5a2X5q+N5bCP5YaZXHJcbiAgICBvbGQgPSBvbGQucmVwbGFjZShvbGRbMF0sIG9sZFswXS50b0xvd2VyQ2FzZSgpKTtcclxuXHJcbiAgICAvLyDnhLblkI7lvIDlp4vmi7zmjqVcclxuICAgIGNvbnN0IHN0cmluZ0FycmF5ID0gb2xkLnNwbGl0KCcnKTtcclxuICAgIGxldCBuZXdGaWVsZCA9IG9sZDtcclxuICAgIHN0cmluZ0FycmF5LmZvckVhY2godCA9PiB7XHJcbiAgICAgICAgaWYgKC9bQS1aXS8udGVzdCh0KSkge1xyXG4gICAgICAgICAgICBuZXdGaWVsZCA9IG5ld0ZpZWxkLnJlcGxhY2UodCwgYC0ke3QudG9Mb3dlckNhc2UoKX1gKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ld0ZpZWxkO1xyXG59XHJcblxyXG4vKipcclxuICog5o+Q5Y+W5ous5Y+35YaF55qE5YC8XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcclxuICovXHJcbmNvbnN0IHZhbHVlT2ZQYXR0ZXJuID0gKHN0cjogc3RyaW5nKSA9PiBzdHIubWF0Y2goLyg/PD1cXCgpLiooPz1cXCkpL2cpO1xyXG5cclxuLyoqXHJcbiAqIOiOt+WPluijheeuseaLhueusemYtuauteeahOWunumZheexu+Wei1xyXG4gKlxyXG4gKiBAcGFyYW0ge1Byb3RvQnVmU2NhbGFyVHlwZX0gdFxyXG4gKiBAcmV0dXJuIHsqfSAge3N0cmluZ31cclxuICovXHJcbmNvbnN0IGdldFByb3RvQnVmVHlwZSA9IGZ1bmN0aW9uICh0OiBQcm90b0J1ZlNjYWxhclR5cGUpOiBzdHJpbmcge1xyXG4gICAgbGV0IHQxID0gXCJcIjtcclxuICAgIHN3aXRjaCAodCkge1xyXG4gICAgICAgIGNhc2UgXCJkb3VibGVcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuRE9VQkxFfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLkRPVUJMRX0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJmbG9hdFwiOlxyXG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5GTE9BVH0gIC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuRkxPQVR9Ki9gO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiaW50MzJcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuSU5UMzJ9ICAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLklOVDMyfSovYDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImludDY0XCI6XHJcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLklOVDY0fSAgLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5JTlQ2NH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJ1aW50MzJcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuVUlOVDMyfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLlVJTlQzMn0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJ1aW50NjRcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuVUlOVDY0fSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLlVJTlQ2NH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzaW50MzJcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuU0lOVDMyfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLlNJTlQzMn0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzaW50NjRcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuU0lOVDY0fSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLlNJTlQ2NH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJmaXhlZDMyXCI6XHJcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLkZJWEVEMzJ9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuRklYRUQzMn0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJmaXhlZDY0XCI6XHJcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLkZJWEVENjR9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuRklYRUQ2NH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzZml4ZWQzMlwiOlxyXG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5TRklYRUQzMn0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5TRklYRUQzMn0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzZml4ZWQ2NFwiOlxyXG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5TRklYRUQ2NH0gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5TRklYRUQ2NH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJib29sXCI6XHJcbiAgICAgICAgICAgIHQxID0gYCR7U2NhbGFyVHlwZVZhbHVlLkJPT0x9IC8qJHtLZXlXb3Jkcy5TY2FsYXJUeXBlfS4ke1NjYWxhclR5cGUuQk9PTH0qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgdDEgPSBgJHtTY2FsYXJUeXBlVmFsdWUuU1RSSU5HfSAvKiR7S2V5V29yZHMuU2NhbGFyVHlwZX0uJHtTY2FsYXJUeXBlLlNUUklOR30qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJieXRlc1wiOlxyXG4gICAgICAgICAgICB0MSA9IGAke1NjYWxhclR5cGVWYWx1ZS5CWVRFU30gLyoke0tleVdvcmRzLlNjYWxhclR5cGV9LiR7U2NhbGFyVHlwZS5CWVRFU30qL2A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOmZkOWItuexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJsaW1pdFwiOlxyXG4gICAgICAgIC8vIOWHveaVsOexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJmblwiOlxyXG4gICAgICAgIC8vIOadoeS7tuexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJjb25kaXRpb25cIjpcclxuICAgICAgICAvLyDlhazlvI/nsbvlnotcclxuICAgICAgICBjYXNlIFwiZm9ybXVsYVwiOlxyXG4gICAgICAgICAgICB0MSA9IGAoKSA9PiBFeHByZXNzaW9uc0hhbmRsZXJgO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBjb25zdCBzdHIgPSB0IGFzIHN0cmluZztcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gZ2V0VmFsdWUoc3RyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzQXJyYXkgPSBzdHIuZW5kc1dpdGgoXCJbXVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFByb3RvQnVmVHlwZShzdHIucmVwbGFjZShcIltdXCIsIFwiXCIpIGFzIFByb3RvQnVmU2NhbGFyVHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwi57G75Z6L5LiN5pSv5oyBXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RyLnN0YXJ0c1dpdGgoS2V5V29yZHMuT2JqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoKSA9PiAke2ZpcnN0VXBwZXJDYXNlKHZhbHVlKX1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoKSA9PiBbXCIke2ZpcnN0VXBwZXJDYXNlKHZhbHVlKX1cIiwke2ZpcnN0VXBwZXJDYXNlKHZhbHVlKX1dYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHQxO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOiOt+WPluijheeuseaLhueusemYtuauteeahOexu+Wei+exu+Wei1xyXG4gKlxyXG4gKiBAcGFyYW0ge1Byb3RvQnVmU2NhbGFyVHlwZX0gdFxyXG4gKiBAcmV0dXJuIHsqfSAgeyhcInNjYWxhclwiIHwgXCJtZXNzYWdlXCIgfCBcImVudW1cIiB8IFwibWFwXCIpfVxyXG4gKi9cclxuY29uc3QgZ2V0UHJvdG9CdWZTY2FsYXJUeXBlID0gZnVuY3Rpb24gKHQ6IFByb3RvQnVmU2NhbGFyVHlwZSk6IFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIiB7XHJcbiAgICBsZXQgdDEgPSBcIlwiIGFzIFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIjtcclxuICAgIHN3aXRjaCAodCkge1xyXG4gICAgICAgIGNhc2UgXCJkb3VibGVcIjpcclxuICAgICAgICBjYXNlIFwiZmxvYXRcIjpcclxuICAgICAgICBjYXNlIFwiaW50MzJcIjpcclxuICAgICAgICBjYXNlIFwiaW50NjRcIjpcclxuICAgICAgICBjYXNlIFwidWludDMyXCI6XHJcbiAgICAgICAgY2FzZSBcInVpbnQ2NFwiOlxyXG4gICAgICAgIGNhc2UgXCJzaW50MzJcIjpcclxuICAgICAgICBjYXNlIFwic2ludDY0XCI6XHJcbiAgICAgICAgY2FzZSBcImZpeGVkMzJcIjpcclxuICAgICAgICBjYXNlIFwiZml4ZWQ2NFwiOlxyXG4gICAgICAgIGNhc2UgXCJzZml4ZWQzMlwiOlxyXG4gICAgICAgIGNhc2UgXCJzZml4ZWQ2NFwiOlxyXG4gICAgICAgIGNhc2UgXCJib29sXCI6XHJcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICB0MSA9IFwic2NhbGFyXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJsaW1pdFwiOlxyXG4gICAgICAgIC8vIOmZkOWItuexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJieXRlc1wiOlxyXG4gICAgICAgIC8vIOWHveaVsOexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJmblwiOlxyXG4gICAgICAgIC8vIOadoeS7tuexu+Wei1xyXG4gICAgICAgIGNhc2UgXCJjb25kaXRpb25cIjpcclxuICAgICAgICAvLyDlhazlvI/nsbvlnotcclxuICAgICAgICBjYXNlIFwiZm9ybXVsYVwiOlxyXG4gICAgICAgICAgICB0MSA9IFwibWVzc2FnZVwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBjb25zdCBzdHIgPSB0IGFzIHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHN0ci5zdGFydHNXaXRoKEtleVdvcmRzLk9iamVjdCkpIHtcclxuICAgICAgICAgICAgICAgIHQxID0gXCJtZXNzYWdlXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyLmVuZHNXaXRoKFwiW11cIikpIHtcclxuICAgICAgICAgICAgICAgIHQxID0gZ2V0UHJvdG9CdWZTY2FsYXJUeXBlKHN0ci5yZXBsYWNlKFwiW11cIiwgXCJcIikgYXMgUHJvdG9CdWZTY2FsYXJUeXBlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHQxID0gXCJlbnVtXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDE7XHJcbn07XHJcblxyXG5jb25zdCBzY2FsYXJfbm9fcmVwZWF0ID0gKFxyXG4gICAgbm86IG51bWJlcixcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIGtpbmQ6IFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIixcclxuICAgIHR5cGU6IFByb3RvQnVmU2NhbGFyVHlwZSxcclxuKSA9PiBgeyBubzoke25vfSxuYW1lOlwiJHtuYW1lfVwiLGtpbmQ6XCIke2tpbmR9XCIsVDoke2dldFByb3RvQnVmVHlwZSh0eXBlKX19YDtcclxuY29uc3Qgc2NhbGFyX3JlcGVhdCA9IChcclxuICAgIG5vOiBudW1iZXIsXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICBraW5kOiBcInNjYWxhclwiIHwgXCJtZXNzYWdlXCIgfCBcImVudW1cIiB8IFwibWFwXCIsXHJcbiAgICB0eXBlOiBQcm90b0J1ZlNjYWxhclR5cGUsXHJcbikgPT4ge1xyXG4gICAgaWYgKHR5cGUuc3RhcnRzV2l0aChcInN0cmluZ1wiKSkge1xyXG4gICAgICAgIHJldHVybiBgeyBubzoke25vfSxuYW1lOlwiJHtuYW1lfVwiLGtpbmQ6XCIke2tpbmR9XCIscmVwZWF0OiR7UmVwZWF0VHlwZS5VTlBBQ0tFRFxyXG4gICAgICAgICAgICB9IC8qUmVwZWF0VHlwZS5VTlBBQ0tFRCovLFQ6JHtnZXRQcm90b0J1ZlR5cGUodHlwZSl9fWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBgeyBubzoke25vfSxuYW1lOlwiJHtuYW1lfVwiLGtpbmQ6XCIke2tpbmR9XCIscmVwZWF0OiR7UmVwZWF0VHlwZS5QQUNLRURcclxuICAgICAgICAgICAgfSAvKlJlcGVhdFR5cGUuUEFDS0VEKi8sVDoke2dldFByb3RvQnVmVHlwZSh0eXBlKX19YDtcclxuICAgIH1cclxufTtcclxuY29uc3Qgc2NhbGFyID0gKFxyXG4gICAgbm86IG51bWJlcixcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIGtpbmQ6IFwic2NhbGFyXCIgfCBcIm1lc3NhZ2VcIiB8IFwiZW51bVwiIHwgXCJtYXBcIixcclxuICAgIHJlcGVhdDogYm9vbGVhbixcclxuICAgIHR5cGU6IFByb3RvQnVmU2NhbGFyVHlwZSxcclxuKSA9PiAocmVwZWF0ID8gc2NhbGFyX3JlcGVhdChubywgbmFtZSwga2luZCwgdHlwZSkgOiBzY2FsYXJfbm9fcmVwZWF0KG5vLCBuYW1lLCBraW5kLCB0eXBlKSk7XHJcblxyXG5jb25zdCBlbnVtIFNjYWxhclR5cGUge1xyXG4gICAgRE9VQkxFID0gXCJET1VCTEVcIixcclxuICAgIEZMT0FUID0gXCJGTE9BVFwiLFxyXG4gICAgSU5UNjQgPSBcIklOVDY0XCIsXHJcbiAgICBVSU5UNjQgPSBcIlVJTlQ2NFwiLFxyXG4gICAgSU5UMzIgPSBcIklOVDMyXCIsXHJcbiAgICBGSVhFRDY0ID0gXCJGSVhFRDY0XCIsXHJcbiAgICBGSVhFRDMyID0gXCJGSVhFRDMyXCIsXHJcbiAgICBCT09MID0gXCJCT09MXCIsXHJcbiAgICBTVFJJTkcgPSBcIlNUUklOR1wiLFxyXG4gICAgQllURVMgPSBcIkJZVEVTXCIsXHJcbiAgICBVSU5UMzIgPSBcIlVJTlQzMlwiLFxyXG4gICAgU0ZJWEVEMzIgPSBcIlNGSVhFRDMyXCIsXHJcbiAgICBTRklYRUQ2NCA9IFwiU0ZJWEVENjRcIixcclxuICAgIFNJTlQzMiA9IFwiU0lOVDMyXCIsXHJcbiAgICBTSU5UNjQgPSBcIlNJTlQ2NFwiLFxyXG59XHJcblxyXG5jb25zdCBjaGFyVG9OdW0gPSBmdW5jdGlvbiAodmFsOiBzdHJpbmcpIHtcclxuICAgIGxldCBiYXNlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiO1xyXG4gICAgbGV0IGJhc2VOdW1iZXIgPSBiYXNlLmxlbmd0aDtcclxuXHJcbiAgICBsZXQgcnVubmluZ1RvdGFsID0gMDtcclxuICAgIGxldCBjaGFyYWN0ZXJJbmRleCA9IDA7XHJcbiAgICBsZXQgaW5kZXhFeHBvbmVudCA9IHZhbC5sZW5ndGggLSAxO1xyXG5cclxuICAgIHdoaWxlIChjaGFyYWN0ZXJJbmRleCA8IHZhbC5sZW5ndGgpIHtcclxuICAgICAgICBsZXQgZGlnaXQgPSB2YWxbY2hhcmFjdGVySW5kZXhdO1xyXG4gICAgICAgIGxldCBkaWdpdFZhbHVlID0gYmFzZS5pbmRleE9mKGRpZ2l0KSArIDE7XHJcbiAgICAgICAgcnVubmluZ1RvdGFsICs9IE1hdGgucG93KGJhc2VOdW1iZXIsIGluZGV4RXhwb25lbnQpICogZGlnaXRWYWx1ZTtcclxuXHJcbiAgICAgICAgY2hhcmFjdGVySW5kZXggKz0gMTtcclxuICAgICAgICBpbmRleEV4cG9uZW50IC09IDE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJ1bm5pbmdUb3RhbDtcclxufTtcclxuXHJcbmNvbnN0IG51bVRvQ2hhciA9IGZ1bmN0aW9uIChudW1iZXI6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBsZXQgbnVtZXJpYyA9IChudW1iZXIgLSAxKSAlIDI2O1xyXG4gICAgbGV0IGxldHRlciA9IGNocig2NSArIG51bWVyaWMpO1xyXG4gICAgLy9AdHMtaWdub3JlXHJcbiAgICBsZXQgbnVtYmVyMiA9IHBhcnNlSW50KChudW1iZXIgLSAxKSAvIDI2KTtcclxuICAgIGlmIChudW1iZXIyID4gMCkge1xyXG4gICAgICAgIHJldHVybiBudW1Ub0NoYXIobnVtYmVyMikgKyBsZXR0ZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBsZXR0ZXI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaHIgPSBmdW5jdGlvbiAoY29kZVB0OiBudW1iZXIpIHtcclxuICAgIGlmIChjb2RlUHQgPiAweGZmZmYpIHtcclxuICAgICAgICBjb2RlUHQgLT0gMHgxMDAwMDtcclxuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweGQ4MDAgKyAoY29kZVB0ID4+IDEwKSwgMHhkYzAwICsgKGNvZGVQdCAmIDB4M2ZmKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlUHQpO1xyXG59O1xyXG5cclxuY29uc3Qgc3RveCA9IGZ1bmN0aW9uIHN0b3god2I6IHhsc3guV29ya0Jvb2ssIGY6IHN0cmluZyk6IE1hcDxzdHJpbmcsIFBRV29ya0Jvb2s+IHwgbnVsbCB7XHJcbiAgICBsZXQgb3V0ID0gbmV3IE1hcDxzdHJpbmcsIFBRV29ya0Jvb2s+KCk7XHJcbiAgICBmb3IgKGxldCBuYW1lIGluIHdiLlNoZWV0cykge1xyXG4gICAgICAgIC8vIHNoZWV0IOWQjeensFxyXG4gICAgICAgIGNvbnN0IG8gPSB7IG5hbWU6IG5hbWUsIHJvd3M6IHt9LCBtZXJnZXM6IFtdLCB0eXBlczogW10gfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIC8vIG1lcmdlczogW1xyXG4gICAgICAgIC8vICAnQTE6RjExJyxcclxuICAgICAgICAvLyAgLi4uXHJcbiAgICAgICAgLy8gXSxcclxuXHJcbiAgICAgICAgLy8gc2hlZXQg5YaF5a65XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB3Yi5TaGVldHNbbmFtZV07XHJcbiAgICAgICAgY29uc3QgbWVyZ2VzID0gdmFsdWVbXCIhbWVyZ2VzXCJdO1xyXG5cclxuICAgICAgICBpZiAobWVyZ2VzKSB7XHJcbiAgICAgICAgICAgIG1lcmdlcy5mb3JFYWNoKG1lcmdlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzID0gbWVyZ2UucztcclxuICAgICAgICAgICAgICAgIGxldCBlID0gbWVyZ2UuZTtcclxuICAgICAgICAgICAgICAgIG8ubWVyZ2VzLnB1c2goYCR7bnVtVG9DaGFyKHMuYyArIDEpfSR7cy5yICsgMX06JHtudW1Ub0NoYXIoZS5jICsgMSl9JHtlLnIgKyAxfWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOivtOaYjuaYr+S4quepunNoZWV0XHJcbiAgICAgICAgaWYgKCF2YWx1ZVtcIiFyZWZcIl0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLlvILluLg66YWN572u5pyJ56m6c2hlZXRcIiwgZik7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcmVmID0gdmFsdWVbXCIhcmVmXCJdLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAvLyByZWYgdmFsdWUgbGlrZSBcIkEyOkwxMVwiXHJcblxyXG4gICAgICAgIC8vIOaPkOWPlnJvd1xyXG4gICAgICAgIGNvbnN0IG1heF9yb3cgPSByZWZbMV0ubWF0Y2goL1tBLVpdL2cpIS5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICAvLyDmj5Dlj5Zjb2xcclxuICAgICAgICBjb25zdCBtYXhfY29sID0gK3JlZlsxXS5tYXRjaCgvWzAtOV0vZ2kpIS5qb2luKFwiXCIpO1xyXG4gICAgICAgIGNvbnN0IG1heF9yb3dfdmFsdWUgPSBjaGFyVG9OdW0obWF4X3Jvdyk7XHJcblxyXG4gICAgICAgIC8vIOmcgOimgeeahGpzb27lv4XpobvlpJblsYLmmK9yb3dzLOWGheWxguaYr2NlbGxzXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEsIGwgPSBtYXhfY29sOyBpIDw9IGw7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2VsbHMgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAxLCBsZW4gPSBtYXhfcm93X3ZhbHVlOyBqIDw9IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQga2V5ID0gbnVtVG9DaGFyKGopICsgaTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGwgPSB2YWx1ZVtrZXldO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIOWFs+mUruaPj+i/sFxyXG4gICAgICAgICAgICAgICAgLy8gdiDljp/lp4vlgLzvvIjor6bop4HmlbDmja7nsbvlnovpg6jliIbvvIlcclxuICAgICAgICAgICAgICAgIC8vIHcg5qC85byP5YyW5paH5pys77yI5aaC6YCC55So77yJXHJcbiAgICAgICAgICAgICAgICAvLyB0IOexu+Wei++8mmLluIPlsJTlgLzvvIxl6ZSZ6K+v77yMbuaVsOWtl++8jGTml6XmnJ/vvIxz5paH5pys77yMeuWtmOaguVxyXG4gICAgICAgICAgICAgICAgLy8gZiDljZXlhYPmoLzlhazlvI/nvJbnoIHkuLpBMeagt+W8j+eahOWtl+espuS4su+8iOWmguaenOmAgueUqO+8iVxyXG4gICAgICAgICAgICAgICAgLy8gRiDlpoLmnpzlhazlvI/mmK/mlbDnu4TlhazlvI/vvIzliJnljIXlm7TmlbDnu4TnmoTojIPlm7TvvIjlpoLmnpzpgILnlKjvvIlcclxuICAgICAgICAgICAgICAgIC8vIHIg5a+M5paH5pys57yW56CBKOWmguaenOmAgueUqClcclxuICAgICAgICAgICAgICAgIC8vIGgg5Liw5a+M5paH5pys55qESFRNTOa4suafk++8iOWmgumAgueUqO+8iVxyXG4gICAgICAgICAgICAgICAgLy8gYyDkuI7or6XnlLXmsaDmnInlhbPnmoTor4TorrpcclxuICAgICAgICAgICAgICAgIC8vIHog5LiO5Y2V5YWD5qC855u45YWz6IGU55qE5pWw5a2X5qC85byP5a2X56ym5Liy77yI5aaC5p6c6KaB5rGC77yJXHJcbiAgICAgICAgICAgICAgICAvLyBsIOWNleWFg+agvOi2hemTvuaOpeWvueixoe+8iC5UYXJnZXTkuLrpk77mjqXvvIwuVG9vbHRpcOS4uuW3peWFt+aPkOekuu+8iVxyXG4gICAgICAgICAgICAgICAgLy8gcyDmmK/ljZXlhYPmoLznmoTpo47moLwv5Li76aKY77yI5aaC5p6c6YCC55So77yJXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsc1tqIC0gMV0gPSB7IHRleHQ6IGNlbGwudiB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG8ucm93c1tpIC0gMV0gPSB7IGNlbGxzOiBjZWxscyB9O1xyXG5cclxuICAgICAgICAgICAgLy8g57Si5byVSUTkuLo055qE5Luj6KGo57G75Z6LXHJcbiAgICAgICAgICAgIGlmIChpIC0gMSA9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyDntKLlvJVJROS4ujPnmoTku6PooajlsZ7mgKflkI3np7BcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZuID0gby5yb3dzWzNdLmNlbGxzO1xyXG4gICAgICAgICAgICAgICAgLy8g57Si5byVSUTkuLo055qE5Luj6KGo5bGe5oCn57G75Z6LXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2dCA9IG8ucm93c1s0XS5jZWxscztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGsgaW4gdnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoK2sgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvLnR5cGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5keDogayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHZuW2tdLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB2dFtrXS50ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3V0LnNldChuYW1lLCBvKTtcclxuICAgIH1cclxuICAgIHJldHVybiBvdXQhO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0VmFsdWUgPSAodDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAodC5zdGFydHNXaXRoKFwib2JqZWN0XCIpIHx8IHQuc3RhcnRzV2l0aChcImVudW1cIikpIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gdmFsdWVPZlBhdHRlcm4odCk7XHJcbiAgICAgICAgaWYgKCFuYW1lIHx8IG5hbWUhLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5a+56LGh6KGo6L6+5byP6ZSZ6K+vXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZSFbMF07XHJcbiAgICB9XHJcbn07XHJcblxyXG5jbGFzcyBSZWFkRXhjZWxUeXBlIHtcclxuICAgIHB1YmxpYyByZTogUmVhZEV4Y2VsO1xyXG4gICAgcHVibGljIG1haW46IFBRV29ya0Jvb2s7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiJDlkZjms6jph4pcclxuICAgICAqXHJcbiAgICAgKiBAdHlwZSB7KChzdHJpbmcgfCBudW1iZXIpW10pfVxyXG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFR5cGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGRvY3MhOiAoc3RyaW5nIHwgbnVtYmVyKVtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5oiQ5ZGY57G75Z6LXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGUgeygoc3RyaW5nIHwgbnVtYmVyKVtdKX1cclxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxUeXBlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0eXBlcyE6IChzdHJpbmcgfCBudW1iZXIpW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiJDlkZjlkI3np7BcclxuICAgICAqXHJcbiAgICAgKiBAdHlwZSB7KChzdHJpbmcgfCBudW1iZXIpW10pfVxyXG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFR5cGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5hbWVzITogKHN0cmluZyB8IG51bWJlcilbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJk+WMheino+WMheexu+Wei+S/oeaBr1xyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHsoKHN0cmluZyB8IG51bWJlcilbXSl9XHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsVHlwZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGFja3MhOiAoc3RyaW5nIHwgbnVtYmVyKVtdO1xyXG5cclxuICAgIHB1YmxpYyBtb2QhOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6Kej5p6Q5aW955qE5a+56LGhL+aemuS4vuexu+Wei1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2U6IE1hcDxzdHJpbmcsIFJlYWRFeGNlbD47XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHJlOiBSZWFkRXhjZWwsIG1haW46IFBRV29ya0Jvb2spIHtcclxuICAgICAgICB0aGlzLnJlID0gcmU7XHJcbiAgICAgICAgdGhpcy5tYWluID0gbWFpbjtcclxuICAgICAgICB0aGlzLm9lID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubW9kID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubWFrZVR5cGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWFrZVR5cGUoKSB7XHJcbiAgICAgICAgY29uc3Qgd2IgPSB0aGlzLm1haW47XHJcbiAgICAgICAgY29uc3QgZG9jcyA9IHdiLnJvd3NbMV0uY2VsbHM7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSB3Yi5yb3dzWzNdLmNlbGxzO1xyXG4gICAgICAgIGNvbnN0IHR5cGVzID0gd2Iucm93c1s0XS5jZWxscztcclxuICAgICAgICBjb25zdCBwYWNrcyA9IHdiLnJvd3NbNV0uY2VsbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IGRvY3NfdGV4dHM6IChzdHJpbmcgfCBudW1iZXIpW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZG9jcykge1xyXG4gICAgICAgICAgICBkb2NzX3RleHRzLnB1c2goZG9jc1trZXldLnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmFtZV90ZXh0czogKHN0cmluZyB8IG51bWJlcilbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBuYW1lcykge1xyXG4gICAgICAgICAgICBuYW1lX3RleHRzLnB1c2gobmFtZXNba2V5XS50ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHR5cGVfdGV4dHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdHlwZXMpIHtcclxuICAgICAgICAgICAgdHlwZV90ZXh0cy5wdXNoKHR5cGVzW2tleV0udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYWNrX3RleHRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBhY2tzKSB7XHJcbiAgICAgICAgICAgIHBhY2tfdGV4dHMucHVzaChwYWNrc1trZXldLnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kb2NzID0gZG9jc190ZXh0cztcclxuICAgICAgICB0aGlzLnR5cGVzID0gdHlwZV90ZXh0cztcclxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZV90ZXh0cztcclxuICAgICAgICB0aGlzLnBhY2tzID0gcGFja190ZXh0cztcclxuXHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnBhY2tzWzBdKSB7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0tWOlxyXG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wYWNrcy5pbmRleE9mKEtleVdvcmRzLklET0JKKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpIGluIHdiLnJvd3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCtpIDw9IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gd2Iucm93c1tpXS5jZWxscztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgayA9IGNlbGxzWzFdLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZC5zZXQoayBhcyBzdHJpbmcsIGdlbmVyYXRvclByb3RvSUQoayBhcyBzdHJpbmcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhcnNlKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxLCBsID0gdGhpcy50eXBlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMudHlwZXNbaV0gYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZ2V0VmFsdWUodCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VPYmplY3QobmFtZSEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFyc2VPYmplY3QobmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNoZWV0ID0gdGhpcy5yZS53YnMuZ2V0KG5hbWUpITtcclxuICAgICAgICBpZiAoIXNoZWV0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5a+56LGh6KGo6L6+5byP6ZSZ6K+vXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZSA9IG5ldyBTdWJSZWFkRXhjZWwobmFtZSwgc2hlZXQsIHRoaXMpO1xyXG4gICAgICAgIHJlLnBhcnNlKCk7XHJcbiAgICAgICAgdGhpcy5vZS5zZXQobmFtZSwgcmUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSZWFkRXhjZWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBleGNlbOaWh+S7tuS9jee9rlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAdHlwZSB7RmlsZX1cclxuICAgICAqIEBtZW1iZXJvZiBSZWFkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3VybCE6IEZpbGU7XHJcbiAgICBwcml2YXRlIF9vdXQhOiBGaWxlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZXhjZWzmlbDmja7op6PmnoRcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGUge3hsc3guV29ya0Jvb2t9XHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF93cyE6IHhsc3guV29ya0Jvb2s7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDlh7rmnaXnmoRqc29u5pWw5o2u6Kej5p6EXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlIHtQUVdvcmtCb29rW119XHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWFpbiE6IFBRV29ya0Jvb2s7XHJcbiAgICBwdWJsaWMgd2JzITogTWFwPHN0cmluZywgUFFXb3JrQm9vaz47XHJcblxyXG4gICAgcHVibGljIHNscyE6IE1hcDxzdHJpbmcsIFJlYWRFeGNlbD47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBleGNlbCDlr7nlupTnmoTmjqXlj6PlkI1cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBtZW1iZXJvZiBSZWFkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbnRlcmZhY2VOYW1lITogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6aG555uuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlIHtQcm9qZWN0fVxyXG4gICAgICogQG1lbWJlcm9mIFJlYWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHByb2plY3QhOiBQcm9qZWN0O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog57G75Z6L6Kej5YyF5ZmoXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGUge1JlYWRFeGNlbFR5cGV9XHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0eXBlcyE6IFJlYWRFeGNlbFR5cGU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmupDmlofku7ZcclxuICAgICAqXHJcbiAgICAgKiBAdHlwZSB7U291cmNlRmlsZX1cclxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNmITogU291cmNlRmlsZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJk+WMheWQjueahOaVsOaNrihib2R5KVxyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtVaW50OEFycmF5fVxyXG4gICAgICogQG1lbWJlcm9mIFJlYWRFeGNlbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnVmZmVyITogVWludDhBcnJheTtcclxuXHJcbiAgICBwdWJsaWMgZmlsZU5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGt2S2V5VHlwZSE6IHN0cmluZztcclxuICAgIHB1YmxpYyBrdktleSE6IHN0cmluZztcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IodXJsPzogRmlsZSwgcD86IFByb2plY3QsIG91dD86IEZpbGUpIHtcclxuICAgICAgICBpZiAodXJsID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByb2plY3QgPSBwITtcclxuICAgICAgICB0aGlzLl9vdXQgPSBvdXQhO1xyXG4gICAgICAgIHRoaXMuX3VybCA9IHVybDtcclxuICAgICAgICB0aGlzLnNscyA9IG5ldyBNYXA8c3RyaW5nLCBSZWFkRXhjZWw+KCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmZhY2VOYW1lID0gZmlyc3RVcHBlckNhc2UodXJsLnVuRXh0TmFtZSk7XHJcbiAgICAgICAgdGhpcy5hZGRSZWFkRXhjZWwoXCJtYWluXCIsIHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRSZWFkRXhjZWwobmFtZTogc3RyaW5nLCByZWFkOiBSZWFkRXhjZWwpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNscy5zZXQobmFtZSwgcmVhZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlYWQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fd3MgPSB4bHN4LnJlYWRGaWxlKHRoaXMuX3VybC5uYXRpdmVQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFyc2UoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy53YnMgPSBzdG94KHRoaXMuX3dzLCB0aGlzLl91cmwubmFtZSkhO1xyXG5cclxuICAgICAgICB0aGlzLmZpbGVOYW1lID0gbmFtZUpvaW4odGhpcy5fdXJsLnVuRXh0TmFtZSk7XHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYCR7dGhpcy5fb3V0Lm5hdGl2ZVBhdGh9LyR7dGhpcy5maWxlTmFtZX0udHNgKSkge1xyXG4gICAgICAgICAgICB1bmxpbmtTeW5jKGAke3RoaXMuX291dC5uYXRpdmVQYXRofS8ke3RoaXMuZmlsZU5hbWV9LnRzYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZiA9IHRoaXMucHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKGAke3RoaXMuX291dC5uYXRpdmVQYXRofS8ke3RoaXMuZmlsZU5hbWV9LnRzYCwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5zZiA9IHNmO1xyXG5cclxuICAgICAgICB0aGlzLm1haW4gPSB0aGlzLndicy5nZXQoXCJtYWluXCIpITtcclxuICAgICAgICB0aGlzLnR5cGVzID0gbmV3IFJlYWRFeGNlbFR5cGUodGhpcywgdGhpcy5tYWluKTtcclxuICAgICAgICB0aGlzLnR5cGVzLnBhcnNlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlSW50ZXJmYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdsb2JhbCh3OiBDb2RlQmxvY2tXcml0ZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzZiA9IHRoaXMuc2Y7XHJcbiAgICAgICAgLy8g55u05o6l5om+MSwz5ZKMNFxyXG4gICAgICAgIC8vIDHmmK/lj5jph4/nn63ms6jph4pcclxuICAgICAgICAvLyAz5piv5Y+Y6YeP5ZCN56ewXHJcbiAgICAgICAgLy8gNOaYr+WPmOmHj+exu+Wei1xyXG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xyXG4gICAgICAgIGNvbnN0IHBhY2tlciA9IHdiLnJvd3NbNV0uY2VsbHM7XHJcbiAgICAgICAgLy8g55yL55yL57G75Z6LXHJcbiAgICAgICAgc3dpdGNoIChwYWNrZXJbMF0udGV4dCkge1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9MSVNUOlxyXG4gICAgICAgICAgICAgICAgdy53cml0ZSh0aGlzLmludGVyZmFjZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShcIjpcIik7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKGZpcnN0VXBwZXJDYXNlKHRoaXMuaW50ZXJmYWNlTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShcIltdXCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX01BUDpcclxuICAgICAgICAgICAgICAgIHcud3JpdGUodGhpcy5pbnRlcmZhY2VOYW1lKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShgUmVjb3JkPCR7dGhpcy5rdktleVR5cGV9LGApO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShmaXJzdFVwcGVyQ2FzZSh0aGlzLmludGVyZmFjZU5hbWUpKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoXCI+XCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0VOVU06XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfS1Y6XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKHRoaXMuaW50ZXJmYWNlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKFwiOlwiKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoZmlyc3RVcHBlckNhc2UodGhpcy5pbnRlcmZhY2VOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6Zmk5LiA57u05omT5YyF5pa55byP5aSWLOaaguS4jeaUr+aMgeWFtuS7luaJk+WMheaWueW8j1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUludGVyZmFjZSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzZiA9IHRoaXMuc2Y7XHJcbiAgICAgICAgLy8g55u05o6l5om+MSwz5ZKMNFxyXG4gICAgICAgIC8vIDHmmK/lj5jph4/nn63ms6jph4pcclxuICAgICAgICAvLyAz5piv5Y+Y6YeP5ZCN56ewXHJcbiAgICAgICAgLy8gNOaYr+WPmOmHj+exu+Wei1xyXG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xyXG4gICAgICAgIGNvbnN0IHBhY2tlciA9IHdiLnJvd3NbNV0uY2VsbHM7XHJcbiAgICAgICAgLy8g55yL55yL57G75Z6LXHJcbiAgICAgICAgc3dpdGNoIChwYWNrZXJbMF0udGV4dCkge1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9MSVNUOlxyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9NQVA6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxNKHNmKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9FTlVNOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVFbnVtKHNmKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9LVjpcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlS1Yoc2YpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDbGllbnRLVihzZik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6Zmk5LiA57u05omT5YyF5pa55byP5aSWLOaaguS4jeaUr+aMgeWFtuS7luaJk+WMheaWueW8j1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNsaWVudEtWKHNmOiBTb3VyY2VGaWxlKSB7XHJcbiAgICAgICAgY29uc3QgcGFja3MgPSB0aGlzLnR5cGVzLnBhY2tzO1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy50eXBlcy5uYW1lcztcclxuXHJcbiAgICAgICAgY29uc3QgaGFzT2JqID0gcGFja3MuaW5kZXhPZihLZXlXb3Jkcy5JRE9CSik7XHJcbiAgICAgICAgY29uc3QgaXNLZXkgPSBwYWNrcy5pbmRleE9mKEtleVdvcmRzLklES0VZKTtcclxuICAgICAgICBjb25zdCBpc05hbWUgPSBuYW1lcy5pbmRleE9mKEtleVdvcmRzLk5BTUUpO1xyXG4gICAgICAgIGNvbnN0IGlzVHlwZSA9IHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURUWVBFKTtcclxuXHJcbiAgICAgICAgaWYgKGhhc09iaiA8IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJLVuexu+Wei+W+l+mFjeihqOW/hemhu+aciUlET0JK6aG5XCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcclxuICAgICAgICBsZXQgY2hpbGRfbmFtZSA9IHRoaXMuaW50ZXJmYWNlTmFtZSArIFwiX3ZhbHVlXCI7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVMTShzZiwgY2hpbGRfbmFtZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGxldCBwaWQ6IHN0cmluZztcclxuICAgICAgICBsZXQgbjogc3RyaW5nO1xyXG4gICAgICAgIGxldCBsYXN0OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGlkOiBJbnRlcmZhY2VEZWNsYXJhdGlvbjtcclxuICAgICAgICBsZXQgY3RvcjogQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcclxuICAgICAgICBsZXQgdzogQ29kZUJsb2NrV3JpdGVyO1xyXG4gICAgICAgIGxldCBubzogbnVtYmVyID0gMTtcclxuXHJcbiAgICAgICAgbGV0IHdyaXRlQm9keSA9IChjOiAoKSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh3ISAmJiB3IS50b1N0cmluZygpICYmIGN0b3IhKSB7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNsb3NlQnJhY2tldFRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VQYXJlblRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuU2VtaWNvbG9uVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgY3RvciEuc2V0Qm9keVRleHQodyEudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgYygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNyZWF0ZUN0b3IgPSAobmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHcgPSB0aGlzLnByb2plY3QuY3JlYXRlV3JpdGVyKCk7XHJcbiAgICAgICAgICAgIGlkID0gc2YuYWRkSW50ZXJmYWNlKHsgbmFtZTogZmlyc3RVcHBlckNhc2UobmFtZSksIGlzRXhwb3J0ZWQ6IHRydWUgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHdyaXRlU3VwZXJDYWxsID0gKG5hbWU6IHN0cmluZywgcHJvdG86IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5TdXBlcik7XHJcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLk9wZW5QYXJlblRva2VuKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoYCR7cHJvdG99YCk7XHJcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xyXG4gICAgICAgICAgICB3IS53cml0ZShgXCIke2ZpcnN0VXBwZXJDYXNlKG5hbWUpfVwiYCk7XHJcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xyXG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5PcGVuQnJhY2tldFRva2VuKTtcclxuICAgICAgICAgICAgdyEubmV3TGluZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB3cml0ZVJlZ2lzdGVyID0gKG5hbWU6IHN0cmluZywgcHJvdG86IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBzZi5hZGRWYXJpYWJsZVN0YXRlbWVudCh7XHJcbiAgICAgICAgICAgICAgICBpc0V4cG9ydGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb25LaW5kOiBWYXJpYWJsZURlY2xhcmF0aW9uS2luZC5Db25zdCxcclxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVyOiBgbmV3ICR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9JFR5cGUoKWAsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0gYXMgVmFyaWFibGVTdGF0ZW1lbnRTdHJ1Y3R1cmUpO1xyXG5cclxuICAgICAgICAgICAgc2YuYWRkU3RhdGVtZW50cyh3ID0+IHtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuUmVnaXN0ZXIpO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5PcGVuUGFyZW5Ub2tlbik7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKGAnJHtwcm90byB8fCB0aGlzLmdldFByb3RvSUQoKX0nYCk7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShgbmV3ICR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9JFR5cGUoKWApO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5DbG9zZVBhcmVuVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5TZW1pY29sb25Ub2tlbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgaW4gd2Iucm93cykge1xyXG4gICAgICAgICAgICBpZiAoK2kgPD0gNSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2VsbHMgPSB3Yi5yb3dzW2ldLmNlbGxzO1xyXG4gICAgICAgICAgICBsZXQgaWZjID0gY2VsbHNbaGFzT2JqXSAmJiAoY2VsbHNbaGFzT2JqXS50ZXh0IGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaWZjKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0ID0gbiE7XHJcbiAgICAgICAgICAgICAgICBuID0gXCJJXCIgKyBpZmM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlmYykge1xyXG4gICAgICAgICAgICAgICAgbGFzdCA9IG4hO1xyXG4gICAgICAgICAgICAgICAgbiA9IFwiSVwiICsgdGhpcy5pbnRlcmZhY2VOYW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgc3RhcnRcclxuICAgICAgICAgICAgaWQgPSBzZi5nZXRJbnRlcmZhY2UoZmlyc3RVcHBlckNhc2UobiEpKSE7XHJcbiAgICAgICAgICAgIGlmICghaWQpIHtcclxuICAgICAgICAgICAgICAgIHBpZCA9IHRoaXMudHlwZXMubW9kLmdldChuISkhO1xyXG4gICAgICAgICAgICAgICAgd3JpdGVCb2R5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZVJlZ2lzdGVyKGZpcnN0VXBwZXJDYXNlKGxhc3QhKSwgdGhpcy50eXBlcy5tb2QuZ2V0KGxhc3QhKSEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVDdG9yKGZpcnN0VXBwZXJDYXNlKG4hKSk7XHJcbiAgICAgICAgICAgICAgICBubyA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWFiOWIm+W7uuWxnuaAp1xyXG4gICAgICAgICAgICAvLyDlsZ7mgKfpm4blkIhcclxuICAgICAgICAgICAgaWQhLmFkZFByb3BlcnR5KHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGNlbGxzW2lzS2V5XS50ZXh0IGFzIHN0cmluZyxcclxuXHJcbiAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZSgoaXNUeXBlICYmIChjZWxsc1tpc1R5cGVdLnRleHQgYXMgc3RyaW5nKSkgfHwgY2hpbGRfbmFtZSkgfHwgY2hpbGRfbmFtZSxcclxuICAgICAgICAgICAgICAgIGhhc1F1ZXN0aW9uVG9rZW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkb2NzOiBbY2VsbHNbaXNOYW1lXSAmJiAoY2VsbHNbaXNOYW1lXS50ZXh0IGFzIHN0cmluZyldLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5vKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByb2plY3QuZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKGYgPT4gZi5mb3JtYXRUZXh0KCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu6S1ZcclxuICAgICAqXHJcbiAgICAgKiBAcHJvdGVjdGVkXHJcbiAgICAgKiBAcGFyYW0ge1NvdXJjZUZpbGV9IHNmXHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVLVihzZjogU291cmNlRmlsZSkge1xyXG4gICAgICAgIGNvbnN0IHBhY2tzID0gdGhpcy50eXBlcy5wYWNrcztcclxuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMudHlwZXMubmFtZXM7XHJcblxyXG4gICAgICAgIGNvbnN0IGhhc09iaiA9IHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURPQkopO1xyXG4gICAgICAgIGNvbnN0IGlzS2V5ID0gcGFja3MuaW5kZXhPZihLZXlXb3Jkcy5JREtFWSk7XHJcbiAgICAgICAgY29uc3QgaXNOYW1lID0gbmFtZXMuaW5kZXhPZihLZXlXb3Jkcy5OQU1FKTtcclxuXHJcbiAgICAgICAgaWYgKGhhc09iaiA8IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJLVuexu+Wei+W+l+mFjeihqOW/hemhu+aciUlET0JK6aG5XCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcclxuICAgICAgICBsZXQgY2hpbGRfbmFtZSA9IHRoaXMuaW50ZXJmYWNlTmFtZSArIFwiX3ZhbHVlXCI7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVMTShzZiwgY2hpbGRfbmFtZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGxldCBwaWQ6IHN0cmluZztcclxuICAgICAgICBsZXQgbjogc3RyaW5nO1xyXG4gICAgICAgIGxldCBsYXN0OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGlkOiBJbnRlcmZhY2VEZWNsYXJhdGlvbjtcclxuICAgICAgICBsZXQgY3RvcjogQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcclxuICAgICAgICBsZXQgdzogQ29kZUJsb2NrV3JpdGVyO1xyXG4gICAgICAgIGxldCBubzogbnVtYmVyID0gMTtcclxuXHJcbiAgICAgICAgbGV0IHdyaXRlQm9keSA9IChjOiAoKSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh3ISAmJiB3IS50b1N0cmluZygpICYmIGN0b3IhKSB7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLkNsb3NlQnJhY2tldFRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VQYXJlblRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuU2VtaWNvbG9uVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgY3RvciEuc2V0Qm9keVRleHQodyEudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgYygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNyZWF0ZUN0b3IgPSAobmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWIm+W7uuaehOmAoOWHveaVsFxyXG4gICAgICAgICAgICBjb25zdCBjdCA9IHNmLmFkZENsYXNzKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGAke2ZpcnN0VXBwZXJDYXNlKG5hbWUpfSRUeXBlYCxcclxuICAgICAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBgTWVzc2FnZVR5cGU8JHtmaXJzdFVwcGVyQ2FzZShuYW1lKX0+YCxcclxuICAgICAgICAgICAgfSBhcyBDbGFzc0RlY2xhcmF0aW9uU3RydWN0dXJlKTtcclxuICAgICAgICAgICAgY3RvciA9IGN0LmFkZENvbnN0cnVjdG9yKHt9KTtcclxuICAgICAgICAgICAgdyA9IHRoaXMucHJvamVjdC5jcmVhdGVXcml0ZXIoKTtcclxuICAgICAgICAgICAgaWQgPSBzZi5hZGRJbnRlcmZhY2UoeyBuYW1lOiBmaXJzdFVwcGVyQ2FzZShuYW1lKSwgaXNFeHBvcnRlZDogdHJ1ZSB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgd3JpdGVTdXBlckNhbGwgPSAobmFtZTogc3RyaW5nLCBwcm90bzogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHchLndyaXRlKEtleVdvcmRzLlN1cGVyKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuT3BlblBhcmVuVG9rZW4pO1xyXG4gICAgICAgICAgICB3IS53cml0ZShgJyR7cHJvdG99J2ApO1xyXG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoYFwiJHtmaXJzdFVwcGVyQ2FzZShuYW1lKX1cImApO1xyXG4gICAgICAgICAgICB3IS53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuT3BlbkJyYWNrZXRUb2tlbik7XHJcbiAgICAgICAgICAgIHchLm5ld0xpbmUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgd3JpdGVSZWdpc3RlciA9IChuYW1lOiBzdHJpbmcsIHByb3RvOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgc2YuYWRkVmFyaWFibGVTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgICAgaXNFeHBvcnRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uS2luZDogVmFyaWFibGVEZWNsYXJhdGlvbktpbmQuQ29uc3QsXHJcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplcjogYG5ldyAke25hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lfSRUeXBlKClgLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9IGFzIFZhcmlhYmxlU3RhdGVtZW50U3RydWN0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHNmLmFkZFN0YXRlbWVudHModyA9PiB7XHJcbiAgICAgICAgICAgICAgICB3LndyaXRlKEtleVdvcmRzLlJlZ2lzdGVyKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuT3BlblBhcmVuVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShgJyR7cHJvdG8gfHwgdGhpcy5nZXRQcm90b0lEKCl9J2ApO1xyXG4gICAgICAgICAgICAgICAgdy53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoYG5ldyAke25hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lfSRUeXBlKClgKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuQ2xvc2VQYXJlblRva2VuKTtcclxuICAgICAgICAgICAgICAgIHcud3JpdGUoS2V5V29yZHMuU2VtaWNvbG9uVG9rZW4pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpIGluIHdiLnJvd3MpIHtcclxuICAgICAgICAgICAgaWYgKCtpIDw9IDUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gd2Iucm93c1tpXS5jZWxscztcclxuICAgICAgICAgICAgbGV0IGlmYyA9IGNlbGxzW2hhc09ial0gJiYgKGNlbGxzW2hhc09ial0udGV4dCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlmYykge1xyXG4gICAgICAgICAgICAgICAgbGFzdCA9IG4hO1xyXG4gICAgICAgICAgICAgICAgbiA9IGlmYztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaWZjKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0ID0gbiE7XHJcbiAgICAgICAgICAgICAgICBuID0gdGhpcy5pbnRlcmZhY2VOYW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgc3RhcnRcclxuICAgICAgICAgICAgaWQgPSBzZi5nZXRJbnRlcmZhY2UoZmlyc3RVcHBlckNhc2UobiEpKSE7XHJcbiAgICAgICAgICAgIGlmICghaWQpIHtcclxuICAgICAgICAgICAgICAgIHBpZCA9IHRoaXMudHlwZXMubW9kLmdldChuISkhO1xyXG4gICAgICAgICAgICAgICAgd3JpdGVCb2R5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZVJlZ2lzdGVyKGZpcnN0VXBwZXJDYXNlKGxhc3QhKSwgdGhpcy50eXBlcy5tb2QuZ2V0KGxhc3QhKSEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVDdG9yKGZpcnN0VXBwZXJDYXNlKG4hKSk7XHJcbiAgICAgICAgICAgICAgICB3cml0ZVN1cGVyQ2FsbChmaXJzdFVwcGVyQ2FzZShuISksIHBpZCk7XHJcbiAgICAgICAgICAgICAgICBubyA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWFiOWIm+W7uuWxnuaAp1xyXG4gICAgICAgICAgICAvLyDlsZ7mgKfpm4blkIhcclxuICAgICAgICAgICAgaWQhLmFkZFByb3BlcnR5KHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGNlbGxzW2lzS2V5XS50ZXh0IGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkX25hbWUsXHJcbiAgICAgICAgICAgICAgICBoYXNRdWVzdGlvblRva2VuOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZG9jczogW2NlbGxzW2lzTmFtZV0gJiYgKGNlbGxzW2lzTmFtZV0udGV4dCBhcyBzdHJpbmcpXSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyDliJvlu7rljp/lp4vlr7nosaEgZW5kXHJcblxyXG4gICAgICAgICAgICAvLyDliJvlu7rlrqLmiLfnq6/kvKDovpPljY/orq7lr7nosaEgZW5kXHJcblxyXG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAgICAgdyEud3JpdGUoc2NhbGFyKG5vLCBjZWxsc1tpc0tleV0udGV4dCBhcyBzdHJpbmcsIFwibWVzc2FnZVwiLCBmYWxzZSwgYG9iamVjdCgke2NoaWxkX25hbWV9KWApKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XHJcbiAgICAgICAgICAgIHchLm5ld0xpbmUoKTtcclxuXHJcbiAgICAgICAgICAgIG5vKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3cml0ZUJvZHkoKCkgPT4ge1xyXG4gICAgICAgICAgICB3cml0ZVJlZ2lzdGVyKGZpcnN0VXBwZXJDYXNlKG4hKSwgcGlkKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8g5Yib5bu66KGoXHJcbiAgICAgICAgbm8gPSAxO1xyXG4gICAgICAgIGNyZWF0ZUN0b3IodGhpcy5pbnRlcmZhY2VOYW1lKTtcclxuICAgICAgICB3cml0ZVN1cGVyQ2FsbChmaXJzdFVwcGVyQ2FzZSh0aGlzLmludGVyZmFjZU5hbWUhKSwgdGhpcy5nZXRQcm90b0lEKCkpO1xyXG4gICAgICAgIHRoaXMudHlwZXMubW9kLmZvckVhY2goKHYsIGspID0+IHtcclxuICAgICAgICAgICAgaWQuYWRkUHJvcGVydHkoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogayEsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBmaXJzdFVwcGVyQ2FzZShrISksXHJcbiAgICAgICAgICAgICAgICBoYXNRdWVzdGlvblRva2VuOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50eXBlcy5tb2QuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAgICAgdyEud3JpdGUoc2NhbGFyKG5vLCBrIGFzIHN0cmluZywgXCJtZXNzYWdlXCIsIGZhbHNlLCBgb2JqZWN0KCR7ayF9KWApKTtcclxuICAgICAgICAgICAgdyEud3JpdGUoS2V5V29yZHMuQ29tbWFUb2tlbik7XHJcbiAgICAgICAgICAgIHchLm5ld0xpbmUoKTtcclxuICAgICAgICAgICAgbm8rKztcclxuICAgICAgICB9KTtcclxuICAgICAgICB3cml0ZUJvZHkoKCkgPT4ge1xyXG4gICAgICAgICAgICB3cml0ZVJlZ2lzdGVyKGZpcnN0VXBwZXJDYXNlKHRoaXMuaW50ZXJmYWNlTmFtZSEpLCB0aGlzLmdldFByb3RvSUQoKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucHJvamVjdC5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goZiA9PiBmLmZvcm1hdFRleHQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmnprkuL5cclxuICAgICAqXHJcbiAgICAgKiBAcHJvdGVjdGVkXHJcbiAgICAgKiBAcGFyYW0ge1NvdXJjZUZpbGV9IHNmXHJcbiAgICAgKiBAbWVtYmVyb2YgUmVhZEV4Y2VsXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVFbnVtKHNmOiBTb3VyY2VGaWxlKSB7XHJcbiAgICAgICAgY29uc3QgZG9jc190ZXh0cyA9IHRoaXMudHlwZXMuZG9jcztcclxuICAgICAgICBjb25zdCBuYW1lX3RleHRzID0gdGhpcy50eXBlcy5uYW1lcztcclxuICAgICAgICBjb25zdCB0eXBlX3RleHRzID0gdGhpcy50eXBlcy50eXBlcztcclxuICAgICAgICBjb25zdCBwYWNrX3RleHRzID0gdGhpcy50eXBlcy5wYWNrcztcclxuXHJcbiAgICAgICAgY29uc3QgaGFzID0gc2YuZ2V0RW51bSh0aGlzLmludGVyZmFjZU5hbWUpO1xyXG4gICAgICAgIGlmIChoYXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZW51ID0gc2YuYWRkRW51bSh7XHJcbiAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMuaW50ZXJmYWNlTmFtZSxcclxuICAgICAgICB9IGFzIEVudW1EZWNsYXJhdGlvblN0cnVjdHVyZSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxLCBsID0gbmFtZV90ZXh0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbiA9IG5hbWVfdGV4dHNbaV0gYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICBjb25zdCB0ID0gdHlwZV90ZXh0c1tpXSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHQgPT0gXCJzdHJpbmdcIiA/IGBcIiR7cGFja190ZXh0c1tpXX1cImAgOiBwYWNrX3RleHRzW2ldO1xyXG4gICAgICAgICAgICBlbnUuYWRkTWVtYmVyKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG4sXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBkb2NzOiBbeyBkZXNjcmlwdGlvbjogYCR7ZG9jc190ZXh0c1tpXX1gIH1dLFxyXG4gICAgICAgICAgICB9IGFzIEVudW1NZW1iZXJTdHJ1Y3R1cmUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7umludGVyZmFjZVxyXG4gICAgICpcclxuICAgICAqIEBwcm90ZWN0ZWRcclxuICAgICAqIEBwYXJhbSB7U291cmNlRmlsZX0gc2ZcclxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxNKHNmOiBTb3VyY2VGaWxlLCBuYW1lPzogc3RyaW5nLCBmaWx0ZXI6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIOebtOaOpeaJvjEsM+WSjDRcclxuICAgICAgICAvLyAx5piv5Y+Y6YeP55+t5rOo6YeKXHJcbiAgICAgICAgLy8gM+aYr+WPmOmHj+WQjeensFxyXG4gICAgICAgIC8vIDTmmK/lj5jph4/nsbvlnotcclxuICAgICAgICBjb25zdCB3YiA9IHRoaXMubWFpbjtcclxuXHJcbiAgICAgICAgY29uc3QgZG9jcyA9IHRoaXMudHlwZXMuZG9jcztcclxuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMudHlwZXMubmFtZXM7XHJcbiAgICAgICAgY29uc3QgdHlwZXMgPSB0aGlzLnR5cGVzLnR5cGVzO1xyXG4gICAgICAgIGNvbnN0IHBhY2tzID0gdGhpcy50eXBlcy5wYWNrcztcclxuXHJcbiAgICAgICAgLy8g5YWI5Yib5bu65bGe5oCnXHJcbiAgICAgICAgLy8g5bGe5oCn6ZuG5ZCIXHJcbiAgICAgICAgY29uc3QgbWVtYmVyczogUHJvcGVydHlTaWduYXR1cmVTdHJ1Y3R1cmVbXSA9IHRoaXMuY3JlYXRlUHJvcGVydHkoZG9jcywgbmFtZXMsIHR5cGVzLCBwYWNrcywgZmlsdGVyKTtcclxuXHJcbiAgICAgICAgaWYgKHBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5rdktleSA9IG5hbWVzW3BhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpXSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMua3ZLZXlUeXBlID0gdGhpcy5nZXRUeXBlKHR5cGVzW3BhY2tzLmluZGV4T2YoS2V5V29yZHMuSURLRVkpXSBhcyBQcm90b0J1ZlNjYWxhclR5cGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOW9k+WJjU1BUOexu+Wei+eahOmFjeihqEtWS2V55Li6OiR7dGhpcy5rdktleX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGhhcyA9IHNmLmdldEludGVyZmFjZShuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZSk7XHJcbiAgICAgICAgaWYgKGhhcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm90b0lEID0gZ2VuZXJhdG9yUHJvdG9JRChuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZSk7XHJcblxyXG4gICAgICAgIC8vIOa3u+WKoOaOpeWPo1xyXG4gICAgICAgIHNmLmFkZEludGVyZmFjZSh7XHJcbiAgICAgICAgICAgIGlzRXhwb3J0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgdGhpcy5pbnRlcmZhY2VOYW1lLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLFxyXG4gICAgICAgICAgICBkb2NzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGAnJHtwcm90b0lEfSdgLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0YWdOYW1lOiBcImF1dGhvclwiLCB0ZXh0OiBcImtzZ2FtZXMyNlwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGFnTmFtZTogXCJwcm90b2J1ZlwiLCB0ZXh0OiBgJyR7cHJvdG9JRH0nYCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0gYXMgSW50ZXJmYWNlRGVjbGFyYXRpb25TdHJ1Y3R1cmUpO1xyXG5cclxuICAgICAgICAvLyDliJvlu7rnsbtcclxuICAgICAgICBjb25zdCBjdCA9IHNmLmFkZENsYXNzKHtcclxuICAgICAgICAgICAgbmFtZTogYCR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9JFR5cGVgLFxyXG4gICAgICAgICAgICBpc0V4cG9ydGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXh0ZW5kczogYE1lc3NhZ2VUeXBlPCR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9PmAsXHJcbiAgICAgICAgICAgIGltcGxlbWVudHM6IFtgSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6ZXJgXSxcclxuICAgICAgICB9IGFzIENsYXNzRGVjbGFyYXRpb25TdHJ1Y3R1cmUpO1xyXG5cclxuICAgICAgICAvLyDliJvlu7rmnoTpgKDlh73mlbBcclxuICAgICAgICBsZXQgY3RvciA9IGN0LmFkZENvbnN0cnVjdG9yKHt9KTtcclxuXHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3QuYWRkR2V0QWNjZXNzb3Ioe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJwcm90b0lkXCIsXHJcbiAgICAgICAgICAgICAgICByZXR1cm5UeXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgc3RhdGVtZW50czogKHdyaXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUud3JpdGUoYHJldHVybiAke3BhcnNlSW50KHByb3RvSUQpfTtgKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWhq+WFheaWueazleS9k1xyXG4gICAgICAgIGNvbnN0IHdyaXRlID0gdGhpcy5wcm9qZWN0LmNyZWF0ZVdyaXRlcigpO1xyXG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLlN1cGVyKTtcclxuICAgICAgICB3cml0ZS53cml0ZShLZXlXb3Jkcy5PcGVuUGFyZW5Ub2tlbik7XHJcbiAgICAgICAgd3JpdGUud3JpdGUoYFwiJHtuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZX1cImApO1xyXG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLkNvbW1hVG9rZW4pO1xyXG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLk9wZW5CcmFja2V0VG9rZW4pO1xyXG4gICAgICAgIHdyaXRlLm5ld0xpbmUoKTtcclxuXHJcbiAgICAgICAgLy8g5a6e546w5p6E6YCg5Ye95pWwYm9keVxyXG4gICAgICAgIGxldCBubyA9IDE7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbiA9IG5hbWVzW2ldIGFzIHN0cmluZztcclxuICAgICAgICAgICAgY29uc3QgdCA9IHR5cGVzW2ldIGFzIFByb3RvQnVmU2NhbGFyVHlwZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgcGFja3NbaV0gIT0gS2V5V29yZHMuSURWQUxVRSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWunueOsOavj+S4quWtl+auteeahHJ0dGnkv6Hmga9cclxuICAgICAgICAgICAgd3JpdGUud3JpdGUoc2NhbGFyKG5vLCBuLCBnZXRQcm90b0J1ZlNjYWxhclR5cGUodCksIHQuZW5kc1dpdGgoXCJbXVwiKSA/IHRydWUgOiBmYWxzZSwgdCkpO1xyXG4gICAgICAgICAgICB3cml0ZS53cml0ZShLZXlXb3Jkcy5Db21tYVRva2VuKTtcclxuICAgICAgICAgICAgd3JpdGUubmV3TGluZSgpO1xyXG5cclxuICAgICAgICAgICAgbm8rKztcclxuICAgICAgICB9XHJcbiAgICAgICAgd3JpdGUud3JpdGUoS2V5V29yZHMuQ2xvc2VCcmFja2V0VG9rZW4pO1xyXG4gICAgICAgIHdyaXRlLndyaXRlKEtleVdvcmRzLkNsb3NlUGFyZW5Ub2tlbik7XHJcbiAgICAgICAgd3JpdGUud3JpdGUoS2V5V29yZHMuU2VtaWNvbG9uVG9rZW4pO1xyXG4gICAgICAgIGN0b3Iuc2V0Qm9keVRleHQod3JpdGUudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIOa3u+WKoOWvvOWHulxyXG4gICAgICAgIHNmLmFkZFZhcmlhYmxlU3RhdGVtZW50KHtcclxuICAgICAgICAgICAgaXNFeHBvcnRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgZGVjbGFyYXRpb25LaW5kOiBWYXJpYWJsZURlY2xhcmF0aW9uS2luZC5Db25zdCxcclxuICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IGBuZXcgJHtuYW1lIHx8IHRoaXMuaW50ZXJmYWNlTmFtZX0kVHlwZSgpYCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSBhcyBWYXJpYWJsZVN0YXRlbWVudFN0cnVjdHVyZSk7XHJcblxyXG4gICAgICAgIC8vIOa3u+WKoOazqOWGjFxyXG4gICAgICAgIHNmLmFkZFN0YXRlbWVudHModyA9PiB7XHJcbiAgICAgICAgICAgIHcud3JpdGUoYFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0b3Iub24oXCJnYW1lLWZyYW1ld29yay1pbml0aWFsaXplXCIsKCk9PntcclxuICAgICAgICAgICAgICAgICAgICBDb250YWluZXIuZ2V0SW50ZXJmYWNlKFwiSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6YWJsZVwiKT8ucmVnaXN0ZXJJbnN0KCR7bmFtZSB8fCB0aGlzLmludGVyZmFjZU5hbWV9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBgKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyDmoLzlvI/ljJbmiYDmnInmlofku7ZcclxuICAgICAgICB0aGlzLnByb2plY3QuZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKGZpbGUgPT4gZmlsZS5mb3JtYXRUZXh0KCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzYXZlKGNsaWVudDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjbGllbnQpIHtcclxuICAgICAgICAgICAgLy8g5YWI5re75YqgcHJvdG9idWbnm7jlhbNcclxuICAgICAgICAgICAgdGhpcy5zZi5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiTWVzc2FnZVR5cGVcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlU3BlY2lmaWVyOiBcImRiOi8vZ2FtZS1wcm90b2J1Zi9nYW1lLWZyYW1ld29ya1wiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvLyDlnKjmt7vliqAs5YaN5re75Yqg6KGo6L6+5byPXHJcbiAgICAgICAgICAgIHRoaXMuc2YuYWRkSW1wb3J0RGVjbGFyYXRpb25zKFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpc1R5cGVPbmx5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lZEltcG9ydHM6IFtcIkV4cHJlc3Npb25zXCIsIFwiRXhwcmVzc2lvbnNIYW5kbGVyXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29uZmlndXJlL2dhbWUtZnJhbWV3b3JrXCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOWcqOa3u+WKoCzlho3mt7vliqDlrrnlmahcclxuICAgICAgICAgICAgdGhpcy5zZi5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiQ29udGFpbmVyXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29yZS9nYW1lLWZyYW1ld29ya1wiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvLyDmt7vliqBjY+WvvOWFpVxyXG4gICAgICAgICAgICB0aGlzLnNmLmFkZEltcG9ydERlY2xhcmF0aW9ucyhbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNUeXBlT25seTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRJbXBvcnRzOiBbXCJkaXJlY3RvclwiXSxcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVTcGVjaWZpZXI6IFwiY2NcIixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihcIm5vdCBzdXBwb3J0IHNlcnZlclwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDkv53lrZjmlofku7ZcclxuICAgICAgICB0aGlzLnByb2plY3Quc2F2ZVN5bmMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJk+WMheaVsOaNrlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJvZiBSZWFkRXhjZWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHBhY2soZmlsZU5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxldCBzb3VyY2UgPSB0aGlzLnByb2plY3RcclxuICAgICAgICAgICAgLmdldFNvdXJjZUZpbGVzKClcclxuICAgICAgICAgICAgLm1hcChmaWxlID0+IChmaWxlLmdldEZpbGVQYXRoKCkuaW5jbHVkZXMoZmlsZU5hbWUpID8gXCJcIiA6IGZpbGUuZ2V0VGV4dCgpKSlcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcbiAgICAgICAgY29uc3QgcGFja1R5cGUgPSB0aGlzLmdldFBhY2tlclR5cGUoKTtcclxuXHJcbiAgICAgICAgLy8g55u05o6l5om+MSwz5ZKMNFxyXG4gICAgICAgIC8vIDHmmK/lj5jph4/nn63ms6jph4pcclxuICAgICAgICAvLyAz5piv5Y+Y6YeP5ZCN56ewXHJcbiAgICAgICAgLy8gNOaYr+WPmOmHj+exu+Wei1xyXG4gICAgICAgIGNvbnN0IHdiID0gdGhpcy5tYWluO1xyXG4gICAgICAgIGNvbnN0IHBhY2tlciA9IHdiLnJvd3NbNV0uY2VsbHM7XHJcbiAgICAgICAgY29uc3QgaGVhZCA9IGBcclxuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgQnl0ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8g5YaZ5YaF5a655pWw6YePXHJcbiAgICAgICAgICAgIGJ5dGVzLndyaXRlSW50MTYoY291bnQpO1xyXG4gICAgICAgICAgICAvLyDlhpnmiZPljIXop6PljIXooajlkI1cclxuICAgICAgICAgICAgYnl0ZXMud3JpdGVVVEY4U3RyaW5nKHByb3RvTkEpO1xyXG4gICAgICAgICAgICAvLyDlhpnmiZPljIXop6PljIVJRFxyXG4gICAgICAgICAgICBieXRlcy53cml0ZUludDMyKHByb3RvSUQpO1xyXG4gICAgICAgICAgICAvLyDlhpnlhaXmiZPljIXnsbvlnotcclxuICAgICAgICAgICAgYnl0ZXMud3JpdGVVaW50OChwYWNrVHlwZSk7XHJcbiAgICAgICAgYDtcclxuICAgICAgICBzb3VyY2UgKz0gaGVhZDtcclxuICAgICAgICBsZXQgZGF0YTogdW5rbm93bjtcclxuXHJcbiAgICAgICAgbGV0IGZ1bmMgPSBcIlwiO1xyXG5cclxuICAgICAgICAvLyDnnIvnnIvnsbvlnotcclxuICAgICAgICBzd2l0Y2ggKHBhY2tlclswXS50ZXh0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX01BUDpcclxuICAgICAgICAgICAgICAgIGZ1bmMgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWGmeWFpWtleVxyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzLndyaXRlVVRGOFN0cmluZyhpZGtleSk7XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9MSVNUOiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5wYWNrTE1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICAvLyDmnoTlu7rkuIDmrrXku6PnoIHnlKjmnaXmiZPljIVcclxuICAgICAgICAgICAgICAgIC8vIGludDE2KOaVsOaNruaVsOmHjykgKyBpbnQxNijmiZPljIXop6PljIVJRCkgKyBpbnQzMijljZXmnaHmlbDmja7plb/luqYpICsgYm9keSjljZXmnaHmlbDmja7lhoXlrrkpXHJcbiAgICAgICAgICAgICAgICBmdW5jICs9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmluID0gKCR7dGhpcy5pbnRlcmZhY2VOYW1lfSBhcyBNZXNzYWdlVHlwZTxvYmplY3Q+KS50b0JpbmFyeShkYXRhW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YaZ5Y2P6K6u6ZW/5bqmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlcy53cml0ZUludDMyKGJpbi5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YaZ5YWl5omT5YyF5ZCO55qE5YaF5a65XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlcy53cml0ZUFycmF5QnVmZmVyKGJpbi5idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaIquaWremineWkljDlgLzlhoXlrrlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+q5L+d55WZ5pyJ5pWI5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGJ5dGVzLmJ1ZmZlci5zbGljZSgwLCBieXRlcy5wb3MpXHJcbiAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0VOVU06XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfS1Y6IHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB0aGlzLnBhY2tLVkRhdGEoKTtcclxuICAgICAgICAgICAgICAgIC8vIOaehOW7uuS4gOauteS7o+eggeeUqOadpeaJk+WMhVxyXG4gICAgICAgICAgICAgICAgLy8gaW50MTYo5pWw5o2u5pWw6YePKSArIGludDE2KOaJk+WMheino+WMhUlEKSArIGludDMyKOWNleadoeaVsOaNrumVv+W6pikgKyBib2R5KOWNleadoeaVsOaNruWGheWuuSlcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW4gPSAoJHt0aGlzLmludGVyZmFjZU5hbWV9IGFzIE1lc3NhZ2VUeXBlPG9iamVjdD4pLnRvQmluYXJ5KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlhpnljY/orq7plb/luqZcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVJbnQzMihiaW4ubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YaZ5YWl5omT5YyF5ZCO55qE5YaF5a65XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzLndyaXRlQXJyYXlCdWZmZXIoYmluLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaIquaWremineWkljDlgLzlhoXlrrlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+q5L+d55WZ5pyJ5pWI5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGJ5dGVzLmJ1ZmZlci5zbGljZSgwLCBieXRlcy5wb3MpXHJcbiAgICAgICAgICAgICAgICAgICAgYDtcclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLpmaTkuIDnu7TmiZPljIXmlrnlvI/lpJYs5pqC5LiN5pSv5oyB5YW25LuW5omT5YyF5pa55byPXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzb3VyY2UgKz0gZnVuYztcclxuXHJcbiAgICAgICAgLy8g57yW6K+R5Luj56CB5bm25Yib5bu66L+Q6KGM5pe25LiK5LiL5paHXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdHMudHJhbnNwaWxlKHNvdXJjZSwge1xyXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXHJcbiAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzdWx0KTtcclxuICAgICAgICBjb25zdCBjb250ZXh0ID0gY3JlYXRlQ29udGV4dCh7XHJcbiAgICAgICAgICAgIGJ1ZmZlcjogbnVsbCxcclxuICAgICAgICAgICAgZGF0YSxcclxuICAgICAgICAgICAgcGFja1R5cGU6IHBhY2tUeXBlLFxyXG4gICAgICAgICAgICBwcm90b0lEOiBcIlwiICsgdGhpcy5nZXRQcm90b0lEKCksXHJcbiAgICAgICAgICAgIHByb3RvTkE6IHRoaXMuaW50ZXJmYWNlTmFtZSxcclxuICAgICAgICAgICAgZXhwb3J0czoge30sXHJcbiAgICAgICAgICAgIGlka2V5OiB0aGlzLmt2S2V5IHx8IFwiXCIsXHJcbiAgICAgICAgICAgIGNvdW50OiBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5sZW5ndGggOiAxLFxyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZSxcclxuICAgICAgICAgICAgQ29udGFpbmVyLFxyXG4gICAgICAgICAgICBFeHByZXNzaW9uc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIEV4cHJlc3Npb25zLFxyXG4gICAgICAgICAgICBCeXRlLFxyXG4gICAgICAgICAgICBkaXJlY3RvclxyXG4gICAgICAgIH0gYXMgeyBidWZmZXI6IFVpbnQ4QXJyYXkgfCBudWxsIH0pO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQocmVzdWx0KTtcclxuICAgICAgICAgICAgc2NyaXB0LnJ1bkluQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBjb250ZXh0LmJ1ZmZlcjtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFByb3RvSUQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZ2VuZXJhdG9yUHJvdG9JRCh0aGlzLmludGVyZmFjZU5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrZXJUeXBlKCk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3Qgd2IgPSB0aGlzLm1haW47XHJcbiAgICAgICAgc3dpdGNoICh3Yi5yb3dzWzVdLmNlbGxzWzBdLnRleHQpIHtcclxuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfTElTVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBQQUNLRVIuTElTVDtcclxuICAgICAgICAgICAgY2FzZSBLZXlXb3Jkcy5QQUNLRVJfS1Y6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUEFDS0VSLktWO1xyXG4gICAgICAgICAgICBjYXNlIEtleVdvcmRzLlBBQ0tFUl9NQVA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUEFDS0VSLk1BUDtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIuWFtuS7luexu+Wei+S4jeaUr+aMgeWtmOWcqOS4jk1BSU4gU0hFRVTkuK1cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYWNrS1ZEYXRhKCkge1xyXG4gICAgICAgIGNvbnN0IG1haW4gPSB0aGlzLndicy5nZXQoXCJtYWluXCIpO1xyXG4gICAgICAgIGNvbnN0IHR5cGVzID0gbWFpbj8udHlwZXMhO1xyXG4gICAgICAgIGNvbnN0IGRhdGE6IERpY3QgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc3QgaXNPYmogPSB0aGlzLnR5cGVzLnBhY2tzLmluZGV4T2YoS2V5V29yZHMuSURPQkopO1xyXG4gICAgICAgIGNvbnN0IGlzS2V5ID0gdGhpcy50eXBlcy5wYWNrcy5pbmRleE9mKEtleVdvcmRzLklES0VZKTtcclxuXHJcbiAgICAgICAgdGhpcy50eXBlcy5tb2QuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgICAgICBkYXRhW2tdID0ge307XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOaMieeFp2ludGVyZmFjZeaJk+WMhVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG1haW4/LnJvd3MpIHtcclxuICAgICAgICAgICAgICAgIGlmICgra2V5IDw9IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1haW4/LnJvd3NbK2tleV0uY2VsbHMhO1xyXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGsgPSB2YWx1ZVtpc09ial0udGV4dDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IGRhdGFba107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g6L+H5rukT0JK5ZKMS0VZ5omA5Zyo5b6X5YiX5pWw5o2uXHJcbiAgICAgICAgICAgICAgICAvLyDkuI3pnIDopoHmiZPljIVcclxuICAgICAgICAgICAgICAgIC8vIOaYr+S9nOS4uumUruWtmOWcqOeahFxyXG4gICAgICAgICAgICAgICAgaWYgKCt0eXBlc1tpXS5pbmR4ID09IGlzT2JqIHx8ICt0eXBlc1tpXS5pbmR4ID09IGlzS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViID0gdmFsdWVbaXNLZXldLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9ialtzdWJdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqW3N1Yl0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBvdXQgPSBvYmpbc3ViXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDku47lnLA26KGM5byA5aeL5omN5piv5pWw5o2uYm9keemDqOWIhlxyXG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gK2tleSAtIDY7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHR5cGVzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/memHjOmcgOimgeWKoOWbnuadpVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWboOS4uuWQjumdoumcgOimgemdoOi/meS4que0ouW8leWOu+aLv+i/meS4gOihjOeahOWAvFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeDogaWR4ICsgNixcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG91dCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFR5cGVWYWx1ZShpbnB1dCBhcyBQUUlucHV0LCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFja0xNRGF0YSgpOiBEaWN0W10ge1xyXG4gICAgICAgIC8vIOaYr+S4gOS4qmludGVyZmFjZeaVsOe7hFxyXG4gICAgICAgIGNvbnN0IGRhdGE6IERpY3RbXSA9IFtdO1xyXG4gICAgICAgIC8vIOS7jm1haW4gc2hlZXQg5byA5aeL5omT5YyFXHJcbiAgICAgICAgY29uc3QgbWFpbiA9IHRoaXMud2JzLmdldChcIm1haW5cIik7XHJcbiAgICAgICAgY29uc3QgdHlwZXMgPSBtYWluPy50eXBlcyE7XHJcblxyXG4gICAgICAgIC8vIOaMieeFp2ludGVyZmFjZeaJk+WMhVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG1haW4/LnJvd3MpIHtcclxuICAgICAgICAgICAgICAgIGlmICgra2V5IDw9IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1haW4/LnJvd3NbK2tleV0uY2VsbHMhO1xyXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIOS7juWcsDbooYzlvIDlp4vmiY3mmK/mlbDmja5ib2R56YOo5YiGXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAra2V5IC0gNjtcclxuICAgICAgICAgICAgICAgIGlmICghZGF0YVtpZHhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpZHhdID0ge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZmFjZSA9IGRhdGFbaWR4XTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdHlwZXNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6L+Z6YeM6ZyA6KaB5Yqg5Zue5p2lXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Zug5Li65ZCO6Z2i6ZyA6KaB6Z2g6L+Z5Liq57Si5byV5Y675ou/6L+Z5LiA6KGM55qE5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4OiBpZHggKyA2LFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogaWZhY2UsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRUeXBlVmFsdWUoaW5wdXQgYXMgUFFJbnB1dCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFR5cGVWYWx1ZSh0OiBQUUlucHV0LCByZTogUmVhZEV4Y2VsKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBg6YWN572u6KGoJHtyZS5pbnRlcmZhY2VOYW1lfeino+aekOWksei0pWAgKyB0LnNvdXJjZS5pbmR4ICsgXCJfXCIgKyB0LnNvdXJjZS5uYW1lICsgXCJfXCIgKyB0LnNvdXJjZS5pbmR4O1xyXG5cclxuICAgICAgICBjb25zdCBpc0FycmF5ID0gdC5zb3VyY2UudHlwZS5lbmRzV2l0aChcIltdXCIpO1xyXG4gICAgICAgIGxldCB0eSA9IHQuc291cmNlLnR5cGUgYXMgUHJvdG9CdWZTY2FsYXJUeXBlO1xyXG4gICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIHR5ID0gdC5zb3VyY2UudHlwZS5yZXBsYWNlKFwiW11cIiwgXCJcIikgYXMgUHJvdG9CdWZTY2FsYXJUeXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoICh0eSkge1xyXG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcclxuICAgICAgICAgICAgY2FzZSBcImludDY0XCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1aW50MzJcIjpcclxuICAgICAgICAgICAgY2FzZSBcInVpbnQ2NFwiOlxyXG4gICAgICAgICAgICBjYXNlIFwic2ludDMyXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJzaW50NjRcIjpcclxuICAgICAgICAgICAgY2FzZSBcImZpeGVkMzJcIjpcclxuICAgICAgICAgICAgY2FzZSBcImZpeGVkNjRcIjpcclxuICAgICAgICAgICAgY2FzZSBcInNmaXhlZDMyXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZml4ZWQ2NFwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPSB7IHRleHQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnqbrmlbDnu4RcclxuICAgICAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOepuuWAvOm7mOiupOS4ujBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCArIFwiXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0LmVuZHNXaXRoKFwiO1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDljrvmjonmnIDlkI7nmoQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QgPSBsaXN0LnN1YnN0cmluZygwLCBsaXN0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gKGxpc3QgYXMgc3RyaW5nKS5zcGxpdChcIjtcIikubWFwKHYgPT4gK3YpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSArbGlzdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICh0LmRhdGFbdC5zb3VyY2UubmFtZV0gPT0gdm9pZCAwLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwiYm9vbFwiOlxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGlzQXJyYXksIFwi5pqC5LiN5pSv5oyB5pWw57uE57G75Z6LXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XSA9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XSA9IHsgdGV4dDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodiAhPSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoK3YgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHYgPT0gXCJmYWxzZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IHY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0LmRhdGFbdC5zb3VyY2UubmFtZV0gPT0gdm9pZCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOepuuWAvOm7mOiupOS4umZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9PSB2b2lkIDAsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICBpZiAodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0gPSB7IHRleHQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCArIFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdC5lbmRzV2l0aChcIjtcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y675o6J5pyA5ZCO55qEO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ID0gbGlzdC5zdWJzdHJpbmcoMCwgbGlzdC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IChsaXN0IGFzIHN0cmluZykuc3BsaXQoXCI7XCIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSBsaXN0ICsgXCJcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydCh0LmRhdGFbdC5zb3VyY2UubmFtZV0gPT0gdm9pZCAwLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcImJ5dGVzXCI6XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLkuI3mlK/mjIFcIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcImxpbWl0XCI6XHJcbiAgICAgICAgICAgIC8vIOWHveaVsOexu+Wei1xyXG4gICAgICAgICAgICBjYXNlIFwiZm5cIjpcclxuICAgICAgICAgICAgLy8g5p2h5Lu257G75Z6LXHJcbiAgICAgICAgICAgIGNhc2UgXCJjb25kaXRpb25cIjpcclxuICAgICAgICAgICAgLy8g5YWs5byP57G75Z6LXHJcbiAgICAgICAgICAgIGNhc2UgXCJmb3JtdWxhXCI6XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoaXNBcnJheSwgXCLmmoLkuI3mlK/mjIHmlbDnu4TnsbvlnotcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoIXQudmFsdWVzW3Quc291cmNlLmluZHhdLCBcIuivt+ajgOafpeaVsOaNrua6kFwiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydCghdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCAmJiB0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ICE9IFwiMFwiLCBcIuivt+ajgOafpeaVsOaNrua6kFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBjb21waWxlKHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQgYXMgc3RyaW5nLCB0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdC5kYXRhW3Quc291cmNlLm5hbWVdID0gcDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGDop6PmnpDlpI3mnYLnsbvlnovlpLHotKU657G75Z6LOiR7dHl9YCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRvU3RyaW5nKCkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzb3VyY2U6XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCkgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9PSB2b2lkIDAsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0IG9yIGVudW0gb3Igb3RoZXJzXHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoaXNBcnJheSwgXCLmmoLkuI3mlK/mjIHmlbDnu4TnsbvlnotcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hlZXQgPSBnZXRWYWx1ZSh0eSkhO1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0eSBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoS2V5V29yZHMuT2JqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaOpeWPo1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZmFjZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWIgPSByZS5zbHMuZ2V0KHNoZWV0KSE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZXMgPSBzdWI/Lm1haW4hLnR5cGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1haW4gPSBzdWI/Lm1haW47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBtYWluPy5yb3dzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgra2V5ID09IHQuaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtYWluPy5yb3dzWytrZXldLmNlbGxzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHR5cGVzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZHg6IHQuaWR4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpZmFjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFR5cGVWYWx1ZShpbnB1dCBhcyBQUUlucHV0LCB0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmRhdGFbdC5zb3VyY2UubmFtZV0gPSBpZmFjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgodHkgYXMgc3RyaW5nKS5zdGFydHNXaXRoKEtleVdvcmRzLkVudW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5p6a5Li+XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViID0gcmUuc2xzLmdldChzaGVldCkhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVzID0gc3ViPy50eXBlcy5uYW1lcztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWNrcyA9IHN1Yj8udHlwZXMucGFja3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCh0LnZhbHVlc1t0LnNvdXJjZS5pbmR4XS50ZXh0ID09IHZvaWQgMCwgXCLop6PmnpDmnprkuL7lpLHotKVcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IG5hbWVzLmluZGV4T2YodC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dCEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IHBhY2tzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHQuZGF0YVt0LnNvdXJjZS5uYW1lXSA9IHQudmFsdWVzW3Quc291cmNlLmluZHhdLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgYOWcqCR7bmFtZXN95Lit5pyq5om+5Yiw5p6a5Li+6aG5ICR7dC52YWx1ZXNbdC5zb3VyY2UuaW5keF0udGV4dH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydCh0LmRhdGFbdC5zb3VyY2UubmFtZV0gPT0gdm9pZCAwLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmjqXlj6PlsZ7mgKdcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7Kn0gIHtQcm9wZXJ0eVNpZ25hdHVyZVN0cnVjdHVyZVtdfVxyXG4gICAgICogQG1lbWJlcm9mIFJlYWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjcmVhdGVQcm9wZXJ0eShcclxuICAgICAgICBkb2NzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxyXG4gICAgICAgIG5hbWVzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxyXG4gICAgICAgIHR5cGVzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxyXG4gICAgICAgIHBhY2tzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxyXG4gICAgICAgIGZpbHRlcjogYm9vbGVhbiA9IGZhbHNlLFxyXG4gICAgKTogUHJvcGVydHlTaWduYXR1cmVTdHJ1Y3R1cmVbXSB7XHJcbiAgICAgICAgY29uc3QgcHJvcHM6IFByb3BlcnR5U2lnbmF0dXJlU3RydWN0dXJlW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8g5LuOMeW8gOWni1xyXG4gICAgICAgIC8vIOWboOS4ujAg5piv5rOo6YeKXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbiA9IG5hbWVzW2ldIGFzIHN0cmluZztcclxuICAgICAgICAgICAgY29uc3QgdCA9IHR5cGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlciAmJiBwYWNrc1tpXSAhPSBLZXlXb3Jkcy5JRFZBTFVFKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdG4gPSB0aGlzLmdldFR5cGUodCBhcyBQcm90b0J1ZlNjYWxhclR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0bikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLlr7nosaHooajovr7lvI/plJnor69cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByb3BzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbixcclxuICAgICAgICAgICAgICAgIHR5cGU6IHRuLFxyXG4gICAgICAgICAgICAgICAgZG9jczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRvY3NbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0gYXMgUHJvcGVydHlTaWduYXR1cmVTdHJ1Y3R1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHByb3BzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0VHlwZSh0OiBQcm90b0J1ZlNjYWxhclR5cGUpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGlzQXJyYXkgPSB0LmVuZHNXaXRoKFwiW11cIik7XHJcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgdCA9IHQucmVwbGFjZShcIltdXCIsIFwiXCIpIGFzIFByb3RvQnVmU2NhbGFyVHlwZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcclxuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJpbnQzMlwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiaW50NjRcIjpcclxuICAgICAgICAgICAgY2FzZSBcInVpbnQzMlwiOlxyXG4gICAgICAgICAgICBjYXNlIFwidWludDY0XCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJzaW50MzJcIjpcclxuICAgICAgICAgICAgY2FzZSBcInNpbnQ2NFwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiZml4ZWQzMlwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiZml4ZWQ2NFwiOlxyXG4gICAgICAgICAgICBjYXNlIFwic2ZpeGVkMzJcIjpcclxuICAgICAgICAgICAgY2FzZSBcInNmaXhlZDY0XCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNBcnJheSA/IFwibnVtYmVyW11cIiA6IFwibnVtYmVyXCI7XHJcbiAgICAgICAgICAgIGNhc2UgXCJib29sXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNBcnJheSA/IFwiYm9vbGVhbltdXCIgOiBcImJvb2xlYW5cIjtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzQXJyYXkgPyBcInN0cmluZ1tdXCIgOiBcInN0cmluZ1wiO1xyXG4gICAgICAgICAgICBjYXNlIFwiYnl0ZXNcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBpc0FycmF5ID8gXCJVaW50OEFycmF5W11cIiA6IFwiVWludDhBcnJheVwiO1xyXG4gICAgICAgICAgICAvLyDlh73mlbDnsbvlnotcclxuICAgICAgICAgICAgY2FzZSBcImZuXCI6XHJcbiAgICAgICAgICAgIC8vIOadoeS7tuexu+Wei1xyXG4gICAgICAgICAgICBjYXNlIFwiY29uZGl0aW9uXCI6XHJcbiAgICAgICAgICAgIC8vIOWFrOW8j+exu+Wei1xyXG4gICAgICAgICAgICBjYXNlIFwiZm9ybXVsYVwiOlxyXG4gICAgICAgICAgICAvLyDpmZDliLbnsbvlnotcclxuICAgICAgICAgICAgY2FzZSBcImxpbWl0XCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJFeHByZXNzaW9uc1wiO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0IG9yIGVudW0gb3Igb3RoZXJzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3RVcHBlckNhc2UoZ2V0VmFsdWUodCkhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFN1YlJlYWRFeGNlbCBleHRlbmRzIFJlYWRFeGNlbCB7XHJcbiAgICBwdWJsaWMgcmU6IFJlYWRFeGNlbDtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHNoZWV0OiBQUVdvcmtCb29rLCB0eXBlczogUmVhZEV4Y2VsVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmUgPSB0eXBlcy5yZTtcclxuICAgICAgICB0aGlzLnJlLmFkZFJlYWRFeGNlbChuYW1lLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmludGVyZmFjZU5hbWUgPSBmaXJzdFVwcGVyQ2FzZShuYW1lKTtcclxuICAgICAgICB0aGlzLm1haW4gPSBzaGVldDtcclxuICAgICAgICB0aGlzLnByb2plY3QgPSB0eXBlcy5yZS5wcm9qZWN0O1xyXG4gICAgICAgIHRoaXMuc2YgPSB0eXBlcy5yZS5zZjtcclxuICAgICAgICB0aGlzLnR5cGVzID0gbmV3IFJlYWRFeGNlbFR5cGUodHlwZXMucmUsIHRoaXMubWFpbik7XHJcbiAgICAgICAgdGhpcy50eXBlcy5wYXJzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXJzZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNyZWF0ZUludGVyZmFjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVJbnRlcmZhY2UoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2YgPSB0aGlzLnNmO1xyXG5cclxuICAgICAgICAvLyDnm7TmjqXmib4xLDPlkow0XHJcbiAgICAgICAgLy8gMeaYr+WPmOmHj+efreazqOmHilxyXG4gICAgICAgIC8vIDPmmK/lj5jph4/lkI3np7BcclxuICAgICAgICAvLyA05piv5Y+Y6YeP57G75Z6LXHJcbiAgICAgICAgY29uc3Qgd2IgPSB0aGlzLm1haW47XHJcbiAgICAgICAgY29uc3QgcGFja2VyID0gd2Iucm93c1s1XS5jZWxscztcclxuICAgICAgICAvLyDnnIvnnIvnsbvlnotcclxuICAgICAgICBzd2l0Y2ggKHBhY2tlclswXS50ZXh0KSB7XHJcbiAgICAgICAgICAgIC8vIOS4gOe7tOeahEtW5omT5YyFXHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0xJU1Q6XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX01BUDpcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTE0oc2YpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5V29yZHMuUEFDS0VSX0VOVU06XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVudW0oc2YpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIOWkmue7tOeahEtW5omT5YyFXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWtkOmhueaXoOazleS9v+eUqOmZpFBBQ0tFUl9MSVNU5ZKMUEFDS0VSX0VOVU3miZPljIXku6XlpJbnmoTku7vkvZXmlrnlvI9cIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXJzZXJPcHRpb25zIHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBwdWJsaWMgb3V0cHV0X2Jpbjogc3RyaW5nLFxyXG4gICAgICAgIHB1YmxpYyBvdXRwdXRfdHM6IHN0cmluZyxcclxuICAgICAgICBwdWJsaWMgY3N0eXBlOiBzdHJpbmcsXHJcbiAgICAgICAgcHVibGljIGdsb2JhbE1vZHVsZU5hbWU6IHN0cmluZyxcclxuICAgICAgICBwdWJsaWMgZ2xvYmFsTW9kdWxlVFNOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcHVibGljIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IHN0cmluZ1xyXG4gICAgKSB7IH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcnNlciB7XHJcbiAgICBwdWJsaWMgYXJncyA9IHtcclxuICAgICAgICBpbnB1dDogXCJcIixcclxuICAgICAgICBvdXRwdXQ6IFwiXCIsXHJcbiAgICAgICAgdHM6IFwiXCIsXHJcbiAgICAgICAgY3N0eXBlOiBcInNlcnZlclwiLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZU5hbWU6IFwiXCIsXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlVFNOYW1lOiBcIlwiLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IFwiXCJcclxuICAgIH07XHJcbiAgICBwcml2YXRlIHByb2plY3QhOiBQcm9qZWN0O1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBQYXJzZXJPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmlucHV0KSB7XHJcbiAgICAgICAgICAgIEVkaXRvci5EaWFsb2cuZXJyb3IoYCR7RWRpdG9yLkkxOG4udChcInhsc3hfcGF0aFwiKX3plJnor69gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLm91dHB1dF9iaW4pIHtcclxuICAgICAgICAgICAgRWRpdG9yLkRpYWxvZy5lcnJvcihgJHtFZGl0b3IuSTE4bi50KFwiZXhwb3J0X2RpcmVjdG9yXCIpfemUmeivr2ApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW9wdGlvbnMub3V0cHV0X3RzKSB7XHJcbiAgICAgICAgICAgIEVkaXRvci5EaWFsb2cuZXJyb3IoYCR7RWRpdG9yLkkxOG4udChcImV4cG9ydF90c19kaXJlY3RvclwiKX3plJnor69gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hcmdzLmlucHV0ID0gdGhpcy5wcm9qZWN0UGF0aChvcHRpb25zLmlucHV0KTtcclxuICAgICAgICB0aGlzLmFyZ3Mub3V0cHV0ID0gdGhpcy5wcm9qZWN0UGF0aChvcHRpb25zLm91dHB1dF9iaW4pO1xyXG4gICAgICAgIHRoaXMuYXJncy50cyA9IHRoaXMucHJvamVjdFBhdGgob3B0aW9ucy5vdXRwdXRfdHMpO1xyXG4gICAgICAgIHRoaXMuYXJncy5jc3R5cGUgPSB0aGlzLnByb2plY3RQYXRoKG9wdGlvbnMuY3N0eXBlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZU5hbWUgPSBvcHRpb25zLmdsb2JhbE1vZHVsZU5hbWUgfHwgXCJrc2dhbWVzMjZcIjtcclxuICAgICAgICB0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lID0gb3B0aW9ucy5nbG9iYWxNb2R1bGVUU05hbWUgfHwgXCJrc2dhbWVzMjZcIjtcclxuICAgICAgICBpZiAodGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZS5lbmRzV2l0aChcIi50c1wiKSkge1xyXG4gICAgICAgICAgICB0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lID0gdGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZS5zdWJzdHJpbmcoMCwgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZS5sZW5ndGggLSAzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcmdzLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUgPSBvcHRpb25zLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUgfHwgXCJJQ29uZmlndXJlVGFibGVcIjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJvamVjdFBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZShcInByb2plY3Q6L1wiLCBFZGl0b3IuUHJvamVjdC5wYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlUHJvamVjdCgpOiBQcm9qZWN0IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb2plY3Qoe1xyXG4gICAgICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGluY3JlbWVudGFsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0cy5TY3JpcHRUYXJnZXQuRVM1LFxyXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB0cy5Nb2R1bGVLaW5kLkNvbW1vbkpTLFxyXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzb3VyY2VNYXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjb21wb3NpdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzdHJpY3Q6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXNvbHV0aW9uOiB0cy5Nb2R1bGVSZXNvbHV0aW9uS2luZC5Ob2RlSnMsXHJcbiAgICAgICAgICAgICAgICBlc01vZHVsZUludGVyb3A6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBza2lwTGliQ2hlY2s6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUNvbnNpc3RlbnRDYXNpbmdJbkZpbGVOYW1lczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGV4cGVyaW1lbnRhbERlY29yYXRvcnM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBub0ltcGxpY2l0QW55OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbm9JbXBsaWNpdFRoaXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlSnNvbk1vZHVsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNraXBEZWZhdWx0TGliQ2hlY2s6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGUoaW5pdDogKGRhdGE6IEFycmF5PHsgaWQ6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4gfT4pID0+IHZvaWQsIGNiOiAobmFtZTogc3RyaW5nLCBzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkLCBwcm9ncmVzczogKHByb2dyZXNzOiBudW1iZXIpID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBCeXRlKCk7XHJcbiAgICAgICAgY29uc3QgZiA9IG5ldyBGaWxlKHRoaXMuYXJncy5pbnB1dCEpO1xyXG5cclxuICAgICAgICB0aGlzLnByb2plY3QgPSB0aGlzLmNyZWF0ZVByb2plY3QoKTtcclxuXHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoam9pbih0aGlzLmFyZ3MudHMhLCBgJHt0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlVFNOYW1lfS50c2ApKSkge1xyXG4gICAgICAgICAgICB1bmxpbmtTeW5jKGpvaW4odGhpcy5hcmdzLnRzISwgYCR7dGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZX0udHNgKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNmZyA9IHRoaXMucHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKGpvaW4odGhpcy5hcmdzLnRzISwgYCR7dGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZX0udHNgKSwgXCJcIik7XHJcblxyXG4gICAgICAgIGxldCBwcmVzZW50ID0gMDtcclxuXHJcbiAgICAgICAgc2ZnLmFkZFN0YXRlbWVudHModyA9PlxyXG4gICAgICAgICAgICB3LndyaXRlKGAke0tleVdvcmRzLkRlY2xhcmV9ICR7S2V5V29yZHMuR2xvYmFsfWApLmJsb2NrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhbGxGaWxlcyA9IGYuZ2V0QWxsRmlsZXMoXCIueGxzeFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YTogQXJyYXk8eyBpZDogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbiB9PiA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxsRmlsZXMuZm9yRWFjaChmID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6L+H5rukZXhjZWzmiZPlvIDlkI7oh6rliqjliJvlu7rnmoTlia/mnKxcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZi5uYW1lLnN0YXJ0c1dpdGgoXCJ+JFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZi5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgaW5pdCAmJiBpbml0KGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsbEZpbGVzLmZvckVhY2goZiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6L+H5rukZXhjZWzmiZPlvIDlkI7oh6rliqjliJvlu7rnmoTlia/mnKxcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZi5uYW1lLnN0YXJ0c1dpdGgoXCJ+JFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgUmVhZEV4Y2VsKGYsIHRoaXMuY3JlYXRlUHJvamVjdCgpLCBuZXcgRmlsZSh0aGlzLmFyZ3MudHMhKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOivu+WPlumFjee9ruihqFxyXG4gICAgICAgICAgICAgICAgICAgIHIucmVhZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDop6PmnpDphY3nva7ooahcclxuICAgICAgICAgICAgICAgICAgICByLnBhcnNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNmZy5hZGRJbXBvcnREZWNsYXJhdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lZEltcG9ydHM6IFtyLmludGVyZmFjZU5hbWVdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVTcGVjaWZpZXI6IGAuLyR7ci5maWxlTmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNmZy5hZGRFeHBvcnREZWNsYXJhdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVTcGVjaWZpZXI6IGAuLyR7ci5maWxlTmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGBtb2R1bGUgJHt0aGlzLmFyZ3MuZ2xvYmFsTW9kdWxlTmFtZX1gKS5ibG9jaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHcud3JpdGUoYCR7S2V5V29yZHMuSW50ZXJmYWNlfSAke3RoaXMuYXJncy5nbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lfWApLmJsb2NrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaehOW7umdsb2JhbOaOpeWPo+aWueS+v+aPkOekulxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgci5nbG9iYWwodyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByLnBhY2sodGhpcy5hcmdzLmdsb2JhbE1vZHVsZVRTTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHIuc2F2ZSh0aGlzLmFyZ3MuY3N0eXBlID09IFwiY2xpZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXIuYnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiICYmIGNiKGYubmFtZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaJk+WMheaVsOaNruacieivryzmiZPljIXlpLHotKVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNiICYmIGNiKGYubmFtZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMud3JpdGVBcnJheUJ1ZmZlcihyLmJ1ZmZlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzICYmIHByb2dyZXNzKCgrK3ByZXNlbnQgLyBjb3VudCkgKiAxMDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0LmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChmID0+IGYuZm9ybWF0VGV4dCgpKTtcclxuICAgICAgICBzZmcuc2F2ZSgpO1xyXG4gICAgICAgIC8vIHNhdmUgZGF0YVxyXG4gICAgICAgIGF3YWl0IGRpckV4aXN0cyh0aGlzLmFyZ3Mub3V0cHV0ISk7XHJcbiAgICAgICAgd3JpdGVGaWxlU3luYyhqb2luKHRoaXMuYXJncy5vdXRwdXQhLCBcImNmZy5iaW5cIiksIGJ5dGVzLmdldFVpbnQ4QXJyYXkoMCwgYnl0ZXMucG9zKSk7XHJcbiAgICB9XHJcbn1cclxuIl19