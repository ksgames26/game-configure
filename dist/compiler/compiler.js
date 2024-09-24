"use strict";
/**
 *  用来解析抽象配置表里面的表达式
 *
 *  typescript 编译器关键词枚举映射 https://github.com/microsoft/TypeScript/blob/master/src/compiler/scanner.ts#L160
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const ts_morph_1 = require("ts-morph");
const expressions_1 = require("./expressions");
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
    getRoot() {
        return this._root;
    }
    constructor(source, type) {
        this._source = source;
        this._type = type;
        this._root = new expressions_1.Expressions([], type);
        this._sf = ts_morph_1.ts.createSourceFile("", source + "", ts_morph_1.ts.ScriptTarget.ESNext, false, ts_morph_1.ts.ScriptKind.TS);
    }
    complie() {
        const sf = this._sf;
        if (this._type == "condition" || this._type == "limit") {
            // 解析表达式
            sf.statements.forEach(node => this.compileMod(new expressions_1.SyntaxTree([], ""), node.expression));
        }
        else if (this._type == "formula" || this._type == "fn") {
            // 解析公式
            sf.statements.forEach(node => this.preOrder(new expressions_1.SyntaxTree([], ""), node.expression));
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
    preOrder(tree, root) {
        let res = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.Unknown, "", void 0, void 0, 0, "", []);
        this._root.trees.push(tree);
        const preOrderImpl = (cur, parent, first, isleft) => {
            if (!cur) {
                return;
            }
            let left;
            let right;
            let p;
            switch (cur.kind) {
                case ts_morph_1.ts.SyntaxKind.PropertyAccessExpression: {
                    const n = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.ModLiteral, cur.expression.escapedText, void 0, void 0, 0, cur.name.escapedText, []);
                    isleft ? (parent.left = n) : (parent.right = n);
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.BinaryExpression: {
                    // 解析+-*/
                    switch (cur.operatorToken.kind) {
                        case ts_morph_1.ts.SyntaxKind.PlusToken:
                        case ts_morph_1.ts.SyntaxKind.MinusToken:
                        case ts_morph_1.ts.SyntaxKind.AsteriskToken:
                        case ts_morph_1.ts.SyntaxKind.SlashToken: {
                            // 当且仅当解析公式的时候从这个进
                            if (first) {
                                parent.expression = cur.operatorToken
                                    .kind;
                                p = parent;
                            }
                            else {
                                const n = new expressions_1.SyntaxTreeNode(cur.operatorToken.kind, "", void 0, void 0, 0, "", []);
                                isleft ? (parent.left = n) : (parent.right = n);
                                p = n;
                            }
                            left = cur.left;
                            right = cur.right;
                            break;
                        }
                        default:
                            (0, runtime_1.assert)(true, "公式暂不支持当前表达式:" + cur.operatorToken.kind);
                    }
                    break;
                }
                // 解析数值
                case ts_morph_1.ts.SyntaxKind.NumericLiteral: {
                    if (first) {
                        parent.expression = ts_morph_1.ts.SyntaxKind.NumericLiteral;
                        parent.valNumber = +cur.text;
                    }
                    else {
                        const n = new expressions_1.SyntaxTreeNode(cur.kind, "", void 0, void 0, +cur.text, "", []);
                        isleft ? (parent.left = n) : (parent.right = n);
                    }
                    break;
                }
                // 解析字符串
                case ts_morph_1.ts.SyntaxKind.StringLiteral: {
                    (0, runtime_1.assert)(first, "语法解析错误");
                    const n = new expressions_1.SyntaxTreeNode(cur.kind, "", void 0, void 0, 0, cur.text, []);
                    isleft ? (parent.left = n) : (parent.right = n);
                    break;
                }
                // 解析()括号
                case ts_morph_1.ts.SyntaxKind.ParenthesizedExpression: {
                    (0, runtime_1.assert)(first, "语法解析错误");
                    // 括号里面可能是二叉树
                    switch (cur.expression.kind) {
                        case ts_morph_1.ts.SyntaxKind.BinaryExpression:
                            const n = new expressions_1.SyntaxTreeNode(cur.expression.operatorToken
                                .kind, "", void 0, void 0, 0, "", []);
                            isleft ? (parent.left = n) : (parent.right = n);
                            left = cur.expression.left;
                            right = cur.expression.right;
                            p = n;
                            break;
                        // 可能是取属性
                        case ts_morph_1.ts.SyntaxKind.PropertyAccessExpression: {
                            // 模块
                            const escapedText = cur
                                .expression.expression.escapedText;
                            // 属性
                            const prototype = cur
                                .expression.name.escapedText;
                            const n = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.ModLiteral, "", void 0, void 0, 0, "", []);
                            const l = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.StringLiteral, "", void 0, void 0, 0, escapedText, []);
                            const r = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.StringLiteral, "", void 0, void 0, 0, prototype, []);
                            isleft ? (parent.left = n) : (parent.right = n);
                            n.left = l;
                            n.right = r;
                            break;
                        }
                        default:
                            (0, runtime_1.assert)(true, "圆括号表达式里面暂不支持其他类型:" + cur.kind);
                    }
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.CallExpression: {
                    const args = cur.arguments;
                    const n = this.parseMethode(cur.expression.escapedText, args);
                    // 当且仅当解析函数的的时候从这个进
                    if (first) {
                        res = n;
                    }
                    else {
                        isleft ? (parent.left = n) : (parent.right = n);
                    }
                    break;
                }
                default:
                    (0, runtime_1.assert)(true, "公式暂不支持当前表达式:" + cur.kind);
            }
            preOrderImpl(left, p, false, true);
            preOrderImpl(right, p, false, false);
        };
        preOrderImpl(root, res, true, false);
        tree.leafs.push(res);
        return res;
    }
    /**
     * 编译模块
     *
     * @param {ts.Node} node
     * @memberof ConditionCompiler
     */
    compileMod(tree, node) {
        if (node == null) {
            return;
        }
        this._root.trees.push(tree);
        const mod = node.expression.kind == ts_morph_1.ts.SyntaxKind.Identifier;
        if (node.kind == ts_morph_1.ts.SyntaxKind.CallExpression && mod) {
            // 设置模块名称
            tree.mod = node.expression.escapedText;
            // 再看看用了哪些参数
            this.compileArgs(tree, node.arguments);
            return;
        }
        (0, runtime_1.assert)(true, "条件表达式格式不正确,模块写法不正确");
    }
    /**
     * 编译参数
     *
     * @param {SyntaxTree} tree
     * @param {ts.Node[]} args
     * @memberof ConditionCompiler
     */
    compileArgs(tree, args) {
        args.forEach(arg => {
            const leaf = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.EqualsEqualsToken, tree.mod, void 0, void 0, 0, "", []);
            tree.leafs.push(leaf);
            switch (arg.kind) {
                case ts_morph_1.ts.SyntaxKind.BinaryExpression:
                    // 看看是什么符号
                    const operator = arg.operatorToken;
                    leaf.expression = operator.kind;
                    this.generatorNode(leaf, arg.left, true);
                    this.generatorNode(leaf, arg.right, false);
                    break;
                default:
                    (0, runtime_1.assert)(true, "条件表达式格式不正确,模块参数不正确");
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
    generatorNode(leaf, node, left) {
        switch (node.kind) {
            case ts_morph_1.ts.SyntaxKind.NumericLiteral: {
                const child = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.NumericLiteral, leaf.mod, void 0, void 0, +node.text, "", []);
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts_morph_1.ts.SyntaxKind.StringLiteral: {
                const child = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.StringLiteral, leaf.mod, void 0, void 0, 0, node.text, []);
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts_morph_1.ts.SyntaxKind.Identifier: {
                const child = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.Identifier, leaf.mod, void 0, void 0, 0, node.escapedText, []);
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            case ts_morph_1.ts.SyntaxKind.CallExpression: {
                const args = node.arguments;
                const child = this.parseMethode(node.expression.escapedText, args);
                left ? (leaf.left = child) : (leaf.right = child);
                break;
            }
            default:
                (0, runtime_1.assert)(true, "当前表达式暂不支持");
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
    parseMethode(escapedText, args) {
        const child = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.CallExpression, escapedText, void 0, void 0, 0, "", []);
        args.forEach(arg => {
            switch (arg.kind) {
                case ts_morph_1.ts.SyntaxKind.NumericLiteral: {
                    const l = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.NumericLiteral, "", void 0, void 0, +arg.text, "", []);
                    child.args.push(l);
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.Identifier:
                case ts_morph_1.ts.SyntaxKind.StringLiteral: {
                    const l = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.StringLiteral, "", void 0, void 0, 0, arg.text, []);
                    child.args.push(l);
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.PropertyAccessExpression: {
                    (0, runtime_1.assert)(arg.expression.kind != ts_morph_1.ts.SyntaxKind.Identifier, "当前函数参数类型暂未实现");
                    const l = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.ModLiteral, arg.expression.escapedText, void 0, void 0, 0, arg.name.escapedText, []);
                    child.args.push(l);
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.CallExpression: {
                    child.expression = expressions_1.ExpressionsToken.CallCallExpression;
                    // 对于函数参数是函数调用时
                    // 我们总是把作为参数的函数放在父节点的左边
                    const l = this.parseMethode(arg.expression.escapedText, arg.arguments);
                    child.args.push(l);
                    break;
                }
                case ts_morph_1.ts.SyntaxKind.ObjectLiteralExpression: {
                    const l = new expressions_1.SyntaxTreeNode(expressions_1.ExpressionsToken.ObjectLiteralExpression, "", void 0, void 0, 0, "", []);
                    let n = "{";
                    const properties = arg
                        .properties;
                    properties.forEach((propertie, index) => {
                        n += '"' + propertie.name.escapedText + '"';
                        n += ":";
                        if (propertie.initializer.kind == ts_morph_1.ts.SyntaxKind.NumericLiteral) {
                        }
                        switch (propertie.initializer.kind) {
                            case ts_morph_1.ts.SyntaxKind.NumericLiteral:
                                n += +propertie.initializer.text;
                                break;
                            case ts_morph_1.ts.SyntaxKind.StringLiteral:
                                n += +'"' + propertie.initializer.text + '"';
                                break;
                            case ts_morph_1.ts.SyntaxKind.PrefixUnaryExpression:
                                n += propertie.initializer.operand
                                    .text;
                                break;
                            default:
                                (0, runtime_1.assert)(true, "对象类型不支持当前表达式:" + propertie.initializer.kind);
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
                    (0, runtime_1.assert)(true, "当前函数参数类型暂未实现");
            }
        });
        return child;
    }
}
function compile(source, type) {
    const compiler = new Compiler(source, type);
    return compiler.complie();
}
exports.compile = compile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7OztBQUVILGtEQUE4QztBQUM5Qyx1Q0FBOEI7QUFDOUIsK0NBQXNHO0FBRXRHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkNHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sUUFBUTtJQU1ILE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELFlBQW1CLE1BQWMsRUFBRSxJQUFnQjtRQUMvQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsYUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGFBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUVNLE9BQU87UUFDVixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNyRCxRQUFRO1lBQ1IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDekIsSUFBSSxDQUFDLFVBQVUsQ0FDWCxJQUFJLHdCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNyQixJQUErQixD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QUUsQ0FBQzs0QkFDaEMsQ0FBQyxJQUFJLEdBQUcsQ0FBQzt3QkFDYixDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILENBQUMsSUFBSSxHQUFHLENBQUM7b0JBQ1QsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuQixNQUFNO2dCQUNWLENBQUM7Z0JBQ0Q7b0JBQ0ksSUFBQSxnQkFBTSxFQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUFFRCxTQUFnQixPQUFPLENBQUMsTUFBYyxFQUFFLElBQWdCO0lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBSEQsMEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqICDnlKjmnaXop6PmnpDmir3osaHphY3nva7ooajph4zpnaLnmoTooajovr7lvI9cbiAqXG4gKiAgdHlwZXNjcmlwdCDnvJbor5HlmajlhbPplK7or43mnprkuL7mmKDlsIQgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvbWFzdGVyL3NyYy9jb21waWxlci9zY2FubmVyLnRzI0wxNjBcbiAqL1xuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHByb3RvYnVmLXRzL3J1bnRpbWVcIjtcbmltcG9ydCB7IHRzIH0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgeyBFeHByZXNzaW9ucywgRXhwcmVzc2lvbnNUb2tlbiwgU291cmNlVHlwZSwgU3ludGF4VHJlZSwgU3ludGF4VHJlZU5vZGUgfSBmcm9tIFwiLi9leHByZXNzaW9uc1wiO1xuXG4vKipcbiAqIGNvbmRpdGlvbiDmnaHku7booajovr7lvI9cbiAqXG4gKiDmnaHku7booajovr7lvI86XG4gKlxuICog6KGo6L6+5byP5pON5L2c56ym57G75YirOlxuICpcbiAqIOavlOi+g+aTjeS9nOespiAgICjlpKfkuo4pPiwo5aSn5LqO562J5LqOKT49LCjlsI/kuo4pPCwo5bCP5LqO562J5LqOKTw9LCjnrYnkuI3nrYnkuo4pPT0sKOS4jeetieS6jikhPVxuICog5Yqf6IO9OueUqOadpei/m+ihjOavlOi+g1xuICpcbiAqIOiuoeeul+aTjeS9nOespiAgICjkuZjnrYkpKj0sKOmZpOetiSkvPSwo5bmC562JKSoqPSwo5Yqg562JKSs9LCjlh4/nrYkpLT0sKOaooeetiSklPVxuICog5Yqf6IO9OueUqOadpeWSjOWOn+WAvOi/m+ihjOiuoeeul1xuICpcbiAqIOWIhumalOespiAgICAgICAo5YiG5Y+3KTtcbiAqIOWKn+iDvTrnlKjmnaXooajnpLrlpJrooajovr7lvI9cbiAqXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpdGVtKGlkPT0xKVxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW1cbiAqXG4gKiBpdGVtKGlkPT0xLGNvdW50LT01MClcbiAqIOihqOekuuaJvml0ZW3mqKHlnZfph4zpnaJpZOS4ujHnmoRpdGVtLOW5tuWSjOi/meS4qml0ZW3nmoTlsZ7mgKdjb3VudOWOn+WAvOi/m+ihjOiuoeeulyzlh4/ljrs1MFxuICpcbiAqIGl0ZW0oaWQ9PTEsY291bnQqPTUwKVxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW0s5bm25ZKM6L+Z5LiqaXRlbeeahOWxnuaAp2NvdW505Y6f5YC86L+b6KGM6K6h566XLOS5mOS7pTUwXG4gKlxuICogaXRlbShpZD09MSxjb3VudCo9NTApO2l0ZW0oaWQ9PTIsY291bnQvPTUwKVxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW0s5bm25ZKM6L+Z5LiqaXRlbeeahOWxnuaAp2NvdW505Y6f5YC86L+b6KGM6K6h566XLOS5mOS7pTUwLOe7p+e7reaJvuaJvml0ZW3mqKHlnZfph4zpnaJpZOS4ujLnmoRpdGVtLOW5tuWSjOi/meS4qml0ZW3nmoTlsZ7mgKdjb3VudOWOn+WAvOi/m+ihjOiuoeeulyzpmaTku6U1MFxuICogYGBgXG4gKlxuICpcbiAqIGZvcm11bGEg5YWs5byP6KGo6L6+5byPXG4gKlxuICog5pSv5oyB5Yqg5YeP5LmY6Zmk5L2Z5Ye95pWw5qih5Z2X5bGe5oCn562J5ZCE56eN5aSN5p2C6K6h566X5YWs5byPXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiA2NCsoKGhlcm8ubGV2ZWwpLTEpKjguNDkrZ2V0U2tpbGxMZXZlbCgxKSoxLjAxK2dldFNraWxsTGV2ZWwoMykqMC4zNCtnZXRTa2lsbExldmVsKDIpKjAuMzRcbiAqXG4gKiAoMjcwKyhnZXQoaGVyby5sZXZlbCktMSkqMzUuODIrZ2V0KGhlcm8ubG1wKSowLjM0K2dldChoZXJvLm1tcCkqMC41MSt5eGpuKGdldChza2lsbC5ub3dOZWlHb25nU2tpbGxJZCksaHBjb2UpKSooZ2V0KGhlcm8uYmFzZWNvbikrMC41KmdldChoZXJvLmNvbikpKjAuMDFcIlxuICogYGBgXG4gKi9cblxuLyoqXG4gKiDnvJbor5HlmahcbiAqXG4gKiBAY2xhc3MgQ29tcGlsZXJcbiAqL1xuY2xhc3MgQ29tcGlsZXIge1xuICAgIHByaXZhdGUgX3NvdXJjZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3NmOiB0cy5Tb3VyY2VGaWxlO1xuICAgIHByaXZhdGUgX3R5cGU6IFNvdXJjZVR5cGU7XG4gICAgcHJpdmF0ZSBfcm9vdDogRXhwcmVzc2lvbnM7XG5cbiAgICBwdWJsaWMgZ2V0Um9vdCgpOiBFeHByZXNzaW9ucyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihzb3VyY2U6IHN0cmluZywgdHlwZTogU291cmNlVHlwZSkge1xuICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLl9yb290ID0gbmV3IEV4cHJlc3Npb25zKFtdLCB0eXBlKTtcbiAgICAgICAgdGhpcy5fc2YgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFwiXCIsIHNvdXJjZSArIFwiXCIsIHRzLlNjcmlwdFRhcmdldC5FU05leHQsIGZhbHNlLCB0cy5TY3JpcHRLaW5kLlRTKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcGxpZSgpOiBFeHByZXNzaW9ucyB7XG4gICAgICAgIGNvbnN0IHNmID0gdGhpcy5fc2Y7XG5cbiAgICAgICAgaWYgKHRoaXMuX3R5cGUgPT0gXCJjb25kaXRpb25cIiB8fCB0aGlzLl90eXBlID09IFwibGltaXRcIikge1xuICAgICAgICAgICAgLy8g6Kej5p6Q6KGo6L6+5byPXG4gICAgICAgICAgICBzZi5zdGF0ZW1lbnRzLmZvckVhY2gobm9kZSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuY29tcGlsZU1vZChcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN5bnRheFRyZWUoW10sIFwiXCIpLFxuICAgICAgICAgICAgICAgICAgICAobm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50KS5leHByZXNzaW9uIGFzIHRzLkNhbGxFeHByZXNzaW9uLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3R5cGUgPT0gXCJmb3JtdWxhXCIgfHwgdGhpcy5fdHlwZSA9PSBcImZuXCIpIHtcbiAgICAgICAgICAgIC8vIOino+aekOWFrOW8j1xuICAgICAgICAgICAgc2Yuc3RhdGVtZW50cy5mb3JFYWNoKG5vZGUgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnByZU9yZGVyKG5ldyBTeW50YXhUcmVlKFtdLCBcIlwiKSwgKG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudCkuZXhwcmVzc2lvbiksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5YmN5bqP6YGN5Y6GXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWV9IHRyZWVcbiAgICAgKiBAcGFyYW0ge3RzLkV4cHJlc3Npb259IHJvb3RcbiAgICAgKiBAcmV0dXJuIHsqfSAge1N5bnRheFRyZWVOb2RlfVxuICAgICAqIEBtZW1iZXJvZiBDb21waWxlclxuICAgICAqL1xuICAgIHB1YmxpYyBwcmVPcmRlcih0cmVlOiBTeW50YXhUcmVlLCByb290OiB0cy5FeHByZXNzaW9uKTogU3ludGF4VHJlZU5vZGUge1xuICAgICAgICBsZXQgcmVzOiBTeW50YXhUcmVlTm9kZSA9IG5ldyBTeW50YXhUcmVlTm9kZShFeHByZXNzaW9uc1Rva2VuLlVua25vd24sIFwiXCIsIHZvaWQgMCwgdm9pZCAwLCAwLCBcIlwiLCBbXSk7XG4gICAgICAgIHRoaXMuX3Jvb3QudHJlZXMucHVzaCh0cmVlKTtcblxuICAgICAgICBjb25zdCBwcmVPcmRlckltcGwgPSAoY3VyOiB0cy5FeHByZXNzaW9uIHwgbnVsbCwgcGFyZW50OiBTeW50YXhUcmVlTm9kZSwgZmlyc3Q6IGJvb2xlYW4sIGlzbGVmdDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsZWZ0OiB0cy5FeHByZXNzaW9uO1xuICAgICAgICAgICAgbGV0IHJpZ2h0OiB0cy5FeHByZXNzaW9uO1xuICAgICAgICAgICAgbGV0IHA6IFN5bnRheFRyZWVOb2RlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGN1ci5raW5kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbmV3IFN5bnRheFRyZWVOb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5Nb2RMaXRlcmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgKChjdXIgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGN1ciBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pLm5hbWUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlzbGVmdCA/IChwYXJlbnQubGVmdCA9IG4pIDogKHBhcmVudC5yaWdodCA9IG4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb246IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g6Kej5p6QKy0qL1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlbi5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW46XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5b2T5LiU5LuF5b2T6Kej5p6Q5YWs5byP55qE5pe25YCZ5LuO6L+Z5Liq6L+bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5leHByZXNzaW9uID0gKChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmtpbmQgYXMgdW5rbm93bikgYXMgRXhwcmVzc2lvbnNUb2tlbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwID0gcGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKGN1ciBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5vcGVyYXRvclRva2VuLmtpbmQgYXMgdW5rbm93bikgYXMgRXhwcmVzc2lvbnNUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc2xlZnQgPyAocGFyZW50LmxlZnQgPSBuKSA6IChwYXJlbnQucmlnaHQgPSBuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IG47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodCA9IChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikucmlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCh0cnVlLCBcIuWFrOW8j+aaguS4jeaUr+aMgeW9k+WJjeihqOi+vuW8jzpcIiArIChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlbi5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDop6PmnpDmlbDlgLxcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw6IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuZXhwcmVzc2lvbiA9ICh0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsIGFzIHVua25vd24pIGFzIEV4cHJlc3Npb25zVG9rZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQudmFsTnVtYmVyID0gKyhjdXIgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN1ci5raW5kIGFzIHVua25vd24pIGFzIEV4cHJlc3Npb25zVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsoY3VyIGFzIHRzLklkZW50aWZpZXIpLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc2xlZnQgPyAocGFyZW50LmxlZnQgPSBuKSA6IChwYXJlbnQucmlnaHQgPSBuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5a2X56ym5LiyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGZpcnN0LCBcIuivreazleino+aekOmUmeivr1wiKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbmV3IFN5bnRheFRyZWVOb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgKGN1ci5raW5kIGFzIHVua25vd24pIGFzIEV4cHJlc3Npb25zVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdXIgYXMgdHMuSWRlbnRpZmllcikudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpc2xlZnQgPyAocGFyZW50LmxlZnQgPSBuKSA6IChwYXJlbnQucmlnaHQgPSBuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOino+aekCgp5ous5Y+3XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmaXJzdCwgXCLor63ms5Xop6PmnpDplJnor69cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5ous5Y+36YeM6Z2i5Y+v6IO95piv5LqM5Y+J5qCRXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoKGN1ciBhcyB0cy5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbikuZXhwcmVzc2lvbi5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbmV3IFN5bnRheFRyZWVOb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmtpbmQgYXMgdW5rbm93bikgYXMgRXhwcmVzc2lvbnNUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodCA9ICgoY3VyIGFzIHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLnJpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+v6IO95piv5Y+W5bGe5oCnXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qih5Z2XXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZFRleHQgPSAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5leHByZXNzaW9uIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlsZ7mgKdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm90b3R5cGUgPSAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5leHByZXNzaW9uIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikubmFtZSBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uTW9kTGl0ZXJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5TdHJpbmdMaXRlcmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uU3RyaW5nTGl0ZXJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvdHlwZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuLmxlZnQgPSBsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4ucmlnaHQgPSByO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLlnIbmi6zlj7fooajovr7lvI/ph4zpnaLmmoLkuI3mlK/mjIHlhbbku5bnsbvlnos6XCIgKyBjdXIua2luZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcmdzID0gKGN1ciBhcyB0cy5DYWxsRXhwcmVzc2lvbikuYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gdGhpcy5wYXJzZU1ldGhvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGN1ciBhcyB0cy5DYWxsRXhwcmVzc2lvbikuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAvLyDlvZPkuJTku4XlvZPop6PmnpDlh73mlbDnmoTnmoTml7blgJnku47ov5nkuKrov5tcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIFwi5YWs5byP5pqC5LiN5pSv5oyB5b2T5YmN6KGo6L6+5byPOlwiICsgY3VyLmtpbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJlT3JkZXJJbXBsKGxlZnQhLCBwISwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgcHJlT3JkZXJJbXBsKHJpZ2h0ISwgcCEsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJlT3JkZXJJbXBsKHJvb3QsIHJlcywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICB0cmVlLmxlYWZzLnB1c2gocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcyE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57yW6K+R5qih5Z2XXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3RzLk5vZGV9IG5vZGVcbiAgICAgKiBAbWVtYmVyb2YgQ29uZGl0aW9uQ29tcGlsZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGlsZU1vZCh0cmVlOiBTeW50YXhUcmVlLCBub2RlOiB0cy5DYWxsRXhwcmVzc2lvbik6IHZvaWQge1xuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcm9vdC50cmVlcy5wdXNoKHRyZWUpO1xuICAgICAgICBjb25zdCBtb2QgPSAobm9kZS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyO1xuICAgICAgICBpZiAobm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24gJiYgbW9kKSB7XG4gICAgICAgICAgICAvLyDorr7nva7mqKHlnZflkI3np7BcbiAgICAgICAgICAgIHRyZWUubW9kID0gKG5vZGUuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmc7XG4gICAgICAgICAgICAvLyDlho3nnIvnnIvnlKjkuoblk6rkupvlj4LmlbBcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZUFyZ3ModHJlZSwgKG5vZGUuYXJndW1lbnRzIGFzIHVua25vd24pIGFzIHRzLk5vZGVbXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQodHJ1ZSwgXCLmnaHku7booajovr7lvI/moLzlvI/kuI3mraPnoa4s5qih5Z2X5YaZ5rOV5LiN5q2j56GuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOe8luivkeWPguaVsFxuICAgICAqXG4gICAgICogQHBhcmFtIHtTeW50YXhUcmVlfSB0cmVlXG4gICAgICogQHBhcmFtIHt0cy5Ob2RlW119IGFyZ3NcbiAgICAgKiBAbWVtYmVyb2YgQ29uZGl0aW9uQ29tcGlsZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGlsZUFyZ3ModHJlZTogU3ludGF4VHJlZSwgYXJnczogdHMuTm9kZVtdKSB7XG4gICAgICAgIGFyZ3MuZm9yRWFjaChhcmcgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGVhZiA9IG5ldyBTeW50YXhUcmVlTm9kZShcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLkVxdWFsc0VxdWFsc1Rva2VuLFxuICAgICAgICAgICAgICAgIHRyZWUubW9kLFxuICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRyZWUubGVhZnMucHVzaChsZWFmKTtcbiAgICAgICAgICAgIHN3aXRjaCAoYXJnLmtpbmQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgLy8g55yL55yL5piv5LuA5LmI56ym5Y+3XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZXJhdG9yID0gKGFyZyBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5vcGVyYXRvclRva2VuO1xuICAgICAgICAgICAgICAgICAgICBsZWFmLmV4cHJlc3Npb24gPSAob3BlcmF0b3Iua2luZCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yTm9kZShsZWFmLCAoYXJnIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLmxlZnQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRvck5vZGUobGVhZiwgKGFyZyBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5yaWdodCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLmnaHku7booajovr7lvI/moLzlvI/kuI3mraPnoa4s5qih5Z2X5Y+C5pWw5LiN5q2j56GuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmnoTpgKDlh73mlbBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3ludGF4VHJlZU5vZGV9IGxlYWZcbiAgICAgKiBAcGFyYW0ge3RzLk5vZGV9IG5vZGVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxlZnRcbiAgICAgKiBAbWVtYmVyb2YgQ29uZGl0aW9uQ29tcGlsZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2VuZXJhdG9yTm9kZShsZWFmOiBTeW50YXhUcmVlTm9kZSwgbm9kZTogdHMuTm9kZSwgbGVmdDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uTnVtZXJpY0xpdGVyYWwsXG4gICAgICAgICAgICAgICAgICAgIGxlYWYubW9kLFxuICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgKyhub2RlIGFzIHRzLklkZW50aWZpZXIpLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGVmdCA/IChsZWFmLmxlZnQgPSBjaGlsZCkgOiAobGVhZi5yaWdodCA9IGNoaWxkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uU3RyaW5nTGl0ZXJhbCxcbiAgICAgICAgICAgICAgICAgICAgbGVhZi5tb2QsXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAobm9kZSBhcyB0cy5JZGVudGlmaWVyKS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGxlZnQgPyAobGVhZi5sZWZ0ID0gY2hpbGQpIDogKGxlYWYucmlnaHQgPSBjaGlsZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbmV3IFN5bnRheFRyZWVOb2RlKFxuICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLklkZW50aWZpZXIsXG4gICAgICAgICAgICAgICAgICAgIGxlYWYubW9kLFxuICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgKG5vZGUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGxlZnQgPyAobGVhZi5sZWZ0ID0gY2hpbGQpIDogKGxlYWYucmlnaHQgPSBjaGlsZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcmdzID0gKG5vZGUgYXMgdHMuQ2FsbEV4cHJlc3Npb24pLmFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMucGFyc2VNZXRob2RlKFxuICAgICAgICAgICAgICAgICAgICAoKG5vZGUgYXMgdHMuQ2FsbEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGVmdCA/IChsZWFmLmxlZnQgPSBjaGlsZCkgOiAobGVhZi5yaWdodCA9IGNoaWxkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIFwi5b2T5YmN6KGo6L6+5byP5pqC5LiN5pSv5oyBXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye95pWwXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXNjYXBlZFRleHQg5Ye95pWw5ZCNXG4gICAgICogQHBhcmFtIHt0cy5Ob2RlQXJyYXk8dHMuRXhwcmVzc2lvbj59IGFyZ3Mg5Ye95pWw5Y+C5pWwXG4gICAgICogQHJldHVybiB7U3ludGF4VHJlZU5vZGV9ICB7U3ludGF4VHJlZU5vZGV9XG4gICAgICogQG1lbWJlcm9mIENvbXBpbGVyXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlTWV0aG9kZShlc2NhcGVkVGV4dDogc3RyaW5nLCBhcmdzOiB0cy5Ob2RlQXJyYXk8dHMuRXhwcmVzc2lvbj4pOiBTeW50YXhUcmVlTm9kZSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbmV3IFN5bnRheFRyZWVOb2RlKEV4cHJlc3Npb25zVG9rZW4uQ2FsbEV4cHJlc3Npb24sIGVzY2FwZWRUZXh0LCB2b2lkIDAsIHZvaWQgMCwgMCwgXCJcIiwgW10pO1xuICAgICAgICBhcmdzLmZvckVhY2goYXJnID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXJnLmtpbmQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uTnVtZXJpY0xpdGVyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgKyhhcmcgYXMgdHMuSWRlbnRpZmllcikudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYXJncy5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uU3RyaW5nTGl0ZXJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgKGFyZyBhcyB0cy5JZGVudGlmaWVyKS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFyZ3MucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb246IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KFxuICAgICAgICAgICAgICAgICAgICAgICAgKGFyZyBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pLmV4cHJlc3Npb24ua2luZCAhPSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIuW9k+WJjeWHveaVsOWPguaVsOexu+Wei+aaguacquWunueOsFwiLFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBuZXcgU3ludGF4VHJlZU5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLk1vZExpdGVyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGFyZyBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICgoYXJnIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikubmFtZSBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYXJncy5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmV4cHJlc3Npb24gPSBFeHByZXNzaW9uc1Rva2VuLkNhbGxDYWxsRXhwcmVzc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgLy8g5a+55LqO5Ye95pWw5Y+C5pWw5piv5Ye95pWw6LCD55So5pe2XG4gICAgICAgICAgICAgICAgICAgIC8vIOaIkeS7rOaAu+aYr+aKiuS9nOS4uuWPguaVsOeahOWHveaVsOaUvuWcqOeItuiKgueCueeahOW3pui+uVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsID0gdGhpcy5wYXJzZU1ldGhvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGFyZyBhcyB0cy5DYWxsRXhwcmVzc2lvbikuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAoYXJnIGFzIHRzLkNhbGxFeHByZXNzaW9uKS5hcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFyZ3MucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsID0gbmV3IFN5bnRheFRyZWVOb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbiA9IFwie1wiO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gKChhcmcgYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJvcGVydGllcyBhcyB1bmtub3duKSBhcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnRbXTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0aWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9ICdcIicgKyAocHJvcGVydGllLm5hbWUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgKyAnXCInO1xuICAgICAgICAgICAgICAgICAgICAgICAgbiArPSBcIjpcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZS5pbml0aWFsaXplci5raW5kID09IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0aWUuaW5pdGlhbGl6ZXIua2luZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiArPSArKHByb3BlcnRpZS5pbml0aWFsaXplciBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiArPSArJ1wiJyArIChwcm9wZXJ0aWUuaW5pdGlhbGl6ZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCArICdcIic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QcmVmaXhVbmFyeUV4cHJlc3Npb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gKz0gKChwcm9wZXJ0aWUuaW5pdGlhbGl6ZXIgYXMgdHMuUHJlZml4VW5hcnlFeHByZXNzaW9uKS5vcGVyYW5kIGFzIHRzLklkZW50aWZpZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIFwi5a+56LGh57G75Z6L5LiN5pSv5oyB5b2T5YmN6KGo6L6+5byPOlwiICsgcHJvcGVydGllLmluaXRpYWxpemVyLmtpbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBwcm9wZXJ0aWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuICs9IFwiLFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbiArPSBcIn1cIjtcbiAgICAgICAgICAgICAgICAgICAgbC52YWxTdHJpbmcgPSBuO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hcmdzLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLlvZPliY3lh73mlbDlj4LmlbDnsbvlnovmmoLmnKrlrp7njrBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZShzb3VyY2U6IHN0cmluZywgdHlwZTogU291cmNlVHlwZSk6IEV4cHJlc3Npb25zIHtcbiAgICBjb25zdCBjb21waWxlciA9IG5ldyBDb21waWxlcihzb3VyY2UsIHR5cGUpO1xuICAgIHJldHVybiBjb21waWxlci5jb21wbGllKCk7XG59XG4iXX0=