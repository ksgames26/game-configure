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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29tcGlsZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7OztBQUVILGtEQUE4QztBQUM5Qyx1Q0FBOEI7QUFDOUIsK0NBQXNHO0FBRXRHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkNHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sUUFBUTtJQU1ILE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELFlBQW1CLE1BQWMsRUFBRSxJQUFnQjtRQUMvQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsYUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGFBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUVNLE9BQU87UUFDVixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNyRCxRQUFRO1lBQ1IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDekIsSUFBSSxDQUFDLFVBQVUsQ0FDWCxJQUFJLHdCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNyQixJQUErQixD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QUUsQ0FBQzs0QkFDaEMsQ0FBQyxJQUFJLEdBQUcsQ0FBQzt3QkFDYixDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILENBQUMsSUFBSSxHQUFHLENBQUM7b0JBQ1QsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuQixNQUFNO2dCQUNWLENBQUM7Z0JBQ0Q7b0JBQ0ksSUFBQSxnQkFBTSxFQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUFFRCxTQUFnQixPQUFPLENBQUMsTUFBYyxFQUFFLElBQWdCO0lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBSEQsMEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogIOeUqOadpeino+aekOaKveixoemFjee9ruihqOmHjOmdoueahOihqOi+vuW8j1xyXG4gKlxyXG4gKiAgdHlwZXNjcmlwdCDnvJbor5HlmajlhbPplK7or43mnprkuL7mmKDlsIQgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvbWFzdGVyL3NyYy9jb21waWxlci9zY2FubmVyLnRzI0wxNjBcclxuICovXHJcblxyXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHByb3RvYnVmLXRzL3J1bnRpbWVcIjtcclxuaW1wb3J0IHsgdHMgfSBmcm9tIFwidHMtbW9ycGhcIjtcclxuaW1wb3J0IHsgRXhwcmVzc2lvbnMsIEV4cHJlc3Npb25zVG9rZW4sIFNvdXJjZVR5cGUsIFN5bnRheFRyZWUsIFN5bnRheFRyZWVOb2RlIH0gZnJvbSBcIi4vZXhwcmVzc2lvbnNcIjtcclxuXHJcbi8qKlxyXG4gKiBjb25kaXRpb24g5p2h5Lu26KGo6L6+5byPXHJcbiAqXHJcbiAqIOadoeS7tuihqOi+vuW8jzpcclxuICpcclxuICog6KGo6L6+5byP5pON5L2c56ym57G75YirOlxyXG4gKlxyXG4gKiDmr5TovoPmk43kvZznrKYgICAo5aSn5LqOKT4sKOWkp+S6juetieS6jik+PSwo5bCP5LqOKTwsKOWwj+S6juetieS6jik8PSwo562J5LiN562J5LqOKT09LCjkuI3nrYnkuo4pIT1cclxuICog5Yqf6IO9OueUqOadpei/m+ihjOavlOi+g1xyXG4gKlxyXG4gKiDorqHnrpfmk43kvZznrKYgICAo5LmY562JKSo9LCjpmaTnrYkpLz0sKOW5guetiSkqKj0sKOWKoOetiSkrPSwo5YeP562JKS09LCjmqKHnrYkpJT1cclxuICog5Yqf6IO9OueUqOadpeWSjOWOn+WAvOi/m+ihjOiuoeeul1xyXG4gKlxyXG4gKiDliIbpmpTnrKYgICAgICAgKOWIhuWPtyk7XHJcbiAqIOWKn+iDvTrnlKjmnaXooajnpLrlpJrooajovr7lvI9cclxuICpcclxuICpcclxuICogQGV4YW1wbGVcclxuICogYGBgdHNcclxuICogaXRlbShpZD09MSlcclxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW1cclxuICpcclxuICogaXRlbShpZD09MSxjb3VudC09NTApXHJcbiAqIOihqOekuuaJvml0ZW3mqKHlnZfph4zpnaJpZOS4ujHnmoRpdGVtLOW5tuWSjOi/meS4qml0ZW3nmoTlsZ7mgKdjb3VudOWOn+WAvOi/m+ihjOiuoeeulyzlh4/ljrs1MFxyXG4gKlxyXG4gKiBpdGVtKGlkPT0xLGNvdW50Kj01MClcclxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW0s5bm25ZKM6L+Z5LiqaXRlbeeahOWxnuaAp2NvdW505Y6f5YC86L+b6KGM6K6h566XLOS5mOS7pTUwXHJcbiAqXHJcbiAqIGl0ZW0oaWQ9PTEsY291bnQqPTUwKTtpdGVtKGlkPT0yLGNvdW50Lz01MClcclxuICog6KGo56S65om+aXRlbeaooeWdl+mHjOmdomlk5Li6MeeahGl0ZW0s5bm25ZKM6L+Z5LiqaXRlbeeahOWxnuaAp2NvdW505Y6f5YC86L+b6KGM6K6h566XLOS5mOS7pTUwLOe7p+e7reaJvuaJvml0ZW3mqKHlnZfph4zpnaJpZOS4ujLnmoRpdGVtLOW5tuWSjOi/meS4qml0ZW3nmoTlsZ7mgKdjb3VudOWOn+WAvOi/m+ihjOiuoeeulyzpmaTku6U1MFxyXG4gKiBgYGBcclxuICpcclxuICpcclxuICogZm9ybXVsYSDlhazlvI/ooajovr7lvI9cclxuICpcclxuICog5pSv5oyB5Yqg5YeP5LmY6Zmk5L2Z5Ye95pWw5qih5Z2X5bGe5oCn562J5ZCE56eN5aSN5p2C6K6h566X5YWs5byPXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGBgYHRzXHJcbiAqIDY0KygoaGVyby5sZXZlbCktMSkqOC40OStnZXRTa2lsbExldmVsKDEpKjEuMDErZ2V0U2tpbGxMZXZlbCgzKSowLjM0K2dldFNraWxsTGV2ZWwoMikqMC4zNFxyXG4gKlxyXG4gKiAoMjcwKyhnZXQoaGVyby5sZXZlbCktMSkqMzUuODIrZ2V0KGhlcm8ubG1wKSowLjM0K2dldChoZXJvLm1tcCkqMC41MSt5eGpuKGdldChza2lsbC5ub3dOZWlHb25nU2tpbGxJZCksaHBjb2UpKSooZ2V0KGhlcm8uYmFzZWNvbikrMC41KmdldChoZXJvLmNvbikpKjAuMDFcIlxyXG4gKiBgYGBcclxuICovXHJcblxyXG4vKipcclxuICog57yW6K+R5ZmoXHJcbiAqXHJcbiAqIEBjbGFzcyBDb21waWxlclxyXG4gKi9cclxuY2xhc3MgQ29tcGlsZXIge1xyXG4gICAgcHJpdmF0ZSBfc291cmNlOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9zZjogdHMuU291cmNlRmlsZTtcclxuICAgIHByaXZhdGUgX3R5cGU6IFNvdXJjZVR5cGU7XHJcbiAgICBwcml2YXRlIF9yb290OiBFeHByZXNzaW9ucztcclxuXHJcbiAgICBwdWJsaWMgZ2V0Um9vdCgpOiBFeHByZXNzaW9ucyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHNvdXJjZTogc3RyaW5nLCB0eXBlOiBTb3VyY2VUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xyXG4gICAgICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuX3Jvb3QgPSBuZXcgRXhwcmVzc2lvbnMoW10sIHR5cGUpO1xyXG4gICAgICAgIHRoaXMuX3NmID0gdHMuY3JlYXRlU291cmNlRmlsZShcIlwiLCBzb3VyY2UgKyBcIlwiLCB0cy5TY3JpcHRUYXJnZXQuRVNOZXh0LCBmYWxzZSwgdHMuU2NyaXB0S2luZC5UUyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbXBsaWUoKTogRXhwcmVzc2lvbnMge1xyXG4gICAgICAgIGNvbnN0IHNmID0gdGhpcy5fc2Y7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl90eXBlID09IFwiY29uZGl0aW9uXCIgfHwgdGhpcy5fdHlwZSA9PSBcImxpbWl0XCIpIHtcclxuICAgICAgICAgICAgLy8g6Kej5p6Q6KGo6L6+5byPXHJcbiAgICAgICAgICAgIHNmLnN0YXRlbWVudHMuZm9yRWFjaChub2RlID0+XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBpbGVNb2QoXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN5bnRheFRyZWUoW10sIFwiXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIChub2RlIGFzIHRzLkV4cHJlc3Npb25TdGF0ZW1lbnQpLmV4cHJlc3Npb24gYXMgdHMuQ2FsbEV4cHJlc3Npb24sXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdHlwZSA9PSBcImZvcm11bGFcIiB8fCB0aGlzLl90eXBlID09IFwiZm5cIikge1xyXG4gICAgICAgICAgICAvLyDop6PmnpDlhazlvI9cclxuICAgICAgICAgICAgc2Yuc3RhdGVtZW50cy5mb3JFYWNoKG5vZGUgPT5cclxuICAgICAgICAgICAgICAgIHRoaXMucHJlT3JkZXIobmV3IFN5bnRheFRyZWUoW10sIFwiXCIpLCAobm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50KS5leHByZXNzaW9uKSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YmN5bqP6YGN5Y6GXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTeW50YXhUcmVlfSB0cmVlXHJcbiAgICAgKiBAcGFyYW0ge3RzLkV4cHJlc3Npb259IHJvb3RcclxuICAgICAqIEByZXR1cm4geyp9ICB7U3ludGF4VHJlZU5vZGV9XHJcbiAgICAgKiBAbWVtYmVyb2YgQ29tcGlsZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHByZU9yZGVyKHRyZWU6IFN5bnRheFRyZWUsIHJvb3Q6IHRzLkV4cHJlc3Npb24pOiBTeW50YXhUcmVlTm9kZSB7XHJcbiAgICAgICAgbGV0IHJlczogU3ludGF4VHJlZU5vZGUgPSBuZXcgU3ludGF4VHJlZU5vZGUoRXhwcmVzc2lvbnNUb2tlbi5Vbmtub3duLCBcIlwiLCB2b2lkIDAsIHZvaWQgMCwgMCwgXCJcIiwgW10pO1xyXG4gICAgICAgIHRoaXMuX3Jvb3QudHJlZXMucHVzaCh0cmVlKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJlT3JkZXJJbXBsID0gKGN1cjogdHMuRXhwcmVzc2lvbiB8IG51bGwsIHBhcmVudDogU3ludGF4VHJlZU5vZGUsIGZpcnN0OiBib29sZWFuLCBpc2xlZnQ6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjdXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGxlZnQ6IHRzLkV4cHJlc3Npb247XHJcbiAgICAgICAgICAgIGxldCByaWdodDogdHMuRXhwcmVzc2lvbjtcclxuICAgICAgICAgICAgbGV0IHA6IFN5bnRheFRyZWVOb2RlO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChjdXIua2luZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uTW9kTGl0ZXJhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKChjdXIgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0IGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoY3VyIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikubmFtZSBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOino+aekCstKi9cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlbi5raW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5NaW51c1Rva2VuOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW46IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW9k+S4lOS7heW9k+ino+aekOWFrOW8j+eahOaXtuWAmeS7jui/meS4qui/m1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmV4cHJlc3Npb24gPSAoKGN1ciBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5vcGVyYXRvclRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5raW5kIGFzIHVua25vd24pIGFzIEV4cHJlc3Npb25zVG9rZW47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoY3VyIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLm9wZXJhdG9yVG9rZW4ua2luZCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc2xlZnQgPyAocGFyZW50LmxlZnQgPSBuKSA6IChwYXJlbnQucmlnaHQgPSBuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwID0gbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gKGN1ciBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5sZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQgPSAoY3VyIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLnJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCh0cnVlLCBcIuWFrOW8j+aaguS4jeaUr+aMgeW9k+WJjeihqOi+vuW8jzpcIiArIChjdXIgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlbi5raW5kKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5pWw5YC8XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw6IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmV4cHJlc3Npb24gPSAodHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQudmFsTnVtYmVyID0gKyhjdXIgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbmV3IFN5bnRheFRyZWVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN1ci5raW5kIGFzIHVua25vd24pIGFzIEV4cHJlc3Npb25zVG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKyhjdXIgYXMgdHMuSWRlbnRpZmllcikudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5a2X56ym5LiyXHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmaXJzdCwgXCLor63ms5Xop6PmnpDplJnor69cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdXIua2luZCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGN1ciBhcyB0cy5JZGVudGlmaWVyKS50ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzbGVmdCA/IChwYXJlbnQubGVmdCA9IG4pIDogKHBhcmVudC5yaWdodCA9IG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g6Kej5p6QKCnmi6zlj7dcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmaXJzdCwgXCLor63ms5Xop6PmnpDplJnor69cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaLrOWPt+mHjOmdouWPr+iDveaYr+S6jOWPieagkVxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoKGN1ciBhcyB0cy5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbikuZXhwcmVzc2lvbi5raW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CaW5hcnlFeHByZXNzaW9uOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IG5ldyBTeW50YXhUcmVlTm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAua2luZCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9ICgoY3VyIGFzIHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodCA9ICgoY3VyIGFzIHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLkJpbmFyeUV4cHJlc3Npb24pLnJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IG47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+v6IO95piv5Y+W5bGe5oCnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaooeWdl1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZFRleHQgPSAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmV4cHJlc3Npb24gYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5bGe5oCnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm90b3R5cGUgPSAoKChjdXIgYXMgdHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmV4cHJlc3Npb24gYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKS5uYW1lIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5Nb2RMaXRlcmFsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLlN0cmluZ0xpdGVyYWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5TdHJpbmdMaXRlcmFsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvdHlwZSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbi5sZWZ0ID0gbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4ucmlnaHQgPSByO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCh0cnVlLCBcIuWchuaLrOWPt+ihqOi+vuW8j+mHjOmdouaaguS4jeaUr+aMgeWFtuS7luexu+WeizpcIiArIGN1ci5raW5kKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcmdzID0gKGN1ciBhcyB0cy5DYWxsRXhwcmVzc2lvbikuYXJndW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSB0aGlzLnBhcnNlTWV0aG9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgKChjdXIgYXMgdHMuQ2FsbEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5b2T5LiU5LuF5b2T6Kej5p6Q5Ye95pWw55qE55qE5pe25YCZ5LuO6L+Z5Liq6L+bXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IG47XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNsZWZ0ID8gKHBhcmVudC5sZWZ0ID0gbikgOiAocGFyZW50LnJpZ2h0ID0gbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIFwi5YWs5byP5pqC5LiN5pSv5oyB5b2T5YmN6KGo6L6+5byPOlwiICsgY3VyLmtpbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZU9yZGVySW1wbChsZWZ0ISwgcCEsIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICAgICAgcHJlT3JkZXJJbXBsKHJpZ2h0ISwgcCEsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHJlT3JkZXJJbXBsKHJvb3QsIHJlcywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgIHRyZWUubGVhZnMucHVzaChyZXMpO1xyXG4gICAgICAgIHJldHVybiByZXMhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57yW6K+R5qih5Z2XXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHt0cy5Ob2RlfSBub2RlXHJcbiAgICAgKiBAbWVtYmVyb2YgQ29uZGl0aW9uQ29tcGlsZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbXBpbGVNb2QodHJlZTogU3ludGF4VHJlZSwgbm9kZTogdHMuQ2FsbEV4cHJlc3Npb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcm9vdC50cmVlcy5wdXNoKHRyZWUpO1xyXG4gICAgICAgIGNvbnN0IG1vZCA9IChub2RlLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI7XHJcbiAgICAgICAgaWYgKG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uICYmIG1vZCkge1xyXG4gICAgICAgICAgICAvLyDorr7nva7mqKHlnZflkI3np7BcclxuICAgICAgICAgICAgdHJlZS5tb2QgPSAobm9kZS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0IGFzIHN0cmluZztcclxuICAgICAgICAgICAgLy8g5YaN55yL55yL55So5LqG5ZOq5Lqb5Y+C5pWwXHJcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZUFyZ3ModHJlZSwgKG5vZGUuYXJndW1lbnRzIGFzIHVua25vd24pIGFzIHRzLk5vZGVbXSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzc2VydCh0cnVlLCBcIuadoeS7tuihqOi+vuW8j+agvOW8j+S4jeato+ehrizmqKHlnZflhpnms5XkuI3mraPnoa5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnvJbor5Hlj4LmlbBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWV9IHRyZWVcclxuICAgICAqIEBwYXJhbSB7dHMuTm9kZVtdfSBhcmdzXHJcbiAgICAgKiBAbWVtYmVyb2YgQ29uZGl0aW9uQ29tcGlsZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbXBpbGVBcmdzKHRyZWU6IFN5bnRheFRyZWUsIGFyZ3M6IHRzLk5vZGVbXSkge1xyXG4gICAgICAgIGFyZ3MuZm9yRWFjaChhcmcgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsZWFmID0gbmV3IFN5bnRheFRyZWVOb2RlKFxyXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5FcXVhbHNFcXVhbHNUb2tlbixcclxuICAgICAgICAgICAgICAgIHRyZWUubW9kLFxyXG4gICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdHJlZS5sZWFmcy5wdXNoKGxlYWYpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGFyZy5raW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcclxuICAgICAgICAgICAgICAgICAgICAvLyDnnIvnnIvmmK/ku4DkuYjnrKblj7dcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVyYXRvciA9IChhcmcgYXMgdHMuQmluYXJ5RXhwcmVzc2lvbikub3BlcmF0b3JUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBsZWFmLmV4cHJlc3Npb24gPSAob3BlcmF0b3Iua2luZCBhcyB1bmtub3duKSBhcyBFeHByZXNzaW9uc1Rva2VuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRvck5vZGUobGVhZiwgKGFyZyBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5sZWZ0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRvck5vZGUobGVhZiwgKGFyZyBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5yaWdodCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLmnaHku7booajovr7lvI/moLzlvI/kuI3mraPnoa4s5qih5Z2X5Y+C5pWw5LiN5q2j56GuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmnoTpgKDlh73mlbBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N5bnRheFRyZWVOb2RlfSBsZWFmXHJcbiAgICAgKiBAcGFyYW0ge3RzLk5vZGV9IG5vZGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGVmdFxyXG4gICAgICogQG1lbWJlcm9mIENvbmRpdGlvbkNvbXBpbGVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0b3JOb2RlKGxlYWY6IFN5bnRheFRyZWVOb2RlLCBub2RlOiB0cy5Ob2RlLCBsZWZ0OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IG5ldyBTeW50YXhUcmVlTm9kZShcclxuICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLk51bWVyaWNMaXRlcmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlYWYubW9kLFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgKyhub2RlIGFzIHRzLklkZW50aWZpZXIpLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBsZWZ0ID8gKGxlYWYubGVmdCA9IGNoaWxkKSA6IChsZWFmLnJpZ2h0ID0gY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbmV3IFN5bnRheFRyZWVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uU3RyaW5nTGl0ZXJhbCxcclxuICAgICAgICAgICAgICAgICAgICBsZWFmLm1vZCxcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgKG5vZGUgYXMgdHMuSWRlbnRpZmllcikudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBsZWZ0ID8gKGxlYWYubGVmdCA9IGNoaWxkKSA6IChsZWFmLnJpZ2h0ID0gY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbmV3IFN5bnRheFRyZWVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uSWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgICAgICBsZWFmLm1vZCxcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgKG5vZGUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGxlZnQgPyAobGVhZi5sZWZ0ID0gY2hpbGQpIDogKGxlYWYucmlnaHQgPSBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSAobm9kZSBhcyB0cy5DYWxsRXhwcmVzc2lvbikuYXJndW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnBhcnNlTWV0aG9kZShcclxuICAgICAgICAgICAgICAgICAgICAoKG5vZGUgYXMgdHMuQ2FsbEV4cHJlc3Npb24pLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgbGVmdCA/IChsZWFmLmxlZnQgPSBjaGlsZCkgOiAobGVhZi5yaWdodCA9IGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQodHJ1ZSwgXCLlvZPliY3ooajovr7lvI/mmoLkuI3mlK/mjIFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6Kej5p6Q5Ye95pWwXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGVzY2FwZWRUZXh0IOWHveaVsOWQjVxyXG4gICAgICogQHBhcmFtIHt0cy5Ob2RlQXJyYXk8dHMuRXhwcmVzc2lvbj59IGFyZ3Mg5Ye95pWw5Y+C5pWwXHJcbiAgICAgKiBAcmV0dXJuIHtTeW50YXhUcmVlTm9kZX0gIHtTeW50YXhUcmVlTm9kZX1cclxuICAgICAqIEBtZW1iZXJvZiBDb21waWxlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGFyc2VNZXRob2RlKGVzY2FwZWRUZXh0OiBzdHJpbmcsIGFyZ3M6IHRzLk5vZGVBcnJheTx0cy5FeHByZXNzaW9uPik6IFN5bnRheFRyZWVOb2RlIHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9IG5ldyBTeW50YXhUcmVlTm9kZShFeHByZXNzaW9uc1Rva2VuLkNhbGxFeHByZXNzaW9uLCBlc2NhcGVkVGV4dCwgdm9pZCAwLCB2b2lkIDAsIDAsIFwiXCIsIFtdKTtcclxuICAgICAgICBhcmdzLmZvckVhY2goYXJnID0+IHtcclxuICAgICAgICAgICAgc3dpdGNoIChhcmcua2luZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5OdW1lcmljTGl0ZXJhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsoYXJnIGFzIHRzLklkZW50aWZpZXIpLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYXJncy5wdXNoKGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBuZXcgU3ludGF4VHJlZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25zVG9rZW4uU3RyaW5nTGl0ZXJhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChhcmcgYXMgdHMuSWRlbnRpZmllcikudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hcmdzLnB1c2gobCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoYXJnIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikuZXhwcmVzc2lvbi5raW5kICE9IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCLlvZPliY3lh73mlbDlj4LmlbDnsbvlnovmmoLmnKrlrp7njrBcIixcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsID0gbmV3IFN5bnRheFRyZWVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uc1Rva2VuLk1vZExpdGVyYWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoYXJnIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5lc2NhcGVkVGV4dCBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGFyZyBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pLm5hbWUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFyZ3MucHVzaChsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmV4cHJlc3Npb24gPSBFeHByZXNzaW9uc1Rva2VuLkNhbGxDYWxsRXhwcmVzc2lvbjtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlr7nkuo7lh73mlbDlj4LmlbDmmK/lh73mlbDosIPnlKjml7ZcclxuICAgICAgICAgICAgICAgICAgICAvLyDmiJHku6zmgLvmmK/miorkvZzkuLrlj4LmlbDnmoTlh73mlbDmlL7lnKjniLboioLngrnnmoTlt6bovrlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsID0gdGhpcy5wYXJzZU1ldGhvZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoYXJnIGFzIHRzLkNhbGxFeHByZXNzaW9uKS5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpLmVzY2FwZWRUZXh0IGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGFyZyBhcyB0cy5DYWxsRXhwcmVzc2lvbikuYXJndW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYXJncy5wdXNoKGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG5ldyBTeW50YXhUcmVlTm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbnNUb2tlbi5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG4gPSBcIntcIjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gKChhcmcgYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wZXJ0aWVzIGFzIHVua25vd24pIGFzIHRzLlByb3BlcnR5QXNzaWdubWVudFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydGllLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9ICdcIicgKyAocHJvcGVydGllLm5hbWUgYXMgdHMuSWRlbnRpZmllcikuZXNjYXBlZFRleHQgKyAnXCInO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9IFwiOlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZS5pbml0aWFsaXplci5raW5kID09IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0aWUuaW5pdGlhbGl6ZXIua2luZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gKz0gKyhwcm9wZXJ0aWUuaW5pdGlhbGl6ZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gKz0gKydcIicgKyAocHJvcGVydGllLmluaXRpYWxpemVyIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQgKyAnXCInO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByZWZpeFVuYXJ5RXhwcmVzc2lvbjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuICs9ICgocHJvcGVydGllLmluaXRpYWxpemVyIGFzIHRzLlByZWZpeFVuYXJ5RXhwcmVzc2lvbikub3BlcmFuZCBhcyB0cy5JZGVudGlmaWVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUsIFwi5a+56LGh57G75Z6L5LiN5pSv5oyB5b2T5YmN6KGo6L6+5byPOlwiICsgcHJvcGVydGllLmluaXRpYWxpemVyLmtpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBwcm9wZXJ0aWVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gKz0gXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBuICs9IFwifVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGwudmFsU3RyaW5nID0gbjtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hcmdzLnB1c2gobCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydCh0cnVlLCBcIuW9k+WJjeWHveaVsOWPguaVsOexu+Wei+aaguacquWunueOsFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBjaGlsZDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGUoc291cmNlOiBzdHJpbmcsIHR5cGU6IFNvdXJjZVR5cGUpOiBFeHByZXNzaW9ucyB7XHJcbiAgICBjb25zdCBjb21waWxlciA9IG5ldyBDb21waWxlcihzb3VyY2UsIHR5cGUpO1xyXG4gICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBsaWUoKTtcclxufVxyXG4iXX0=