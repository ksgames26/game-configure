import { MessageType, RepeatType, ScalarType } from "@protobuf-ts/runtime";


type Nullable<T> = T | undefined | null;

export interface ISourceType {
    /**
     * 条件类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    condition: string;

    /**
     * 公式类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    formula: string;

    /**
     * 函数类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    fn: string;

    /**
     * 限制类型
     *
     * @type {string}
     * @memberof ISourceType
     */
    limit: string;
}

export type SourceType = keyof ISourceType;

/**
 * 表达式令牌
 *
 * @export
 * @enum {number}
 */
export enum ExpressionsToken {
    /**
     * 未知
     */
    Unknown = 0,

    /**
     * 模块
     */
    ModLiteral = 1,

    /**
     * 数值
     */
    NumericLiteral = 8,

    /**
     * 字符串
     */
    StringLiteral = 10,

    /**
     * 小于
     */
    LessThanToken = 29,

    /**
     * 大于
     */
    GreaterThanToken = 31,

    /**
     * 小于等于
     */
    LessThanEqualsToken = 32,

    /**
     * 大于等于
     */
    GreaterThanEqualsToken = 33,

    /**
     * 等不等于
     */
    EqualsEqualsToken = 34,

    /**
     * 不等于
     */
    ExclamationEqualsToken = 35,

    /**
     * 加
     */
    PlusToken = 39,

    /**
     * 负
     */
    MinusToken = 40,

    /**
     * 乘
     */
    AsteriskToken = 41,

    /**
     * 除
     */
    SlashToken = 43,

    /**
     * 等于
     */
    EqualsToken = 62,

    /**
     * 加等
     */
    PlusEqualsToken = 63,

    /**
     * 减等
     */
    MinusEqualsToken = 64,

    /**
     * 乘等
     */
    AsteriskEqualsToken = 65,

    /**
     * 幂 Math.pow(left,right)
     */
    AsteriskAsteriskEqualsToken = 66,

    /**
     * 除等
     */
    SlashEqualsToken = 67,

    /**
     * 模等
     */
    PercentEqualsToken = 68,

    /**
     * 标识符
     */
    Identifier = 78,

    /**
     * 对象类型
     */
    ObjectLiteralExpression = 200,

    /**
     * 函数调用表达式
     */
    CallExpression = 203,

    /**
     * 函数套娃调用表达式
     */
    CallCallExpression = 204,
}

/**
 * 语法树节点
 *
 * @export
 * @class SyntaxTreeNode
 */
export class SyntaxTreeNode extends MessageType<Expressions> {
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
    public constructor(
        public expression: ExpressionsToken,
        public mod: string,
        public left: Nullable<SyntaxTreeNode>,
        public right: Nullable<SyntaxTreeNode>,
        public valNumber: number,
        public valString: string = "",
        public args: SyntaxTreeNode[],
    ) {
        super("PQSyntaxTreeNode", [
            { no: 1, name: "expression", kind: "enum", T: () => ["PQExpressionsToken", ExpressionsToken] },
            { no: 2, name: "mod", kind: "scalar", T: ScalarType.STRING },
            { no: 3, name: "left", kind: "message", T: () => SyntaxTreeNodeHandler },
            { no: 4, name: "right", kind: "message", T: () => SyntaxTreeNodeHandler },
            { no: 5, name: "valNumber", kind: "scalar", T: ScalarType.DOUBLE },
            { no: 6, name: "valString", kind: "scalar", T: ScalarType.STRING },
            { no: 7, name: "args", kind: "message", repeat: RepeatType.PACKED, T: () => SyntaxTreeNodeHandler },
        ]);
    }
}

/**
 * 条件表达式
 *
 * @export
 * @interface PQExpressions
 */
export class Expressions extends MessageType<Expressions> {
    /**
     * Creates an instance of PQExpressions.
     * @param {Array<SyntaxTree>} trees 条件表达式语法树集合
     * @memberof PQExpressions
     */
    public constructor(public trees: Array<SyntaxTree>, public type: SourceType) {
        super("PQExpressions", [
            { no: 1, name: "trees", kind: "message", repeat: RepeatType.PACKED, T: () => SyntaxTreeHandler },
            { no: 2, name: "type", kind: "scalar", T: ScalarType.STRING },
        ]);
    }
}

/**
 * 条件表达式语法树
 *
 * @export
 * @interface PQIConditionSyntaxTree
 */
export class SyntaxTree extends MessageType<SyntaxTree> {
    /**
     * Creates an instance of PQIConditionSyntaxTree.
     * @param {Array<SyntaxTreeNode>} leafs 语法树叶子节点
     * @param {string} mod 模块
     * @memberof PQSyntaxTree
     */
    public constructor(public leafs: Array<SyntaxTreeNode>, public mod: string) {
        super("PQSyntaxTree", [
            { no: 1, name: "leafs", kind: "message", repeat: RepeatType.PACKED, T: () => SyntaxTreeNodeHandler },
            { no: 2, name: "mod", kind: "scalar", T: ScalarType.STRING },
        ]);
    }
}

export const ExpressionsHandler = new Expressions([], "condition");
export const SyntaxTreeHandler = new SyntaxTree([], "");
export const SyntaxTreeNodeHandler = new SyntaxTreeNode(ExpressionsToken.Unknown, "", void 0, void 0, 0, "", []);

