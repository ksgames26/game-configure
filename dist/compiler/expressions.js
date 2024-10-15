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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvZXhwcmVzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0RBQTJFO0FBeUMzRTs7Ozs7R0FLRztBQUNILElBQVksZ0JBNkhYO0FBN0hELFdBQVksZ0JBQWdCO0lBQ3hCOztPQUVHO0lBQ0gsNkRBQVcsQ0FBQTtJQUVYOztPQUVHO0lBQ0gsbUVBQWMsQ0FBQTtJQUVkOztPQUVHO0lBQ0gsMkVBQWtCLENBQUE7SUFFbEI7O09BRUc7SUFDSCwwRUFBa0IsQ0FBQTtJQUVsQjs7T0FFRztJQUNILDBFQUFrQixDQUFBO0lBRWxCOztPQUVHO0lBQ0gsZ0ZBQXFCLENBQUE7SUFFckI7O09BRUc7SUFDSCxzRkFBd0IsQ0FBQTtJQUV4Qjs7T0FFRztJQUNILDRGQUEyQixDQUFBO0lBRTNCOztPQUVHO0lBQ0gsa0ZBQXNCLENBQUE7SUFFdEI7O09BRUc7SUFDSCw0RkFBMkIsQ0FBQTtJQUUzQjs7T0FFRztJQUNILGtFQUFjLENBQUE7SUFFZDs7T0FFRztJQUNILG9FQUFlLENBQUE7SUFFZjs7T0FFRztJQUNILDBFQUFrQixDQUFBO0lBRWxCOztPQUVHO0lBQ0gsb0VBQWUsQ0FBQTtJQUVmOztPQUVHO0lBQ0gsc0VBQWdCLENBQUE7SUFFaEI7O09BRUc7SUFDSCw4RUFBb0IsQ0FBQTtJQUVwQjs7T0FFRztJQUNILGdGQUFxQixDQUFBO0lBRXJCOztPQUVHO0lBQ0gsc0ZBQXdCLENBQUE7SUFFeEI7O09BRUc7SUFDSCxzR0FBZ0MsQ0FBQTtJQUVoQzs7T0FFRztJQUNILGdGQUFxQixDQUFBO0lBRXJCOztPQUVHO0lBQ0gsb0ZBQXVCLENBQUE7SUFFdkI7O09BRUc7SUFDSCxvRUFBZSxDQUFBO0lBRWY7O09BRUc7SUFDSCwrRkFBNkIsQ0FBQTtJQUU3Qjs7T0FFRztJQUNILDZFQUFvQixDQUFBO0lBRXBCOztPQUVHO0lBQ0gscUZBQXdC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LEVBQUU7WUFDbEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLDZCQUFxQixFQUFFO1lBQ3BHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLG9CQUFVLENBQUMsTUFBTSxFQUFFO1NBQy9ELENBQUMsQ0FBQztRQUptQixVQUFLLEdBQUwsS0FBSyxDQUF1QjtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFLMUUsQ0FBQztDQUNKO0FBYkQsZ0NBYUM7QUFFWSxRQUFBLGtCQUFrQixHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN0RCxRQUFBLGlCQUFpQixHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQyxRQUFBLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2VUeXBlLCBSZXBlYXRUeXBlLCBTY2FsYXJUeXBlIH0gZnJvbSBcIkBwcm90b2J1Zi10cy9ydW50aW1lXCI7XHJcblxyXG5cclxudHlwZSBOdWxsYWJsZTxUPiA9IFQgfCB1bmRlZmluZWQgfCBudWxsO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU291cmNlVHlwZSB7XHJcbiAgICAvKipcclxuICAgICAqIOadoeS7tuexu+Wei1xyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgSVNvdXJjZVR5cGVcclxuICAgICAqL1xyXG4gICAgY29uZGl0aW9uOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhazlvI/nsbvlnotcclxuICAgICAqXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIElTb3VyY2VUeXBlXHJcbiAgICAgKi9cclxuICAgIGZvcm11bGE6IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWHveaVsOexu+Wei1xyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgSVNvdXJjZVR5cGVcclxuICAgICAqL1xyXG4gICAgZm46IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmZkOWItuexu+Wei1xyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgSVNvdXJjZVR5cGVcclxuICAgICAqL1xyXG4gICAgbGltaXQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgU291cmNlVHlwZSA9IGtleW9mIElTb3VyY2VUeXBlO1xyXG5cclxuLyoqXHJcbiAqIOihqOi+vuW8j+S7pOeJjFxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEBlbnVtIHtudW1iZXJ9XHJcbiAqL1xyXG5leHBvcnQgZW51bSBFeHByZXNzaW9uc1Rva2VuIHtcclxuICAgIC8qKlxyXG4gICAgICog5pyq55+lXHJcbiAgICAgKi9cclxuICAgIFVua25vd24gPSAwLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qih5Z2XXHJcbiAgICAgKi9cclxuICAgIE1vZExpdGVyYWwgPSAxLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pWw5YC8XHJcbiAgICAgKi9cclxuICAgIE51bWVyaWNMaXRlcmFsID0gOCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWtl+espuS4slxyXG4gICAgICovXHJcbiAgICBTdHJpbmdMaXRlcmFsID0gMTAsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsI/kuo5cclxuICAgICAqL1xyXG4gICAgTGVzc1RoYW5Ub2tlbiA9IDI5LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aSn5LqOXHJcbiAgICAgKi9cclxuICAgIEdyZWF0ZXJUaGFuVG9rZW4gPSAzMSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwj+S6juetieS6jlxyXG4gICAgICovXHJcbiAgICBMZXNzVGhhbkVxdWFsc1Rva2VuID0gMzIsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlpKfkuo7nrYnkuo5cclxuICAgICAqL1xyXG4gICAgR3JlYXRlclRoYW5FcXVhbHNUb2tlbiA9IDMzLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog562J5LiN562J5LqOXHJcbiAgICAgKi9cclxuICAgIEVxdWFsc0VxdWFsc1Rva2VuID0gMzQsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkuI3nrYnkuo5cclxuICAgICAqL1xyXG4gICAgRXhjbGFtYXRpb25FcXVhbHNUb2tlbiA9IDM1LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YqgXHJcbiAgICAgKi9cclxuICAgIFBsdXNUb2tlbiA9IDM5LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6LSfXHJcbiAgICAgKi9cclxuICAgIE1pbnVzVG9rZW4gPSA0MCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOS5mFxyXG4gICAgICovXHJcbiAgICBBc3Rlcmlza1Rva2VuID0gNDEsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpmaRcclxuICAgICAqL1xyXG4gICAgU2xhc2hUb2tlbiA9IDQzLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog562J5LqOXHJcbiAgICAgKi9cclxuICAgIEVxdWFsc1Rva2VuID0gNjIsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqDnrYlcclxuICAgICAqL1xyXG4gICAgUGx1c0VxdWFsc1Rva2VuID0gNjMsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlh4/nrYlcclxuICAgICAqL1xyXG4gICAgTWludXNFcXVhbHNUb2tlbiA9IDY0LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LmY562JXHJcbiAgICAgKi9cclxuICAgIEFzdGVyaXNrRXF1YWxzVG9rZW4gPSA2NSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOW5giBNYXRoLnBvdyhsZWZ0LHJpZ2h0KVxyXG4gICAgICovXHJcbiAgICBBc3Rlcmlza0FzdGVyaXNrRXF1YWxzVG9rZW4gPSA2NixcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmZpOetiVxyXG4gICAgICovXHJcbiAgICBTbGFzaEVxdWFsc1Rva2VuID0gNjcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHnrYlcclxuICAgICAqL1xyXG4gICAgUGVyY2VudEVxdWFsc1Rva2VuID0gNjgsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoIfor4bnrKZcclxuICAgICAqL1xyXG4gICAgSWRlbnRpZmllciA9IDc4LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a+56LGh57G75Z6LXHJcbiAgICAgKi9cclxuICAgIE9iamVjdExpdGVyYWxFeHByZXNzaW9uID0gMjAwLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Ye95pWw6LCD55So6KGo6L6+5byPXHJcbiAgICAgKi9cclxuICAgIENhbGxFeHByZXNzaW9uID0gMjAzLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Ye95pWw5aWX5aiD6LCD55So6KGo6L6+5byPXHJcbiAgICAgKi9cclxuICAgIENhbGxDYWxsRXhwcmVzc2lvbiA9IDIwNCxcclxufVxyXG5cclxuLyoqXHJcbiAqIOivreazleagkeiKgueCuVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEBjbGFzcyBTeW50YXhUcmVlTm9kZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN5bnRheFRyZWVOb2RlIGV4dGVuZHMgTWVzc2FnZVR5cGU8RXhwcmVzc2lvbnM+IHtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65LiA5Liq6K+t5rOV5qCR6IqC54K5XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtFeHByZXNzaW9uc1Rva2VufSBleHByZXNzaW9uXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kXHJcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWVOb2RlfSBsZWZ0XHJcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWVOb2RlfSByaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt2YWxTdHJpbmc9XCJcIl1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfVxyXG4gICAgICogQG1lbWJlcm9mIFN5bnRheFRyZWVOb2RlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgZXhwcmVzc2lvbjogRXhwcmVzc2lvbnNUb2tlbixcclxuICAgICAgICBwdWJsaWMgbW9kOiBzdHJpbmcsXHJcbiAgICAgICAgcHVibGljIGxlZnQ6IE51bGxhYmxlPFN5bnRheFRyZWVOb2RlPixcclxuICAgICAgICBwdWJsaWMgcmlnaHQ6IE51bGxhYmxlPFN5bnRheFRyZWVOb2RlPixcclxuICAgICAgICBwdWJsaWMgdmFsTnVtYmVyOiBudW1iZXIsXHJcbiAgICAgICAgcHVibGljIHZhbFN0cmluZzogc3RyaW5nID0gXCJcIixcclxuICAgICAgICBwdWJsaWMgYXJnczogU3ludGF4VHJlZU5vZGVbXSxcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKFwiUFFTeW50YXhUcmVlTm9kZVwiLCBbXHJcbiAgICAgICAgICAgIHsgbm86IDEsIG5hbWU6IFwiZXhwcmVzc2lvblwiLCBraW5kOiBcImVudW1cIiwgVDogKCkgPT4gW1wiUFFFeHByZXNzaW9uc1Rva2VuXCIsIEV4cHJlc3Npb25zVG9rZW5dIH0sXHJcbiAgICAgICAgICAgIHsgbm86IDIsIG5hbWU6IFwibW9kXCIsIGtpbmQ6IFwic2NhbGFyXCIsIFQ6IFNjYWxhclR5cGUuU1RSSU5HIH0sXHJcbiAgICAgICAgICAgIHsgbm86IDMsIG5hbWU6IFwibGVmdFwiLCBraW5kOiBcIm1lc3NhZ2VcIiwgVDogKCkgPT4gU3ludGF4VHJlZU5vZGVIYW5kbGVyIH0sXHJcbiAgICAgICAgICAgIHsgbm86IDQsIG5hbWU6IFwicmlnaHRcIiwga2luZDogXCJtZXNzYWdlXCIsIFQ6ICgpID0+IFN5bnRheFRyZWVOb2RlSGFuZGxlciB9LFxyXG4gICAgICAgICAgICB7IG5vOiA1LCBuYW1lOiBcInZhbE51bWJlclwiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLkRPVUJMRSB9LFxyXG4gICAgICAgICAgICB7IG5vOiA2LCBuYW1lOiBcInZhbFN0cmluZ1wiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxyXG4gICAgICAgICAgICB7IG5vOiA3LCBuYW1lOiBcImFyZ3NcIiwga2luZDogXCJtZXNzYWdlXCIsIHJlcGVhdDogUmVwZWF0VHlwZS5QQUNLRUQsIFQ6ICgpID0+IFN5bnRheFRyZWVOb2RlSGFuZGxlciB9LFxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5p2h5Lu26KGo6L6+5byPXHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQGludGVyZmFjZSBQUUV4cHJlc3Npb25zXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvbnMgZXh0ZW5kcyBNZXNzYWdlVHlwZTxFeHByZXNzaW9ucz4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFBRRXhwcmVzc2lvbnMuXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5PFN5bnRheFRyZWU+fSB0cmVlcyDmnaHku7booajovr7lvI/or63ms5XmoJHpm4blkIhcclxuICAgICAqIEBtZW1iZXJvZiBQUUV4cHJlc3Npb25zXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwdWJsaWMgdHJlZXM6IEFycmF5PFN5bnRheFRyZWU+LCBwdWJsaWMgdHlwZTogU291cmNlVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKFwiUFFFeHByZXNzaW9uc1wiLCBbXHJcbiAgICAgICAgICAgIHsgbm86IDEsIG5hbWU6IFwidHJlZXNcIiwga2luZDogXCJtZXNzYWdlXCIsIHJlcGVhdDogUmVwZWF0VHlwZS5QQUNLRUQsIFQ6ICgpID0+IFN5bnRheFRyZWVIYW5kbGVyIH0sXHJcbiAgICAgICAgICAgIHsgbm86IDIsIG5hbWU6IFwidHlwZVwiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5p2h5Lu26KGo6L6+5byP6K+t5rOV5qCRXHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQGludGVyZmFjZSBQUUlDb25kaXRpb25TeW50YXhUcmVlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3ludGF4VHJlZSBleHRlbmRzIE1lc3NhZ2VUeXBlPFN5bnRheFRyZWU+IHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBQUUlDb25kaXRpb25TeW50YXhUcmVlLlxyXG4gICAgICogQHBhcmFtIHtBcnJheTxTeW50YXhUcmVlTm9kZT59IGxlYWZzIOivreazleagkeWPtuWtkOiKgueCuVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZCDmqKHlnZdcclxuICAgICAqIEBtZW1iZXJvZiBQUVN5bnRheFRyZWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyBsZWFmczogQXJyYXk8U3ludGF4VHJlZU5vZGU+LCBwdWJsaWMgbW9kOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcihcIlBRU3ludGF4VHJlZVwiLCBbXHJcbiAgICAgICAgICAgIHsgbm86IDEsIG5hbWU6IFwibGVhZnNcIiwga2luZDogXCJtZXNzYWdlXCIsIHJlcGVhdDogUmVwZWF0VHlwZS5QQUNLRUQsIFQ6ICgpID0+IFN5bnRheFRyZWVOb2RlSGFuZGxlciB9LFxyXG4gICAgICAgICAgICB7IG5vOiAyLCBuYW1lOiBcIm1vZFwiLCBraW5kOiBcInNjYWxhclwiLCBUOiBTY2FsYXJUeXBlLlNUUklORyB9LFxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgRXhwcmVzc2lvbnNIYW5kbGVyID0gbmV3IEV4cHJlc3Npb25zKFtdLCBcImNvbmRpdGlvblwiKTtcclxuZXhwb3J0IGNvbnN0IFN5bnRheFRyZWVIYW5kbGVyID0gbmV3IFN5bnRheFRyZWUoW10sIFwiXCIpO1xyXG5leHBvcnQgY29uc3QgU3ludGF4VHJlZU5vZGVIYW5kbGVyID0gbmV3IFN5bnRheFRyZWVOb2RlKEV4cHJlc3Npb25zVG9rZW4uVW5rbm93biwgXCJcIiwgdm9pZCAwLCB2b2lkIDAsIDAsIFwiXCIsIFtdKTtcclxuXHJcbiJdfQ==