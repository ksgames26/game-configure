"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crc32 = __importStar(require("crc-32"));
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const vue_1 = require("vue");
const package_json_1 = __importDefault(require("../../../package.json"));
const parser_1 = require("../../compiler/parser");
function countExports(filePath) {
    // 创建项目
    const project = new ts_morph_1.Project();
    // 添加源文件
    const sourceFile = project.addSourceFileAtPath(filePath);
    // 获取所有导出声明
    const exports = {
        // 获取 export 声明
        exportDeclarations: sourceFile.getExportDeclarations(),
        // 获取 export default 声明
        defaultExports: sourceFile.getDefaultExportSymbol() ? 1 : 0,
        // 获取带有 export 关键字的变量声明
        exportVariables: sourceFile.getVariableDeclarations().filter(d => d.hasExportKeyword()),
        // 获取带有 export 关键字的函数声明
        exportFunctions: sourceFile.getFunctions().filter(f => f.hasExportKeyword()),
        // 获取带有 export 关键字的类声明
        exportClasses: sourceFile.getClasses().filter(c => c.hasExportKeyword()),
        // 获取带有 export 关键字的接口声明
        exportInterfaces: sourceFile.getInterfaces().filter(i => i.hasExportKeyword())
    };
    // // 打印结果
    // console.log(`文件 ${filePath} 中的导出统计：`);
    // console.log(`- export 声明数量: ${exports.exportDeclarations.length}`);
    // console.log(`- export default 数量: ${exports.defaultExports}`);
    // console.log(`- 导出变量数量: ${exports.exportVariables.length}`);
    // console.log(`- 导出函数数量: ${exports.exportFunctions.length}`);
    // console.log(`- 导出类数量: ${exports.exportClasses.length}`);
    // console.log(`- 导出接口数量: ${exports.exportInterfaces.length}`);
    // // 获取具体的导出名称
    // const exportNames = sourceFile.getExportSymbols().map(symbol => symbol.getName());
    // console.log('导出的具体名称:', exportNames);
    return exports;
}
function removeFilesInDirectory(dirPath) {
    try {
        const items = (0, fs_1.readdirSync)(dirPath);
        for (const item of items) {
            const fullPath = (0, path_1.join)(dirPath, item);
            const stats = (0, fs_1.statSync)(fullPath);
            // 如果是文件就删除，是目录就跳过
            if (stats.isFile()) {
                (0, fs_1.unlinkSync)(fullPath);
            }
        }
    }
    catch (error) {
        console.error('删除文件失败:', error);
        throw error; // 或者根据需要处理错误
    }
}
function isValidPath(path) {
    try {
        // 规范化路径
        const normalizedPath = (0, path_1.normalize)(path);
        // 基本路径格式检查
        const pathRegex = /^(?:[a-zA-Z]:\\|\/)[^<>:"|?*]+$/;
        // 检查是否为绝对路径
        const isAbsolutePath = (0, path_1.isAbsolute)(normalizedPath);
        // 返回综合检查结果
        return pathRegex.test(normalizedPath) && isAbsolutePath;
    }
    catch (e) {
        return false;
    }
}
function hasSubDirectories(dirPath) {
    try {
        const items = (0, fs_1.readdirSync)(dirPath);
        return items.some(item => {
            const fullPath = (0, path_1.join)(dirPath, item);
            return (0, fs_1.statSync)(fullPath).isDirectory();
        });
    }
    catch (error) {
        console.error('检查目录失败:', error);
        return false;
    }
}
let path = Editor.Package.getPath(package_json_1.default.name);
let file = (0, path_1.join)(path, "config.json");
if (!(0, fs_1.existsSync)(file)) {
    (0, fs_1.writeFileSync)(file, JSON.stringify({
        xlsxPath: "",
        protobufPath: "",
        exportDirector: "",
        exportTSDirector: "",
        modFile: "",
        protobufRegisterPath: "",
        protobufRegisterFile: "",
        globalModuleName: "IGameFramework", // 默认的模块名
        globalModuleTSName: "ksgames26", // 默认的文件名称
        globalModuleInterfaceName: "ITableConf" // 默认的接口名
    }));
}
const save = function (xlsxPath, exportDirector, exportTSDirector, modFile, globalModuleName, globalModuleTSName, globalModuleInterfaceName, protobufPath, protobufRegisterPath, protobufRegisterFile) {
    (0, fs_1.writeFileSync)(file, JSON.stringify({
        xlsxPath: xlsxPath,
        exportDirector: exportDirector,
        exportTSDirector: exportTSDirector,
        modFile: modFile,
        globalModuleName: globalModuleName,
        globalModuleTSName: globalModuleTSName,
        globalModuleInterfaceName: globalModuleInterfaceName,
        protobufPath: protobufPath,
        protobufRegisterPath: protobufRegisterPath,
        protobufRegisterFile: protobufRegisterFile
    }));
};
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    var data = JSON.parse((0, fs_extra_1.readFileSync)(file, { encoding: "utf-8" }));
                    return {
                        activeTab: 'tab1',
                        xlsxPath: data.xlsxPath,
                        exportDirector: data.exportDirector,
                        exportTSDirector: data.exportTSDirector,
                        modFile: data.modFile,
                        protobufRegisterPath: data.protobufRegisterPath,
                        protobufRegisterFile: data.protobufRegisterFile,
                        protobufPath: data.protobufPath,
                        globalModuleName: data.globalModuleName,
                        globalModuleTSName: data.globalModuleTSName,
                        globalModuleInterfaceName: data.globalModuleInterfaceName,
                        count: 0,
                        posts: [],
                        buildLogs: [], // 用于存储构建日志
                    };
                },
                methods: {
                    switchTab(tabName) {
                        this.activeTab = tabName;
                    },
                    onSetXlsxPath(director) {
                        this.xlsxPath = director;
                        this.save();
                    },
                    onSetExportDirector(director) {
                        this.exportDirector = director;
                        this.save();
                    },
                    onSetExportTSDirector(director) {
                        this.exportTSDirector = director;
                        this.save();
                    },
                    onSetGlobalModuleName(name) {
                        this.globalModuleName = name;
                        this.save();
                    },
                    onSetGlobalModuleTSName(name) {
                        this.globalModuleTSName = name;
                        this.save();
                    },
                    onSetGlobalModuleInterfaceName(name) {
                        this.globalModuleInterfaceName = name;
                        this.save();
                    },
                    onSetModFile(file) {
                        this.modFile = file;
                        this.save();
                    },
                    save() {
                        save(this.xlsxPath, this.exportDirector, this.exportTSDirector, this.modFile, this.globalModuleName, this.globalModuleTSName, this.globalModuleInterfaceName, this.protobufPath, this.protobufRegisterPath, this.protobufRegisterFile);
                    },
                    onSetProtobufPath(file) {
                        this.protobufPath = file;
                        this.save();
                    },
                    onSetProtobufRegisterPath(path) {
                        this.protobufRegisterPath = path;
                        this.save();
                    },
                    onSetProtobufRegisterFile(file) {
                        this.protobufRegisterFile = file;
                        this.save();
                    },
                    async onParser() {
                        this.posts.length = 0;
                        this.count = 0;
                        if (!this.modFile)
                            this.modFile = "client";
                        const p = this.xlsxPath.replace(Editor.Project.path, "db:/");
                        if (!(0, fs_extra_1.pathExistsSync)(p)) {
                            Editor.Dialog.info("xlsx文件目录不存在");
                            return;
                        }
                        if (this.xlsxPath && this.exportDirector && this.exportTSDirector && this.modFile) {
                            const options = new parser_1.ParserOptions(this.xlsxPath, this.exportDirector, this.exportTSDirector, this.modFile, this.globalModuleName, this.globalModuleTSName, this.globalModuleInterfaceName);
                            const parser = new parser_1.Parser(options);
                            await parser.execute((data) => {
                                data.forEach(e => {
                                    this.posts.push(e);
                                });
                            }, (name, success) => {
                                let find = this.posts.find((e) => e.id == name);
                                if (find) {
                                    find.value = success;
                                }
                            }, progress => {
                                this.count = progress;
                            });
                            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
                        }
                        else {
                            await Editor.Dialog.info("配置文件不能为空");
                        }
                    },
                    // 添加日志的方法
                    addBuildLog(message) {
                        this.buildLogs.push(message);
                        // 自动滚动到底部
                        this.$nextTick(() => {
                            const logList = document.querySelector('.log-list');
                            if (logList) {
                                logList.scrollTop = logList.scrollHeight;
                            }
                        });
                    },
                    async onBuildProtobuf() {
                        if (this.protobufRegisterFile && this.protobufRegisterPath && this.protobufPath) {
                            if (isValidPath(this.protobufRegisterFile)) {
                                await Editor.Dialog.info("注册文件不是路径，而是文件名");
                                return;
                            }
                            const rPath = this.protobufRegisterPath.replace("project:/", Editor.Project.path);
                            if (!(0, fs_1.existsSync)(rPath)) {
                                this.addBuildLog(`${rPath} 不存在，创建目录...`);
                                (0, fs_extra_1.emptyDirSync)(rPath);
                            }
                            else {
                                if (hasSubDirectories(rPath)) {
                                    this.addBuildLog('输出目录有子目录, 仅仅清空根目录而不删除子目录...');
                                    const items = (0, fs_1.readdirSync)(rPath);
                                    for (const item of items) {
                                        const fullPath = (0, path_1.join)(rPath, item);
                                        const stats = (0, fs_1.statSync)(fullPath);
                                        if (stats.isFile()) {
                                            const p = rPath.replace(Editor.Project.path, "db:/");
                                            const uuid = await Editor.Message.request("asset-db", "query-uuid", p);
                                            if (uuid) {
                                                await Editor.Message.request("asset-db", "delete-asset", uuid);
                                            }
                                        }
                                    }
                                }
                                else {
                                    this.addBuildLog('输出目录没有子目录，通过删除文件夹再创建文件夹的方式清空目录...');
                                    const p = rPath.replace(Editor.Project.path, "db:/");
                                    const uuid = await Editor.Message.request("asset-db", "query-uuid", p);
                                    if (uuid) {
                                        await Editor.Message.request("asset-db", "delete-asset", uuid);
                                    }
                                    await new Promise(resolve => { setTimeout(resolve, 2000); });
                                }
                            }
                            // 上面会删掉rPath目录
                            if (!(0, fs_1.existsSync)(rPath)) {
                                this.addBuildLog(`${rPath} 不存在，创建目录...`);
                                (0, fs_extra_1.emptyDirSync)(rPath);
                            }
                            this.buildLogs = []; // 清空之前的日志
                            this.addBuildLog('开始编译协议...');
                            this.addBuildLog('创建一个临时目录用来编译协议的输出路径...');
                            let protobufOutTemp = (0, path_1.join)(path, ".protobufOutTemp");
                            if (!(0, fs_1.existsSync)(protobufOutTemp)) {
                                (0, fs_extra_1.mkdirSync)(protobufOutTemp);
                            }
                            this.addBuildLog('编译协议到临时目录...');
                            try {
                                const isOk = await Editor.Message.request("game-configure", 'compier-protobuf', `npx protoc --ts_out ${protobufOutTemp} --proto_path ${this.protobufPath} ${this.protobufPath}/*.proto --experimental_allow_proto3_optional`);
                                if (isOk == "success") {
                                    this.addBuildLog('编译协议完成...');
                                }
                            }
                            catch (error) {
                                this.addBuildLog(`编译协议出错,${error.toString()}`);
                                console.error(error);
                            }
                            let content = ``;
                            const files = (0, fs_1.readdirSync)(protobufOutTemp);
                            if (files.length > 0) {
                                files.forEach(file => {
                                    let text = (0, fs_extra_1.readFileSync)(`${protobufOutTemp}/${file}`, "utf-8");
                                    text = text.replace(new RegExp("@protobuf-ts/runtime", "gm"), "db://game-protobuf/game-framework");
                                    this.addBuildLog(`修改${file}协议导入信息并拷贝到${this.protobufRegisterPath}...`);
                                    (0, fs_1.writeFileSync)(`${rPath}/${file}`, text);
                                    // 创建项目
                                    const project = new ts_morph_1.Project();
                                    // 添加源文件
                                    const sourceFile = project.addSourceFileAtPath(`${rPath}/${file}`);
                                    // 在添加,再添加容器
                                    sourceFile.addImportDeclarations([
                                        {
                                            isTypeOnly: false,
                                            namedImports: ["Container"],
                                            moduleSpecifier: "db://game-core/game-framework",
                                        },
                                    ]);
                                    // 添加cc导入
                                    sourceFile.addImportDeclarations([
                                        {
                                            isTypeOnly: false,
                                            namedImports: ["director"],
                                            moduleSpecifier: "cc",
                                        },
                                    ]);
                                    const w = project.createWriter();
                                    w.write(`director.on("game-framework-initialize", () => {`);
                                    // 获取所有导出的声明
                                    const exportedDeclarations = sourceFile.getExportedDeclarations();
                                    // 遍历所有导出
                                    exportedDeclarations.forEach((declarations, name) => {
                                        declarations.forEach(declaration => {
                                            // 检查声明类型
                                            if (declaration.getKind() === ts_morph_1.SyntaxKind.VariableDeclaration) {
                                                const varDecl = declaration.asKind(ts_morph_1.SyntaxKind.VariableDeclaration);
                                                const initializer = varDecl === null || varDecl === void 0 ? void 0 : varDecl.getInitializer();
                                                if ((initializer === null || initializer === void 0 ? void 0 : initializer.getKind()) === ts_morph_1.SyntaxKind.NewExpression) {
                                                    w.write(`Container.getInterface("IGameFramework.ISerializable")?.registerInst(${name});`);
                                                    w.newLine();
                                                    // 获取类声明
                                                    const classDeclaration = sourceFile.getClass(name + "$Type");
                                                    // 计算 CRC32 值
                                                    const crcValue = crc32.str(name); // 使用类名计算 CRC32
                                                    classDeclaration.addImplements(`IGameFramework.ISerializer`);
                                                    const getterStructure = {
                                                        name: "protoId",
                                                        kind: ts_morph_1.StructureKind.GetAccessor,
                                                        returnType: "number",
                                                        statements: `return ${crcValue};`,
                                                        isStatic: false, // 是否是静态方法
                                                        scope: ts_morph_1.Scope.Public // 访问范围
                                                    };
                                                    classDeclaration.addGetAccessor(getterStructure);
                                                }
                                            }
                                        });
                                    });
                                    sourceFile.getClasses().forEach(e => { e.getName(); });
                                    w.write(`});`);
                                    sourceFile.insertText(sourceFile.getEnd(), w.toString());
                                    sourceFile.formatText();
                                    (0, fs_1.writeFileSync)(`${rPath}/${file}`, sourceFile.getFullText());
                                });
                            }
                            this.addBuildLog('构建协议注入信息文件...');
                            const file = `${this.protobufRegisterPath}/${this.protobufRegisterFile}`;
                            this.addBuildLog('删除临时目录...');
                            (0, fs_extra_1.rmdirSync)(protobufOutTemp, { recursive: true });
                            this.addBuildLog('构建完毕，刷新资源数据库...');
                            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
                        }
                        else {
                            await Editor.Dialog.info("配置不能为空");
                        }
                    }
                }
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUFnQztBQUNoQywyQkFBa0Y7QUFDbEYsdUNBQTRGO0FBQzVGLCtCQUFtRDtBQUNuRCx1Q0FBc0c7QUFDdEcsNkJBQXFDO0FBQ3JDLHlFQUFnRDtBQUNoRCxrREFBOEQ7QUFFOUQsU0FBUyxZQUFZLENBQUMsUUFBZ0I7SUFDbEMsT0FBTztJQUNQLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQU8sRUFBRSxDQUFDO0lBRTlCLFFBQVE7SUFDUixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFekQsV0FBVztJQUNYLE1BQU0sT0FBTyxHQUFHO1FBQ1osZUFBZTtRQUNmLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRTtRQUN0RCx1QkFBdUI7UUFDdkIsY0FBYyxFQUFFLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsdUJBQXVCO1FBQ3ZCLGVBQWUsRUFBRSxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDN0QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCO1FBQ0QsdUJBQXVCO1FBQ3ZCLGVBQWUsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ2xELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QjtRQUNELHNCQUFzQjtRQUN0QixhQUFhLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QyxDQUFDLENBQUMsZ0JBQWdC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LEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ0QsV0FBVyxLQUFLLENBQUM7SUFDakIsS0FBSztRQUNELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNyYzMyIGZyb20gJ2NyYy0zMic7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgdW5saW5rU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgZW1wdHlEaXJTeW5jLCBta2RpclN5bmMsIHBhdGhFeGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHJtZGlyU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgaXNBYnNvbHV0ZSwgam9pbiwgbm9ybWFsaXplIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IEdldEFjY2Vzc29yRGVjbGFyYXRpb25TdHJ1Y3R1cmUsIFByb2plY3QsIFNjb3BlLCBTdHJ1Y3R1cmVLaW5kLCBTeW50YXhLaW5kIH0gZnJvbSBcInRzLW1vcnBoXCI7XHJcbmltcG9ydCB7IEFwcCwgY3JlYXRlQXBwIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCB7IFBhcnNlciwgUGFyc2VyT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbXBpbGVyL3BhcnNlcic7XHJcblxyXG5mdW5jdGlvbiBjb3VudEV4cG9ydHMoZmlsZVBhdGg6IHN0cmluZykge1xyXG4gICAgLy8g5Yib5bu66aG555uuXHJcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3QoKTtcclxuXHJcbiAgICAvLyDmt7vliqDmupDmlofku7ZcclxuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9qZWN0LmFkZFNvdXJjZUZpbGVBdFBhdGgoZmlsZVBhdGgpO1xyXG5cclxuICAgIC8vIOiOt+WPluaJgOacieWvvOWHuuWjsOaYjlxyXG4gICAgY29uc3QgZXhwb3J0cyA9IHtcclxuICAgICAgICAvLyDojrflj5YgZXhwb3J0IOWjsOaYjlxyXG4gICAgICAgIGV4cG9ydERlY2xhcmF0aW9uczogc291cmNlRmlsZS5nZXRFeHBvcnREZWNsYXJhdGlvbnMoKSxcclxuICAgICAgICAvLyDojrflj5YgZXhwb3J0IGRlZmF1bHQg5aOw5piOXHJcbiAgICAgICAgZGVmYXVsdEV4cG9ydHM6IHNvdXJjZUZpbGUuZ2V0RGVmYXVsdEV4cG9ydFN5bWJvbCgpID8gMSA6IDAsXHJcbiAgICAgICAgLy8g6I635Y+W5bim5pyJIGV4cG9ydCDlhbPplK7lrZfnmoTlj5jph4/lo7DmmI5cclxuICAgICAgICBleHBvcnRWYXJpYWJsZXM6IHNvdXJjZUZpbGUuZ2V0VmFyaWFibGVEZWNsYXJhdGlvbnMoKS5maWx0ZXIoZCA9PlxyXG4gICAgICAgICAgICBkLmhhc0V4cG9ydEtleXdvcmQoKVxyXG4gICAgICAgICksXHJcbiAgICAgICAgLy8g6I635Y+W5bim5pyJIGV4cG9ydCDlhbPplK7lrZfnmoTlh73mlbDlo7DmmI5cclxuICAgICAgICBleHBvcnRGdW5jdGlvbnM6IHNvdXJjZUZpbGUuZ2V0RnVuY3Rpb25zKCkuZmlsdGVyKGYgPT5cclxuICAgICAgICAgICAgZi5oYXNFeHBvcnRLZXl3b3JkKClcclxuICAgICAgICApLFxyXG4gICAgICAgIC8vIOiOt+WPluW4puaciSBleHBvcnQg5YWz6ZSu5a2X55qE57G75aOw5piOXHJcbiAgICAgICAgZXhwb3J0Q2xhc3Nlczogc291cmNlRmlsZS5nZXRDbGFzc2VzKCkuZmlsdGVyKGMgPT5cclxuICAgICAgICAgICAgYy5oYXNFeHBvcnRLZXl3b3JkKClcclxuICAgICAgICApLFxyXG4gICAgICAgIC8vIOiOt+WPluW4puaciSBleHBvcnQg5YWz6ZSu5a2X55qE5o6l5Y+j5aOw5piOXHJcbiAgICAgICAgZXhwb3J0SW50ZXJmYWNlczogc291cmNlRmlsZS5nZXRJbnRlcmZhY2VzKCkuZmlsdGVyKGkgPT5cclxuICAgICAgICAgICAgaS5oYXNFeHBvcnRLZXl3b3JkKClcclxuICAgICAgICApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIC8vIOaJk+WNsOe7k+aenFxyXG4gICAgLy8gY29uc29sZS5sb2coYOaWh+S7tiAke2ZpbGVQYXRofSDkuK3nmoTlr7zlh7rnu5/orqHvvJpgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGAtIGV4cG9ydCDlo7DmmI7mlbDph486ICR7ZXhwb3J0cy5leHBvcnREZWNsYXJhdGlvbnMubGVuZ3RofWApO1xyXG4gICAgLy8gY29uc29sZS5sb2coYC0gZXhwb3J0IGRlZmF1bHQg5pWw6YePOiAke2V4cG9ydHMuZGVmYXVsdEV4cG9ydHN9YCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgLSDlr7zlh7rlj5jph4/mlbDph486ICR7ZXhwb3J0cy5leHBvcnRWYXJpYWJsZXMubGVuZ3RofWApO1xyXG4gICAgLy8gY29uc29sZS5sb2coYC0g5a+85Ye65Ye95pWw5pWw6YePOiAke2V4cG9ydHMuZXhwb3J0RnVuY3Rpb25zLmxlbmd0aH1gKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGAtIOWvvOWHuuexu+aVsOmHjzogJHtleHBvcnRzLmV4cG9ydENsYXNzZXMubGVuZ3RofWApO1xyXG4gICAgLy8gY29uc29sZS5sb2coYC0g5a+85Ye65o6l5Y+j5pWw6YePOiAke2V4cG9ydHMuZXhwb3J0SW50ZXJmYWNlcy5sZW5ndGh9YCk7XHJcblxyXG4gICAgLy8gLy8g6I635Y+W5YW35L2T55qE5a+85Ye65ZCN56ewXHJcbiAgICAvLyBjb25zdCBleHBvcnROYW1lcyA9IHNvdXJjZUZpbGUuZ2V0RXhwb3J0U3ltYm9scygpLm1hcChzeW1ib2wgPT4gc3ltYm9sLmdldE5hbWUoKSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZygn5a+85Ye655qE5YW35L2T5ZCN56ewOicsIGV4cG9ydE5hbWVzKTtcclxuXHJcbiAgICByZXR1cm4gZXhwb3J0cztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlRmlsZXNJbkRpcmVjdG9yeShkaXJQYXRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgaXRlbXMgPSByZWFkZGlyU3luYyhkaXJQYXRoKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbihkaXJQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhmdWxsUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyDlpoLmnpzmmK/mlofku7blsLHliKDpmaTvvIzmmK/nm67lvZXlsLHot7Pov4dcclxuICAgICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB1bmxpbmtTeW5jKGZ1bGxQYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign5Yig6Zmk5paH5Lu25aSx6LSlOicsIGVycm9yKTtcclxuICAgICAgICB0aHJvdyBlcnJvcjsgLy8g5oiW6ICF5qC55o2u6ZyA6KaB5aSE55CG6ZSZ6K+vXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVmFsaWRQYXRoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyDop4TojIPljJbot6/lvoRcclxuICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcclxuXHJcbiAgICAgICAgLy8g5Z+65pys6Lev5b6E5qC85byP5qOA5p+lXHJcbiAgICAgICAgY29uc3QgcGF0aFJlZ2V4ID0gL14oPzpbYS16QS1aXTpcXFxcfFxcLylbXjw+OlwifD8qXSskLztcclxuXHJcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5Li657ud5a+56Lev5b6EXHJcbiAgICAgICAgY29uc3QgaXNBYnNvbHV0ZVBhdGggPSBpc0Fic29sdXRlKG5vcm1hbGl6ZWRQYXRoKTtcclxuXHJcbiAgICAgICAgLy8g6L+U5Zue57u85ZCI5qOA5p+l57uT5p6cXHJcbiAgICAgICAgcmV0dXJuIHBhdGhSZWdleC50ZXN0KG5vcm1hbGl6ZWRQYXRoKSAmJiBpc0Fic29sdXRlUGF0aDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc1N1YkRpcmVjdG9yaWVzKGRpclBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBpdGVtcyA9IHJlYWRkaXJTeW5jKGRpclBhdGgpO1xyXG4gICAgICAgIHJldHVybiBpdGVtcy5zb21lKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oZGlyUGF0aCwgaXRlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0U3luYyhmdWxsUGF0aCkuaXNEaXJlY3RvcnkoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign5qOA5p+l55uu5b2V5aSx6LSlOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBwYXRoID0gRWRpdG9yLlBhY2thZ2UuZ2V0UGF0aChwYWNrYWdlSlNPTi5uYW1lKSE7XHJcbmxldCBmaWxlID0gam9pbihwYXRoLCBcImNvbmZpZy5qc29uXCIpO1xyXG5pZiAoIWV4aXN0c1N5bmMoZmlsZSkpIHtcclxuICAgIHdyaXRlRmlsZVN5bmMoZmlsZSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHhsc3hQYXRoOiBcIlwiLFxyXG4gICAgICAgIHByb3RvYnVmUGF0aDogXCJcIixcclxuICAgICAgICBleHBvcnREaXJlY3RvcjogXCJcIixcclxuICAgICAgICBleHBvcnRUU0RpcmVjdG9yOiBcIlwiLFxyXG4gICAgICAgIG1vZEZpbGU6IFwiXCIsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IFwiXCIsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IFwiXCIsXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlTmFtZTogXCJJR2FtZUZyYW1ld29ya1wiLCAvLyDpu5jorqTnmoTmqKHlnZflkI1cclxuICAgICAgICBnbG9iYWxNb2R1bGVUU05hbWU6IFwia3NnYW1lczI2XCIsIC8vIOm7mOiupOeahOaWh+S7tuWQjeensFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IFwiSVRhYmxlQ29uZlwiIC8vIOm7mOiupOeahOaOpeWPo+WQjVxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5jb25zdCBzYXZlID0gZnVuY3Rpb24gKFxyXG4gICAgeGxzeFBhdGg6IHN0cmluZyxcclxuICAgIGV4cG9ydERpcmVjdG9yOiBzdHJpbmcsXHJcbiAgICBleHBvcnRUU0RpcmVjdG9yOiBzdHJpbmcsXHJcbiAgICBtb2RGaWxlOiBzdHJpbmcsXHJcbiAgICBnbG9iYWxNb2R1bGVOYW1lOiBzdHJpbmcsXHJcbiAgICBnbG9iYWxNb2R1bGVUU05hbWU6IHN0cmluZyxcclxuICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IHN0cmluZyxcclxuICAgIHByb3RvYnVmUGF0aDogc3RyaW5nLFxyXG4gICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IHN0cmluZyxcclxuICAgIHByb3RvYnVmUmVnaXN0ZXJGaWxlOiBzdHJpbmdcclxuKSB7XHJcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGUsIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICB4bHN4UGF0aDogeGxzeFBhdGgsXHJcbiAgICAgICAgZXhwb3J0RGlyZWN0b3I6IGV4cG9ydERpcmVjdG9yLFxyXG4gICAgICAgIGV4cG9ydFRTRGlyZWN0b3I6IGV4cG9ydFRTRGlyZWN0b3IsXHJcbiAgICAgICAgbW9kRmlsZTogbW9kRmlsZSxcclxuICAgICAgICBnbG9iYWxNb2R1bGVOYW1lOiBnbG9iYWxNb2R1bGVOYW1lLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZVRTTmFtZTogZ2xvYmFsTW9kdWxlVFNOYW1lLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUsXHJcbiAgICAgICAgcHJvdG9idWZQYXRoOiBwcm90b2J1ZlBhdGgsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IHByb3RvYnVmUmVnaXN0ZXJQYXRoLFxyXG4gICAgICAgIHByb3RvYnVmUmVnaXN0ZXJGaWxlOiBwcm90b2J1ZlJlZ2lzdGVyRmlsZVxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcclxuLyoqXHJcbiAqIEB6aCDlpoLmnpzluIzmnJvlhbzlrrkgMy4zIOS5i+WJjeeahOeJiOacrOWPr+S7peS9v+eUqOS4i+aWueeahOS7o+eggVxyXG4gKiBAZW4gWW91IGNhbiBhZGQgdGhlIGNvZGUgYmVsb3cgaWYgeW91IHdhbnQgY29tcGF0aWJpbGl0eSB3aXRoIHZlcnNpb25zIHByaW9yIHRvIDMuM1xyXG4gKi9cclxuLy8gRWRpdG9yLlBhbmVsLmRlZmluZSA9IEVkaXRvci5QYW5lbC5kZWZpbmUgfHwgZnVuY3Rpb24ob3B0aW9uczogYW55KSB7IHJldHVybiBvcHRpb25zIH1cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3IuUGFuZWwuZGVmaW5lKHtcclxuICAgIGxpc3RlbmVyczoge1xyXG4gICAgICAgIHNob3coKSB7IGNvbnNvbGUubG9nKCdzaG93Jyk7IH0sXHJcbiAgICAgICAgaGlkZSgpIHsgY29uc29sZS5sb2coJ2hpZGUnKTsgfSxcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcclxuICAgIHN0eWxlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvZGVmYXVsdC9pbmRleC5jc3MnKSwgJ3V0Zi04JyksXHJcbiAgICAkOiB7XHJcbiAgICAgICAgYXBwOiAnI2FwcCcsXHJcbiAgICB9LFxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgIH0sXHJcbiAgICByZWFkeSgpIHtcclxuICAgICAgICBpZiAodGhpcy4kLmFwcCkge1xyXG4gICAgICAgICAgICBjb25zdCBhcHAgPSBjcmVhdGVBcHAoe30pO1xyXG4gICAgICAgICAgICBhcHAuY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5pc0N1c3RvbUVsZW1lbnQgPSAodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgndWktJyk7XHJcbiAgICAgICAgICAgIGFwcC5jb21wb25lbnQoJ015Q291bnRlcicsIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvdnVlL2NvdW50ZXIuaHRtbCcpLCAndXRmLTgnKSxcclxuICAgICAgICAgICAgICAgIGRhdGEoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhmaWxlLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYjogJ3RhYjEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4bHN4UGF0aDogZGF0YS54bHN4UGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0RGlyZWN0b3I6IGRhdGEuZXhwb3J0RGlyZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydFRTRGlyZWN0b3I6IGRhdGEuZXhwb3J0VFNEaXJlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kRmlsZTogZGF0YS5tb2RGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyUGF0aDogZGF0YS5wcm90b2J1ZlJlZ2lzdGVyUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IGRhdGEucHJvdG9idWZSZWdpc3RlckZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvYnVmUGF0aDogZGF0YS5wcm90b2J1ZlBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbE1vZHVsZU5hbWU6IGRhdGEuZ2xvYmFsTW9kdWxlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsTW9kdWxlVFNOYW1lOiBkYXRhLmdsb2JhbE1vZHVsZVRTTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogZGF0YS5nbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdHM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZExvZ3M6IFtdLCAgLy8g55So5LqO5a2Y5YKo5p6E5bu65pel5b+XXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoVGFiKHRhYk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYk5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldFhsc3hQYXRoKGRpcmVjdG9yOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54bHN4UGF0aCA9IGRpcmVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0RXhwb3J0RGlyZWN0b3IoZGlyZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydERpcmVjdG9yID0gZGlyZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRFeHBvcnRUU0RpcmVjdG9yKGRpcmVjdG9yOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBvcnRUU0RpcmVjdG9yID0gZGlyZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRHbG9iYWxNb2R1bGVOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0R2xvYmFsTW9kdWxlVFNOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZVRTTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRHbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0TW9kRmlsZShmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RGaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzYXZlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlKHRoaXMueGxzeFBhdGgsIHRoaXMuZXhwb3J0RGlyZWN0b3IsIHRoaXMuZXhwb3J0VFNEaXJlY3RvciwgdGhpcy5tb2RGaWxlLCB0aGlzLmdsb2JhbE1vZHVsZU5hbWUsIHRoaXMuZ2xvYmFsTW9kdWxlVFNOYW1lLCB0aGlzLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUsIHRoaXMucHJvdG9idWZQYXRoLCB0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRoLCB0aGlzLnByb3RvYnVmUmVnaXN0ZXJGaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0UHJvdG9idWZQYXRoKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvYnVmUGF0aCA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRQcm90b2J1ZlJlZ2lzdGVyUGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aCA9IHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRQcm90b2J1ZlJlZ2lzdGVyRmlsZShmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgb25QYXJzZXIoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW9kRmlsZSkgdGhpcy5tb2RGaWxlID0gXCJjbGllbnRcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSB0aGlzLnhsc3hQYXRoLnJlcGxhY2UoRWRpdG9yLlByb2plY3QucGF0aCwgXCJkYjovXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBhdGhFeGlzdHNTeW5jKHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFZGl0b3IuRGlhbG9nLmluZm8oXCJ4bHN45paH5Lu255uu5b2V5LiN5a2Y5ZyoXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54bHN4UGF0aCAmJiB0aGlzLmV4cG9ydERpcmVjdG9yICYmIHRoaXMuZXhwb3J0VFNEaXJlY3RvciAmJiB0aGlzLm1vZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBuZXcgUGFyc2VyT3B0aW9ucyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnhsc3hQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0RGlyZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBvcnRUU0RpcmVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxNb2R1bGVUU05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcGFyc2VyLmV4ZWN1dGUoKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHMucHVzaChlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKG5hbWU6IHN0cmluZywgc3VjY2VzcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5kID0gdGhpcy5wb3N0cy5maW5kKChlOiB7IGlkOiBzdHJpbmcsIHZhbHVlOiBib29sZWFuIH0pID0+IGUuaWQgPT0gbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluZC52YWx1ZSA9IHN1Y2Nlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgcHJvZ3Jlc3MgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnQgPSBwcm9ncmVzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInJlZnJlc2gtYXNzZXRcIiwgXCJkYjovL2Fzc2V0c1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5EaWFsb2cuaW5mbyhcIumFjee9ruaWh+S7tuS4jeiDveS4uuepulwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5re75Yqg5pel5b+X55qE5pa55rOVXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQnVpbGRMb2cobWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRMb2dzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiHquWKqOa7muWKqOWIsOW6lemDqFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2dMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvZy1saXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0xpc3Quc2Nyb2xsVG9wID0gbG9nTGlzdC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgb25CdWlsZFByb3RvYnVmKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm90b2J1ZlJlZ2lzdGVyRmlsZSAmJiB0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRoICYmIHRoaXMucHJvdG9idWZQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZFBhdGgodGhpcy5wcm90b2J1ZlJlZ2lzdGVyRmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oXCLms6jlhozmlofku7bkuI3mmK/ot6/lvoTvvIzogIzmmK/mlofku7blkI1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJQYXRoID0gdGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aC5yZXBsYWNlKFwicHJvamVjdDovXCIsIEVkaXRvci5Qcm9qZWN0LnBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhyUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKGAke3JQYXRofSDkuI3lrZjlnKjvvIzliJvlu7rnm67lvZUuLi5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbXB0eURpclN5bmMoclBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzU3ViRGlyZWN0b3JpZXMoclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coJ+i+k+WHuuebruW9leacieWtkOebruW9lSwg5LuF5LuF5riF56m65qC555uu5b2V6ICM5LiN5Yig6Zmk5a2Q55uu5b2VLi4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IHJlYWRkaXJTeW5jKHJQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oclBhdGgsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhmdWxsUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IHJQYXRoLnJlcGxhY2UoRWRpdG9yLlByb2plY3QucGF0aCwgXCJkYjovXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJxdWVyeS11dWlkXCIsIHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcImRlbGV0ZS1hc3NldFwiLCB1dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfovpPlh7rnm67lvZXmsqHmnInlrZDnm67lvZXvvIzpgJrov4fliKDpmaTmlofku7blpLnlho3liJvlu7rmlofku7blpLnnmoTmlrnlvI/muIXnqbrnm67lvZUuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSByUGF0aC5yZXBsYWNlKEVkaXRvci5Qcm9qZWN0LnBhdGgsIFwiZGI6L1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJxdWVyeS11dWlkXCIsIHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcImFzc2V0LWRiXCIsIFwiZGVsZXRlLWFzc2V0XCIsIHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgc2V0VGltZW91dChyZXNvbHZlLCAyMDAwKSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LiK6Z2i5Lya5Yig5o6JclBhdGjnm67lvZVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhyUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKGAke3JQYXRofSDkuI3lrZjlnKjvvIzliJvlu7rnm67lvZUuLi5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbXB0eURpclN5bmMoclBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRMb2dzID0gW107ICAvLyDmuIXnqbrkuYvliY3nmoTml6Xlv5dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coJ+W8gOWni+e8luivkeWNj+iuri4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coJ+WIm+W7uuS4gOS4quS4tOaXtuebruW9leeUqOadpee8luivkeWNj+iurueahOi+k+WHuui3r+W+hC4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByb3RvYnVmT3V0VGVtcCA9IGpvaW4ocGF0aCwgXCIucHJvdG9idWZPdXRUZW1wXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKHByb3RvYnVmT3V0VGVtcCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBta2RpclN5bmMocHJvdG9idWZPdXRUZW1wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfnvJbor5HljY/orq7liLDkuLTml7bnm67lvZUuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNPayA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJnYW1lLWNvbmZpZ3VyZVwiLCAnY29tcGllci1wcm90b2J1ZicsIGBucHggcHJvdG9jIC0tdHNfb3V0ICR7cHJvdG9idWZPdXRUZW1wfSAtLXByb3RvX3BhdGggJHt0aGlzLnByb3RvYnVmUGF0aH0gJHt0aGlzLnByb3RvYnVmUGF0aH0vKi5wcm90byAtLWV4cGVyaW1lbnRhbF9hbGxvd19wcm90bzNfb3B0aW9uYWxgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNPayA9PSBcInN1Y2Nlc3NcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfnvJbor5HljY/orq7lrozmiJAuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZyhg57yW6K+R5Y2P6K6u5Ye66ZSZLCR7ZXJyb3IudG9TdHJpbmcoKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IGBgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gcmVhZGRpclN5bmMocHJvdG9idWZPdXRUZW1wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRleHQgPSByZWFkRmlsZVN5bmMoYCR7cHJvdG9idWZPdXRUZW1wfS8ke2ZpbGV9YCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKFwiQHByb3RvYnVmLXRzL3J1bnRpbWVcIiwgXCJnbVwiKSwgXCJkYjovL2dhbWUtcHJvdG9idWYvZ2FtZS1mcmFtZXdvcmtcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coYOS/ruaUuSR7ZmlsZX3ljY/orq7lr7zlhaXkv6Hmga/lubbmi7fotJ3liLAke3RoaXMucHJvdG9idWZSZWdpc3RlclBhdGh9Li4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoYCR7clBhdGh9LyR7ZmlsZX1gLCB0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWIm+W7uumhueebrlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5re75Yqg5rqQ5paH5Lu2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9qZWN0LmFkZFNvdXJjZUZpbGVBdFBhdGgoYCR7clBhdGh9LyR7ZmlsZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Zyo5re75YqgLOWGjea3u+WKoOWuueWZqFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlLmFkZEltcG9ydERlY2xhcmF0aW9ucyhbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNUeXBlT25seTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZWRJbXBvcnRzOiBbXCJDb250YWluZXJcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlU3BlY2lmaWVyOiBcImRiOi8vZ2FtZS1jb3JlL2dhbWUtZnJhbWV3b3JrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5re75YqgY2Plr7zlhaVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiZGlyZWN0b3JcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlU3BlY2lmaWVyOiBcImNjXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHcgPSBwcm9qZWN0LmNyZWF0ZVdyaXRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy53cml0ZShgZGlyZWN0b3Iub24oXCJnYW1lLWZyYW1ld29yay1pbml0aWFsaXplXCIsICgpID0+IHtgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPluaJgOacieWvvOWHuueahOWjsOaYjlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBvcnRlZERlY2xhcmF0aW9ucyA9IHNvdXJjZUZpbGUuZ2V0RXhwb3J0ZWREZWNsYXJhdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6YGN5Y6G5omA5pyJ5a+85Ye6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydGVkRGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2xhcmF0aW9ucywgbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6Xlo7DmmI7nsbvlnotcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24uZ2V0S2luZCgpID09PSBTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFyRGVjbCA9IGRlY2xhcmF0aW9uLmFzS2luZChTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbml0aWFsaXplciA9IHZhckRlY2w/LmdldEluaXRpYWxpemVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbGl6ZXI/LmdldEtpbmQoKSA9PT0gU3ludGF4S2luZC5OZXdFeHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGBDb250YWluZXIuZ2V0SW50ZXJmYWNlKFwiSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6YWJsZVwiKT8ucmVnaXN0ZXJJbnN0KCR7bmFtZX0pO2ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy5uZXdMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bnsbvlo7DmmI5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gPSBzb3VyY2VGaWxlLmdldENsYXNzKG5hbWUgKyBcIiRUeXBlXCIpITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuoeeulyBDUkMzMiDlgLxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyY1ZhbHVlID0gY3JjMzIuc3RyKG5hbWUpOyAvLyDkvb/nlKjnsbvlkI3orqHnrpcgQ1JDMzJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzRGVjbGFyYXRpb24uYWRkSW1wbGVtZW50cyhgSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6ZXJgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdldHRlclN0cnVjdHVyZTogR2V0QWNjZXNzb3JEZWNsYXJhdGlvblN0cnVjdHVyZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInByb3RvSWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBTdHJ1Y3R1cmVLaW5kLkdldEFjY2Vzc29yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50czogYHJldHVybiAke2NyY1ZhbHVlfTtgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhdGljOiBmYWxzZSwgICAgICAgIC8vIOaYr+WQpuaYr+mdmeaAgeaWueazlVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlOiBTY29wZS5QdWJsaWMgICAgICAgICAvLyDorr/pl67ojIPlm7RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0RlY2xhcmF0aW9uLmFkZEdldEFjY2Vzc29yKGdldHRlclN0cnVjdHVyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5nZXRDbGFzc2VzKCkuZm9yRWFjaChlID0+IHsgZS5nZXROYW1lKCkgfSlcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGB9KTtgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5pbnNlcnRUZXh0KHNvdXJjZUZpbGUuZ2V0RW5kKCksIHcudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuZm9ybWF0VGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhgJHtyUGF0aH0vJHtmaWxlfWAsIHNvdXJjZUZpbGUuZ2V0RnVsbFRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn5p6E5bu65Y2P6K6u5rOo5YWl5L+h5oGv5paH5Lu2Li4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gYCR7dGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aH0vJHt0aGlzLnByb3RvYnVmUmVnaXN0ZXJGaWxlfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn5Yig6Zmk5Li05pe255uu5b2VLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBybWRpclN5bmMocHJvdG9idWZPdXRUZW1wLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfmnoTlu7rlrozmr5XvvIzliLfmlrDotYTmupDmlbDmja7lupMuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInJlZnJlc2gtYXNzZXRcIiwgXCJkYjovL2Fzc2V0c1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5EaWFsb2cuaW5mbyhcIumFjee9ruS4jeiDveS4uuepulwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFwcC5tb3VudCh0aGlzLiQuYXBwKTtcclxuICAgICAgICAgICAgcGFuZWxEYXRhTWFwLnNldCh0aGlzLCBhcHApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBiZWZvcmVDbG9zZSgpIHsgfSxcclxuICAgIGNsb3NlKCkge1xyXG4gICAgICAgIGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XHJcbiAgICAgICAgaWYgKGFwcCkge1xyXG4gICAgICAgICAgICBhcHAudW5tb3VudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pO1xyXG4iXX0=