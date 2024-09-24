/**
 *  用来解析抽象配置表里面的表达式
 *
 *  typescript 编译器关键词枚举映射 https://github.com/microsoft/TypeScript/blob/master/src/compiler/scanner.ts#L160
 */

import { assert } from "@protobuf-ts/runtime";
import { ts } from "ts-morph";
import { Expressions, ExpressionsToken, SourceType, SyntaxTree, SyntaxTreeNode } from "./expressions";

/**
 * condition 条件表达式
 *
 * 条件表达式:
 *
 * 表达式操作符类别:
 *
 * 比较操作符   (大于)>,(大于等于)>=,(小于)<,(小于等于)<=,(等不等于)==,(不等于)!=
 * 功能:用来进行比较
 *
 * 计算操作符   (乘等)*=,(除等)/=,(幂等)**=,(加等)+=,(减等)-=,(模等)%=
 * 功能:用来和原值进行计算
 *
 * 分隔符       (分号);
 * 功能:用来表示多表达式
 *
 *
 * @example
 * ```ts
 * item(id==1)
 * 表示找item模块里面id为1的item
 *
 * item(id==1,count-=50)
 * 表示找item模块里面id为1的item,并和这个item的属性count原值进行计算,减去50
 *
 * item(id==1,count*=50)
 * 表示找item模块里面id为1的item,并和这个item的属性count原值进行计算,乘以50
 *
 * item(id==1,count*=50);item(id==2,count/=50)
 * 表示找item模块里面id为1的item,并和这个item的属性count原值进行计算,乘以50,继续找找item模块里面id为2的item,并和这个item的属性count原值进行计算,除以50
 * ```
 *
 *
 * formula 公式表达式
 *
 * 支持加减乘除余函数模块属性等各种复杂计算公式
 *
 * @example
 * ```ts
 * 64+((hero.level)-1)*8.49+getSkillLevel(1)*1.01+getSkillLevel(3)*0.34+getSkillLevel(2)*0.34
 *
 * (270+(get(hero.level)-1)*35.82+get(hero.lmp)*0.34+get(hero.mmp)*0.51+yxjn(get(skill.nowNeiGongSkillId),hpcoe))*(get(hero.basecon)+0.5*get(hero.con))*0.01"
 * ```
 */

/**
 * 编译器
 *
 * @class Compiler
 */
class Compiler {
    private _source: string;
    private _sf: ts.SourceFile;
    private _type: SourceType;
    private _root: Expressions;

    public getRoot(): Expressions {
        return this._root;
    }

    public constructor(source: string, type: SourceType) {
        this._source = source;
        this._type = type;
        this._root = new Expressions([], type);
        this._sf = ts.createSourceFile("", source + "", ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);
    }

    public complie(): Expressions {
        const sf = this._sf;

        if (this._type == "condition" || this._type == "limit") {
            // 解析表达式
            sf.statements.forEach(node =>
                this.compileMod(
                    new SyntaxTree([], ""),
                    (node as ts.ExpressionStatement).expression as ts.CallExpression,
                ),
            );
        } else if (this._type == "formula" || this._type == "fn") {
            // 解析公式
            sf.statements.forEach(node =>
                this.preOrder(new SyntaxTree([], ""), (node as ts.ExpressionStatement).expression),
            );
        }

        return this._root;
    }

    /**
     * 前序遍历
     *
     * @param {SyntaxTree} tree
     * @param {ts.Expression} root
     * @return {*}  {SyntaxTreeNode}
     * @memberof Compiler
     */
    public preOrder(tree: SyntaxTree, root: ts.Expression): SyntaxTreeNode {
        let res: SyntaxTreeNode = new SyntaxTreeNode(ExpressionsToken.Unknown, "", void 0, void 0, 0, "", []);
        this._root.trees.push(tree);

        const preOrderImpl = (cur: ts.Expression | null, parent: SyntaxTreeNode, first: boolean, isleft: boolean) => {
            if (!cur) {
                return;
            }

            let left: ts.Expression;
            let right: ts.Expression;
            let p: SyntaxTreeNode;

            switch (cur.kind) {
                case ts.SyntaxKind.PropertyAccessExpression: {
                    const n = new SyntaxTreeNode(
                        ExpressionsToken.ModLiteral,
                        ((cur as ts.PropertyAccessExpression).expression as ts.Identifier).escapedText as string,
                        void 0,
                        void 0,
                        0,
                        ((cur as ts.PropertyAccessExpression).name as ts.Identifier).escapedText as string,
                        [],
                    );
                    isleft ? (parent.left = n) : (parent.right = n);
                    break;
                }
                case ts.SyntaxKind.BinaryExpression: {
                    // 解析+-*/
                    switch ((cur as ts.BinaryExpression).operatorToken.kind) {
                        case ts.SyntaxKind.PlusToken:
                        case ts.SyntaxKind.MinusToken:
                        case ts.SyntaxKind.AsteriskToken:
                        case ts.SyntaxKind.SlashToken: {
                            // 当且仅当解析公式的时候从这个进
                            if (first) {
                                parent.expression = ((cur as ts.BinaryExpression).operatorToken
                                    .kind as unknown) as ExpressionsToken;

                                p = parent;
                            } else {
                                const n = new SyntaxTreeNode(
                                    ((cur as ts.BinaryExpression).operatorToken.kind as unknown) as ExpressionsToken,
                                    "",
                                    void 0,
                                    void 0,
                                    0,
                                    "",
                                    [],
                                );
                                isleft ? (parent.left = n) : (parent.right = n);
                                p = n;
                            }

                            left = (cur as ts.BinaryExpression).left;
                            right = (cur as ts.BinaryExpression).right;
                            break;
                        }
                        default:
                            assert(true, "公式暂不支持当前表达式:" + (cur as ts.BinaryExpression).operatorToken.kind);
                    }

                    break;
                }
                // 解析数值
                case ts.SyntaxKind.NumericLiteral: {
                    if (first) {
                        parent.expression = (ts.SyntaxKind.NumericLiteral as unknown) as ExpressionsToken;
                        parent.valNumber = +(cur as ts.Identifier).text;
                    } else {
                        const n = new SyntaxTreeNode(
                            (cur.kind as unknown) as ExpressionsToken,
                            "",
                            void 0,
                            void 0,
                            +(cur as ts.Identifier).text,
                            "",
                            [],
                        );
                        isleft ? (parent.left = n) : (parent.right = n);
                    }
                    break;
                }
                // 解析字符串
                case ts.SyntaxKind.StringLiteral: {
                    assert(first, "语法解析错误");

                    const n = new SyntaxTreeNode(
                        (cur.kind as unknown) as ExpressionsToken,
                        "",
                        void 0,
                        void 0,
                        0,
                        (cur as ts.Identifier).text,
                        [],
                    );
                    isleft ? (parent.left = n) : (parent.right = n);
                    break;
                }
                // 解析()括号
                case ts.SyntaxKind.ParenthesizedExpression: {
                    assert(first, "语法解析错误");

                    // 括号里面可能是二叉树
                    switch ((cur as ts.ParenthesizedExpression).expression.kind) {
                        case ts.SyntaxKind.BinaryExpression:
                            const n = new SyntaxTreeNode(
                                (((cur as ts.ParenthesizedExpression).expression as ts.BinaryExpression).operatorToken
                                    .kind as unknown) as ExpressionsToken,
                                "",
                                void 0,
                                void 0,
                                0,
                                "",
                                [],
                            );
                            isleft ? (parent.left = n) : (parent.right = n);

                            left = ((cur as ts.ParenthesizedExpression).expression as ts.BinaryExpression).left;
                            right = ((cur as ts.ParenthesizedExpression).expression as ts.BinaryExpression).right;
                            p = n;
                            break;
                        // 可能是取属性
                        case ts.SyntaxKind.PropertyAccessExpression: {
                            // 模块
                            const escapedText = (((cur as ts.ParenthesizedExpression)
                                .expression as ts.PropertyAccessExpression).expression as ts.Identifier).escapedText;
                            // 属性
                            const prototype = (((cur as ts.ParenthesizedExpression)
                                .expression as ts.PropertyAccessExpression).name as ts.Identifier).escapedText;

                            const n = new SyntaxTreeNode(
                                ExpressionsToken.ModLiteral,
                                "",
                                void 0,
                                void 0,
                                0,
                                "",
                                [],
                            );
                            const l = new SyntaxTreeNode(
                                ExpressionsToken.StringLiteral,
                                "",
                                void 0,
                                void 0,
                                0,
                                escapedText as string,
                                [],
                            );
                            const r = new SyntaxTreeNode(
                                ExpressionsToken.StringLiteral,
                                "",
                                void 0,
                                void 0,
                                0,
                                prototype as string,
                                [],
                            );
                            isleft ? (parent.left = n) : (parent.right = n);

                            n.left = l;
                            n.right = r;
                            break;
                        }
                        default:
                            assert(true, "圆括号表达式里面暂不支持其他类型:" + cur.kind);
                    }
                    break;
                }
                case ts.SyntaxKind.CallExpression: {
                    const args = (cur as ts.CallExpression).arguments;
                    const n = this.parseMethode(
                        ((cur as ts.CallExpression).expression as ts.Identifier).escapedText as string,
                        args,
                    );
                    // 当且仅当解析函数的的时候从这个进
                    if (first) {
                        res = n;
                    } else {
                        isleft ? (parent.left = n) : (parent.right = n);
                    }

                    break;
                }
                default:
                    assert(true, "公式暂不支持当前表达式:" + cur.kind);
            }
            preOrderImpl(left!, p!, false, true);
            preOrderImpl(right!, p!, false, false);
        };

        preOrderImpl(root, res, true, false);
        tree.leafs.push(res);
        return res!;
    }

    /**
     * 编译模块
     *
     * @param {ts.Node} node
     * @memberof ConditionCompiler
     */
    public compileMod(tree: SyntaxTree, node: ts.CallExpression): void {
        if (node == null) {
            return;
        }
        this._root.trees.push(tree);
        const mod = (node.expression as ts.Identifier).kind == ts.SyntaxKind.Identifier;
        if (node.kind == ts.SyntaxKind.CallExpression && mod) {
            // 设置模块名称
            tree.mod = (node.expression as ts.Identifier).escapedText as string;
            // 再看看用了哪些参数
            this.compileArgs(tree, (node.arguments as unknown) as ts.Node[]);
            return;
        }

        assert(true, "条件表达式格式不正确,模块写法不正确");
    }

    /**
     * 编译参数
     *
     * @param {SyntaxTree} tree
     * @param {ts.Node[]} args
     * @memberof ConditionCompiler
     */
    public compileArgs(tree: SyntaxTree, args: ts.Node[]) {
        args.forEach(arg => {
            const leaf = new SyntaxTreeNode(
                ExpressionsToken.EqualsEqualsToken,
                tree.mod,
                void 0,
                void 0,
                0,
                "",
                [],
            );
            tree.leafs.push(leaf);
            switch (arg.kind) {
                case ts.SyntaxKind.BinaryExpression:
                    // 看看是什么符号
                    const operator = (arg as ts.BinaryExpression).operatorToken;
                    leaf.expression = (operator.kind as unknown) as ExpressionsToken;

                    this.generatorNode(leaf, (arg as ts.BinaryExpression).left, true);
                    this.generatorNode(leaf, (arg as ts.BinaryExpression).right, false);
                    break;
                default:
                    assert(true, "条件表达式格式不正确,模块参数不正确");
            }
        });
    }

    /**
     * 构造函数
     *
     * @param {SyntaxTreeNode} leaf
     * @param {ts.Node} node
     * @param {boolean} left
     * @memberof ConditionCompiler
     */
    public generatorNode(leaf: SyntaxTreeNode, node: ts.Node, left: boolean): void {
        switch (node.kind) {
            case ts.SyntaxKind.NumericLiteral: {
                const child = new SyntaxTreeNode(
                    ExpressionsToken.NumericLiteral,
                    leaf.mod,
                    void 0,
                    void 0,
                    +(node as ts.Identifier).text,
                    "",
                    [],
                );
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts.SyntaxKind.StringLiteral: {
                const child = new SyntaxTreeNode(
                    ExpressionsToken.StringLiteral,
                    leaf.mod,
                    void 0,
                    void 0,
                    0,
                    (node as ts.Identifier).text,
                    [],
                );
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts.SyntaxKind.Identifier: {
                const child = new SyntaxTreeNode(
                    ExpressionsToken.Identifier,
                    leaf.mod,
                    void 0,
                    void 0,
                    0,
                    (node as ts.Identifier).escapedText as string,
                    [],
                );
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts.SyntaxKind.CallExpression: {
                const args = (node as ts.CallExpression).arguments;
                const child = this.parseMethode(
                    ((node as ts.CallExpression).expression as ts.Identifier).escapedText as string,
                    args,
                );
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            default:
                assert(true, "当前表达式暂不支持");
        }
    }

    /**
     * 解析函数
     *
     * @param {string} escapedText 函数名
     * @param {ts.NodeArray<ts.Expression>} args 函数参数
     * @return {SyntaxTreeNode}  {SyntaxTreeNode}
     * @memberof Compiler
     */
    public parseMethode(escapedText: string, args: ts.NodeArray<ts.Expression>): SyntaxTreeNode {
        const child = new SyntaxTreeNode(ExpressionsToken.CallExpression, escapedText, void 0, void 0, 0, "", []);
        args.forEach(arg => {
            switch (arg.kind) {
                case ts.SyntaxKind.NumericLiteral: {
                    const l = new SyntaxTreeNode(
                        ExpressionsToken.NumericLiteral,
                        "",
                        void 0,
                        void 0,
                        +(arg as ts.Identifier).text,
                        "",
                        [],
                    );
                    child.args.push(l);
                    break;
                }
                case ts.SyntaxKind.Identifier:
                case ts.SyntaxKind.StringLiteral: {
                    const l = new SyntaxTreeNode(
                        ExpressionsToken.StringLiteral,
                        "",
                        void 0,
                        void 0,
                        0,
                        (arg as ts.Identifier).text,
                        [],
                    );
                    child.args.push(l);
                    break;
                }
                case ts.SyntaxKind.PropertyAccessExpression: {
                    assert(
                        (arg as ts.PropertyAccessExpression).expression.kind != ts.SyntaxKind.Identifier,
                        "当前函数参数类型暂未实现",
                    );

                    const l = new SyntaxTreeNode(
                        ExpressionsToken.ModLiteral,
                        ((arg as ts.PropertyAccessExpression).expression as ts.Identifier).escapedText as string,
                        void 0,
                        void 0,
                        0,
                        ((arg as ts.PropertyAccessExpression).name as ts.Identifier).escapedText as string,
                        [],
                    );
                    child.args.push(l);
                    break;
                }
                case ts.SyntaxKind.CallExpression: {
                    child.expression = ExpressionsToken.CallCallExpression;
                    // 对于函数参数是函数调用时
                    // 我们总是把作为参数的函数放在父节点的左边
                    const l = this.parseMethode(
                        ((arg as ts.CallExpression).expression as ts.Identifier).escapedText as string,
                        (arg as ts.CallExpression).arguments,
                    );
                    child.args.push(l);
                    break;
                }
                case ts.SyntaxKind.ObjectLiteralExpression: {
                    const l = new SyntaxTreeNode(
                        ExpressionsToken.ObjectLiteralExpression,
                        "",
                        void 0,
                        void 0,
                        0,
                        "",
                        [],
                    );
                    let n = "{";
                    const properties = ((arg as ts.ObjectLiteralExpression)
                        .properties as unknown) as ts.PropertyAssignment[];
                    properties.forEach((propertie, index) => {
                        n += '"' + (propertie.name as ts.Identifier).escapedText + '"';
                        n += ":";

                        if (propertie.initializer.kind == ts.SyntaxKind.NumericLiteral) {
                        }

                        switch (propertie.initializer.kind) {
                            case ts.SyntaxKind.NumericLiteral:
                                n += +(propertie.initializer as ts.StringLiteral).text;
                                break;
                            case ts.SyntaxKind.StringLiteral:
                                n += +'"' + (propertie.initializer as ts.StringLiteral).text + '"';
                                break;
                            case ts.SyntaxKind.PrefixUnaryExpression:
                                n += ((propertie.initializer as ts.PrefixUnaryExpression).operand as ts.Identifier)
                                    .text;
                                break;
                            default:
                                assert(true, "对象类型不支持当前表达式:" + propertie.initializer.kind);
                        }

                        if (index < properties.length - 1) {
                            n += ",";
                        }
                    });
                    n += "}";
                    l.valString = n;
                    child.args.push(l);
                    break;
                }
                default:
                    assert(true, "当前函数参数类型暂未实现");
            }
        });
        return child;
    }
}

export function compile(source: string, type: SourceType): Expressions {
    const compiler = new Compiler(source, type);
    return compiler.complie();
}
