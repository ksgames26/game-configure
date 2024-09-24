"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxTreeNodeHandler = exports.SyntaxTreeHandler = exports.ExpressionsHandler = exports.SyntaxTree = exports.Expressions = exports.SyntaxTreeNode = exports.ExpressionsToken = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
/**
 * 表达式令牌
 *
 * @export
 * @enum {number}
 */
var ExpressionsToken;
(function (ExpressionsToken) {
    /**
     * 未知
     */
    ExpressionsToken[ExpressionsToken["Unknown"] = 0] = "Unknown";
    /**
     * 模块
     */
    ExpressionsToken[ExpressionsToken["ModLiteral"] = 1] = "ModLiteral";
    /**
     * 数值
     */
    ExpressionsToken[ExpressionsToken["NumericLiteral"] = 8] = "NumericLiteral";
    /**
     * 字符串
     */
    ExpressionsToken[ExpressionsToken["StringLiteral"] = 10] = "StringLiteral";
    /**
     * 小于
     */
    ExpressionsToken[ExpressionsToken["LessThanToken"] = 29] = "LessThanToken";
    /**
     * 大于
     */
    ExpressionsToken[ExpressionsToken["GreaterThanToken"] = 31] = "GreaterThanToken";
    /**
     * 小于等于
     */
    ExpressionsToken[ExpressionsToken["LessThanEqualsToken"] = 32] = "LessThanEqualsToken";
    /**
     * 大于等于
     */
    ExpressionsToken[ExpressionsToken["GreaterThanEqualsToken"] = 33] = "GreaterThanEqualsToken";
    /**
     * 等不等于
     */
    ExpressionsToken[ExpressionsToken["EqualsEqualsToken"] = 34] = "EqualsEqualsToken";
    /**
     * 不等于
     */
    ExpressionsToken[ExpressionsToken["ExclamationEqualsToken"] = 35] = "ExclamationEqualsToken";
    /**
     * 加
     */
    ExpressionsToken[ExpressionsToken["PlusToken"] = 39] = "PlusToken";
    /**
     * 负
     */
    ExpressionsToken[ExpressionsToken["MinusToken"] = 40] = "MinusToken";
    /**
     * 乘
     */
    ExpressionsToken[ExpressionsToken["AsteriskToken"] = 41] = "AsteriskToken";
    /**
     * 除
     */
    ExpressionsToken[ExpressionsToken["SlashToken"] = 43] = "SlashToken";
    /**
     * 等于
     */
    ExpressionsToken[ExpressionsToken["EqualsToken"] = 62] = "EqualsToken";
    /**
     * 加等
     */
    ExpressionsToken[ExpressionsToken["PlusEqualsToken"] = 63] = "PlusEqualsToken";
    /**
     * 减等
     */
    ExpressionsToken[ExpressionsToken["MinusEqualsToken"] = 64] = "MinusEqualsToken";
    /**
     * 乘等
     */
    ExpressionsToken[ExpressionsToken["AsteriskEqualsToken"] = 65] = "AsteriskEqualsToken";
    /**
     * 幂 Math.pow(left,right)
     */
    ExpressionsToken[ExpressionsToken["AsteriskAsteriskEqualsToken"] = 66] = "AsteriskAsteriskEqualsToken";
    /**
     * 除等
     */
    ExpressionsToken[ExpressionsToken["SlashEqualsToken"] = 67] = "SlashEqualsToken";
    /**
     * 模等
     */
    ExpressionsToken[ExpressionsToken["PercentEqualsToken"] = 68] = "PercentEqualsToken";
    /**
     * 标识符
     */
    ExpressionsToken[ExpressionsToken["Identifier"] = 78] = "Identifier";
    /**
     * 对象类型
     */
    ExpressionsToken[ExpressionsToken["ObjectLiteralExpression"] = 200] = "ObjectLiteralExpression";
    /**
     * 函数调用表达式
     */
    ExpressionsToken[ExpressionsToken["CallExpression"] = 203] = "CallExpression";
    /**
     * 函数套娃调用表达式
     */
    ExpressionsToken[ExpressionsToken["CallCallExpression"] = 204] = "CallCallExpression";
})(ExpressionsToken || (exports.ExpressionsToken = ExpressionsToken = {}));
/**
 * 语法树节点
 *
 * @export
 * @class SyntaxTreeNode
 */
class SyntaxTreeNode extends runtime_1.MessageType {
    /**
     * 创建一个语法树节点
     *
     * @param {ExpressionsToken} expression
     * @param {string} mod
     * @param {SyntaxTreeNode} left
     * @param {SyntaxTreeNode} right
     * @param {string} [valString=""]
     * @param {number}
     * @memberof SyntaxTreeNode
     */
    constructor(expression, mod, left, right, valNumber, valString = "", args) {
        super("PQSyntaxTreeNode", [
            { no: 1, name: "expression", kind: "enum", T: () => ["PQExpressionsToken", ExpressionsToken] },
            { no: 2, name: "mod", kind: "scalar", T: runtime_1.ScalarType.STRING },
            { no: 3, name: "left", kind: "message", T: () => exports.SyntaxTreeNodeHandler },
            { no: 4, name: "right", kind: "message", T: () => exports.SyntaxTreeNodeHandler },
            { no: 5, name: "valNumber", kind: "scalar", T: runtime_1.ScalarType.DOUBLE },
            { no: 6, name: "valString", kind: "scalar", T: runtime_1.ScalarType.STRING },
            { no: 7, name: "args", kind: "message", repeat: runtime_1.RepeatType.PACKED, T: () => exports.SyntaxTreeNodeHandler },
        ]);
        this.expression = expression;
        this.mod = mod;
        this.left = left;
        this.right = right;
        this.valNumber = valNumber;
        this.valString = valString;
        this.args = args;
    }
}
exports.SyntaxTreeNode = SyntaxTreeNode;
/**
 * 条件表达式
 *
 * @export
 * @interface PQExpressions
 */
class Expressions extends runtime_1.MessageType {
    /**
     * Creates an instance of PQExpressions.
     * @param {Array<SyntaxTree>} trees 条件表达式语法树集合
     * @memberof PQExpressions
     */
    constructor(trees, type) {
        super("PQExpressions", [
            { no: 1, name: "trees", kind: "message", repeat: runtime_1.RepeatType.PACKED, T: () => exports.SyntaxTreeHandler },
            { no: 2, name: "type", kind: "scalar", T: runtime_1.ScalarType.STRING },
        ]);
        this.trees = trees;
        this.type = type;
    }
}
exports.Expressions = Expressions;
/**
 * 条件表达式语法树
 *
 * @export
 * @interface PQIConditionSyntaxTree
 */
class SyntaxTree extends runtime_1.MessageType {
    /**
     * Creates an instance of PQIConditionSyntaxTree.
     * @param {Array<SyntaxTreeNode>} leafs 语法树叶子节点
     * @param {string} mod 模块
     * @memberof PQSyntaxTree
     */
    constructor(leafs, mod) {
        super("PQSyntaxTree", [
            { no: 1, name: "leafs", kind: "message", repeat: runtime_1.RepeatType.PACKED, T: () => exports.SyntaxTreeNodeHandler },
            { no: 2, name: "mod", kind: "scalar", T: runtime_1.ScalarType.STRING },
        ]);
        this.leafs = leafs;
        this.mod = mod;
    }
}
exports.SyntaxTree = SyntaxTree;
exports.ExpressionsHandler = new Expressions([], "condition");
exports.SyntaxTreeHandler = new SyntaxTree([], "");
exports.SyntaxTreeNodeHandler = new SyntaxTreeNode(ExpressionsToken.Unknown, "", void 0, void 0, 0, "", []);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvZXhwcmVzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0RBQTJFO0FBeUMzRTs7Ozs7R0FLRztBQUNILElBQVksZ0JBNkhYO0FBN0hELFdBQVksZ0JBQWdCO0lBQ3hCOztPQUVHO0lBQ0gsNkRBQVcsQ0FBQTtJQUVYOztPQUVHO0lBQ0gsbUVBQWMsQ0FBQTtJQUVkOztPQUVHO0lBQ0gsMkVBQWtCLENBQUE7SUFFbEI7O09BRUc7SUFDSCwwRUFBa0IsQ0FBQTtJQUVsQjs7T0FFRztJQUNILDBFQUFrQixDQUFBO0lBRWxCOztPQUVHO0lBQ0gsZ0ZBQXFCLENBQUE7SUFFckI7O09BRUc7SUFDSCxzRkFBd0IsQ0FBQTtJQUV4Qjs7T0FFRztJQUNILDRGQUEyQixDQUFBO0lBRTNCOztPQUVHO0lBQ0gsa0ZBQXNCLENBQUE7SUFFdEI7O09BRUc7SUFDSCw0RkFBMkIsQ0FBQTtJQUUzQjs7T0FFRztJQUNILGtFQUFjLENBQUE7SUFFZDs7T0FFRztJQUNILG9FQUFlLENBQUE7SUFFZjs7T0FFRztJQUNILDBFQUFrQixDQUFBO0lBRWxCOztPQUVHO0lBQ0gsb0VBQWUsQ0FBQTtJQUVmOztPQUVHO0lBQ0gsc0VBQWdCLENBQUE7SUFFaEI7O09BRUc7SUFDSCw4RUFBb0IsQ0FBQTtJQUVwQjs7T0FFRztJQUNILGdGQUFxQixDQUFBO0lBRXJCOztPQUVHO0lBQ0gsc0ZBQXdCLENBQUE7SUFFeEI7O09BRUc7SUFDSCxzR0FBZ0MsQ0FBQTtJQUVoQzs7T0FFRztJQUNILGdGQUFxQixDQUFBO0lBRXJCOztPQUVHO0lBQ0gsb0ZBQXVCLENBQUE7SUFFdkI7O09BRUc7SUFDSCxvRUFBZSxDQUFBO0lBRWY7O09BRUc7SUFDSCwrRkFBNkIsQ0FBQTtJQUU3Qjs7T0FFRztJQUNILDZFQUFvQixDQUFBO0lBRXBCOztPQUVHO0lBQ0gscUZBQXdC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LEVBQUU7WUFDbEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLDZCQUFxQixFQUFFO1lBQ3BHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLG9CQUFVLENBQUMsTUFBTSxFQUFFO1NBQy9ELENBQUMsQ0FBQztRQUptQixVQUFLLEdBQUwsS0FBSyxDQUF1QjtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFLMUUsQ0FBQztDQUNKO0FBYkQsZ0NBYUM7QUFFWSxRQUFBLGtCQUFrQixHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN0RCxRQUFBLGlCQUFpQixHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQyxRQUFBLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2VUeXBlLCBSZXBlYXRUeXBlLCBTY2FsYXJUeXBlIH0gZnJvbSBcIkBwcm90b2J1Zi10cy9ydW50aW1lXCI7XG5cblxudHlwZSBOdWxsYWJsZTxUPiA9IFQgfCB1bmRlZmluZWQgfCBudWxsO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTb3VyY2VUeXBlIHtcbiAgICAvKipcbiAgICAgKiDmnaHku7bnsbvlnotcbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIElTb3VyY2VUeXBlXG4gICAgICovXG4gICAgY29uZGl0aW9uOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiDlhazlvI/nsbvlnotcbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIElTb3VyY2VUeXBlXG4gICAgICovXG4gICAgZm9ybXVsYTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICog5Ye95pWw57G75Z6LXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBJU291cmNlVHlwZVxuICAgICAqL1xuICAgIGZuOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiDpmZDliLbnsbvlnotcbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIElTb3VyY2VUeXBlXG4gICAgICovXG4gICAgbGltaXQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgU291cmNlVHlwZSA9IGtleW9mIElTb3VyY2VUeXBlO1xuXG4vKipcbiAqIOihqOi+vuW8j+S7pOeJjFxuICpcbiAqIEBleHBvcnRcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBlbnVtIEV4cHJlc3Npb25zVG9rZW4ge1xuICAgIC8qKlxuICAgICAqIOacquefpVxuICAgICAqL1xuICAgIFVua25vd24gPSAwLFxuXG4gICAgLyoqXG4gICAgICog5qih5Z2XXG4gICAgICovXG4gICAgTW9kTGl0ZXJhbCA9IDEsXG5cbiAgICAvKipcbiAgICAgKiDmlbDlgLxcbiAgICAgKi9cbiAgICBOdW1lcmljTGl0ZXJhbCA9IDgsXG5cbiAgICAvKipcbiAgICAgKiDlrZfnrKbkuLJcbiAgICAgKi9cbiAgICBTdHJpbmdMaXRlcmFsID0gMTAsXG5cbiAgICAvKipcbiAgICAgKiDlsI/kuo5cbiAgICAgKi9cbiAgICBMZXNzVGhhblRva2VuID0gMjksXG5cbiAgICAvKipcbiAgICAgKiDlpKfkuo5cbiAgICAgKi9cbiAgICBHcmVhdGVyVGhhblRva2VuID0gMzEsXG5cbiAgICAvKipcbiAgICAgKiDlsI/kuo7nrYnkuo5cbiAgICAgKi9cbiAgICBMZXNzVGhhbkVxdWFsc1Rva2VuID0gMzIsXG5cbiAgICAvKipcbiAgICAgKiDlpKfkuo7nrYnkuo5cbiAgICAgKi9cbiAgICBHcmVhdGVyVGhhbkVxdWFsc1Rva2VuID0gMzMsXG5cbiAgICAvKipcbiAgICAgKiDnrYnkuI3nrYnkuo5cbiAgICAgKi9cbiAgICBFcXVhbHNFcXVhbHNUb2tlbiA9IDM0LFxuXG4gICAgLyoqXG4gICAgICog5LiN562J5LqOXG4gICAgICovXG4gICAgRXhjbGFtYXRpb25FcXVhbHNUb2tlbiA9IDM1LFxuXG4gICAgLyoqXG4gICAgICog5YqgXG4gICAgICovXG4gICAgUGx1c1Rva2VuID0gMzksXG5cbiAgICAvKipcbiAgICAgKiDotJ9cbiAgICAgKi9cbiAgICBNaW51c1Rva2VuID0gNDAsXG5cbiAgICAvKipcbiAgICAgKiDkuZhcbiAgICAgKi9cbiAgICBBc3Rlcmlza1Rva2VuID0gNDEsXG5cbiAgICAvKipcbiAgICAgKiDpmaRcbiAgICAgKi9cbiAgICBTbGFzaFRva2VuID0gNDMsXG5cbiAgICAvKipcbiAgICAgKiDnrYnkuo5cbiAgICAgKi9cbiAgICBFcXVhbHNUb2tlbiA9IDYyLFxuXG4gICAgLyoqXG4gICAgICog5Yqg562JXG4gICAgICovXG4gICAgUGx1c0VxdWFsc1Rva2VuID0gNjMsXG5cbiAgICAvKipcbiAgICAgKiDlh4/nrYlcbiAgICAgKi9cbiAgICBNaW51c0VxdWFsc1Rva2VuID0gNjQsXG5cbiAgICAvKipcbiAgICAgKiDkuZjnrYlcbiAgICAgKi9cbiAgICBBc3Rlcmlza0VxdWFsc1Rva2VuID0gNjUsXG5cbiAgICAvKipcbiAgICAgKiDluYIgTWF0aC5wb3cobGVmdCxyaWdodClcbiAgICAgKi9cbiAgICBBc3Rlcmlza0FzdGVyaXNrRXF1YWxzVG9rZW4gPSA2NixcblxuICAgIC8qKlxuICAgICAqIOmZpOetiVxuICAgICAqL1xuICAgIFNsYXNoRXF1YWxzVG9rZW4gPSA2NyxcblxuICAgIC8qKlxuICAgICAqIOaooeetiVxuICAgICAqL1xuICAgIFBlcmNlbnRFcXVhbHNUb2tlbiA9IDY4LFxuXG4gICAgLyoqXG4gICAgICog5qCH6K+G56ymXG4gICAgICovXG4gICAgSWRlbnRpZmllciA9IDc4LFxuXG4gICAgLyoqXG4gICAgICog5a+56LGh57G75Z6LXG4gICAgICovXG4gICAgT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24gPSAyMDAsXG5cbiAgICAvKipcbiAgICAgKiDlh73mlbDosIPnlKjooajovr7lvI9cbiAgICAgKi9cbiAgICBDYWxsRXhwcmVzc2lvbiA9IDIwMyxcblxuICAgIC8qKlxuICAgICAqIOWHveaVsOWll+Wog+iwg+eUqOihqOi+vuW8j1xuICAgICAqL1xuICAgIENhbGxDYWxsRXhwcmVzc2lvbiA9IDIwNCxcbn1cblxuLyoqXG4gKiDor63ms5XmoJHoioLngrlcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgU3ludGF4VHJlZU5vZGVcbiAqL1xuZXhwb3J0IGNsYXNzIFN5bnRheFRyZWVOb2RlIGV4dGVuZHMgTWVzc2FnZVR5cGU8RXhwcmVzc2lvbnM+IHtcbiAgICAvKipcbiAgICAgKiDliJvlu7rkuIDkuKror63ms5XmoJHoioLngrlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXhwcmVzc2lvbnNUb2tlbn0gZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWVOb2RlfSBsZWZ0XG4gICAgICogQHBhcmFtIHtTeW50YXhUcmVlTm9kZX0gcmlnaHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3ZhbFN0cmluZz1cIlwiXVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBTeW50YXhUcmVlTm9kZVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIGV4cHJlc3Npb246IEV4cHJlc3Npb25zVG9rZW4sXG4gICAgICAgIHB1YmxpYyBtb2Q6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGxlZnQ6IE51bGxhYmxlPFN5bnRheFRyZWVOb2RlPixcbiAgICAgICAgcHVibGljIHJpZ2h0OiBOdWxsYWJsZTxTeW50YXhUcmVlTm9kZT4sXG4gICAgICAgIHB1YmxpYyB2YWxOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcHVibGljIHZhbFN0cmluZzogc3RyaW5nID0gXCJcIixcbiAgICAgICAgcHVibGljIGFyZ3M6IFN5bnRheFRyZWVOb2RlW10sXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKFwiUFFTeW50YXhUcmVlTm9kZVwiLCBbXG4gICAgICAgICAgICB7IG5vOiAxLCBuYW1lOiBcImV4cHJlc3Npb25cIiwga2luZDogXCJlbnVtXCIsIFQ6ICgpID0+IFtcIlBRRXhwcmVzc2lvbnNUb2tlblwiLCBFeHByZXNzaW9uc1Rva2VuXSB9LFxuICAgICAgICAgICAgeyBubzogMiwgbmFtZTogXCJtb2RcIiwga2luZDogXCJzY2FsYXJcIiwgVDogU2NhbGFyVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICAgIHsgbm86IDMsIG5hbWU6IFwibGVmdFwiLCBraW5kOiBcIm1lc3NhZ2VcIiwgVDogKCkgPT4gU3ludGF4VHJlZU5vZGVIYW5kbGVyIH0sXG4gICAgICAgICAgICB7IG5vOiA0LCBuYW1lOiBcInJpZ2h0XCIsIGtpbmQ6IFwibWVzc2FnZVwiLCBUOiAoKSA9PiBTeW50YXhUcmVlTm9kZUhhbmRsZXIgfSxcbiAgICAgICAgICAgIHsgbm86IDUsIG5hbWU6IFwidmFsTnVtYmVyXCIsIGtpbmQ6IFwic2NhbGFyXCIsIFQ6IFNjYWxhclR5cGUuRE9VQkxFIH0sXG4gICAgICAgICAgICB7IG5vOiA2LCBuYW1lOiBcInZhbFN0cmluZ1wiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxuICAgICAgICAgICAgeyBubzogNywgbmFtZTogXCJhcmdzXCIsIGtpbmQ6IFwibWVzc2FnZVwiLCByZXBlYXQ6IFJlcGVhdFR5cGUuUEFDS0VELCBUOiAoKSA9PiBTeW50YXhUcmVlTm9kZUhhbmRsZXIgfSxcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG4vKipcbiAqIOadoeS7tuihqOi+vuW8j1xuICpcbiAqIEBleHBvcnRcbiAqIEBpbnRlcmZhY2UgUFFFeHByZXNzaW9uc1xuICovXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvbnMgZXh0ZW5kcyBNZXNzYWdlVHlwZTxFeHByZXNzaW9ucz4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgUFFFeHByZXNzaW9ucy5cbiAgICAgKiBAcGFyYW0ge0FycmF5PFN5bnRheFRyZWU+fSB0cmVlcyDmnaHku7booajovr7lvI/or63ms5XmoJHpm4blkIhcbiAgICAgKiBAbWVtYmVyb2YgUFFFeHByZXNzaW9uc1xuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwdWJsaWMgdHJlZXM6IEFycmF5PFN5bnRheFRyZWU+LCBwdWJsaWMgdHlwZTogU291cmNlVHlwZSkge1xuICAgICAgICBzdXBlcihcIlBRRXhwcmVzc2lvbnNcIiwgW1xuICAgICAgICAgICAgeyBubzogMSwgbmFtZTogXCJ0cmVlc1wiLCBraW5kOiBcIm1lc3NhZ2VcIiwgcmVwZWF0OiBSZXBlYXRUeXBlLlBBQ0tFRCwgVDogKCkgPT4gU3ludGF4VHJlZUhhbmRsZXIgfSxcbiAgICAgICAgICAgIHsgbm86IDIsIG5hbWU6IFwidHlwZVwiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbi8qKlxuICog5p2h5Lu26KGo6L6+5byP6K+t5rOV5qCRXG4gKlxuICogQGV4cG9ydFxuICogQGludGVyZmFjZSBQUUlDb25kaXRpb25TeW50YXhUcmVlXG4gKi9cbmV4cG9ydCBjbGFzcyBTeW50YXhUcmVlIGV4dGVuZHMgTWVzc2FnZVR5cGU8U3ludGF4VHJlZT4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgUFFJQ29uZGl0aW9uU3ludGF4VHJlZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5PFN5bnRheFRyZWVOb2RlPn0gbGVhZnMg6K+t5rOV5qCR5Y+25a2Q6IqC54K5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZCDmqKHlnZdcbiAgICAgKiBAbWVtYmVyb2YgUFFTeW50YXhUcmVlXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyBsZWFmczogQXJyYXk8U3ludGF4VHJlZU5vZGU+LCBwdWJsaWMgbW9kOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoXCJQUVN5bnRheFRyZWVcIiwgW1xuICAgICAgICAgICAgeyBubzogMSwgbmFtZTogXCJsZWFmc1wiLCBraW5kOiBcIm1lc3NhZ2VcIiwgcmVwZWF0OiBSZXBlYXRUeXBlLlBBQ0tFRCwgVDogKCkgPT4gU3ludGF4VHJlZU5vZGVIYW5kbGVyIH0sXG4gICAgICAgICAgICB7IG5vOiAyLCBuYW1lOiBcIm1vZFwiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBFeHByZXNzaW9uc0hhbmRsZXIgPSBuZXcgRXhwcmVzc2lvbnMoW10sIFwiY29uZGl0aW9uXCIpO1xuZXhwb3J0IGNvbnN0IFN5bnRheFRyZWVIYW5kbGVyID0gbmV3IFN5bnRheFRyZWUoW10sIFwiXCIpO1xuZXhwb3J0IGNvbnN0IFN5bnRheFRyZWVOb2RlSGFuZGxlciA9IG5ldyBTeW50YXhUcmVlTm9kZShFeHByZXNzaW9uc1Rva2VuLlVua25vd24sIFwiXCIsIHZvaWQgMCwgdm9pZCAwLCAwLCBcIlwiLCBbXSk7XG5cbiJdfQ==