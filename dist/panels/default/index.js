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
                                                    // 方法1：直接添加 implements 子句
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUFnQztBQUNoQywyQkFBa0Y7QUFDbEYsdUNBQTRFO0FBQzVFLCtCQUFtRDtBQUNuRCx1Q0FBc0c7QUFDdEcsNkJBQXFDO0FBQ3JDLHlFQUFnRDtBQUNoRCxrREFBOEQ7QUFFOUQsU0FBUyxZQUFZLENBQUMsUUFBZ0I7SUFDbEMsT0FBTztJQUNQLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQU8sRUFBRSxDQUFDO0lBRTlCLFFBQVE7SUFDUixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFekQsV0FBVztJQUNYLE1BQU0sT0FBTyxHQUFHO1FBQ1osZUFBZTtRQUNmLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRTtRQUN0RCx1QkFBdUI7UUFDdkIsY0FBYyxFQUFFLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsdUJBQXVCO1FBQ3ZCLGVBQWUsRUFBRSxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDN0QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCO1FBQ0QsdUJBQXVCO1FBQ3ZCLGVBQWUsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ2xELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QjtRQUNELHNCQUFzQjtRQUN0QixhQUFhLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QyxDQUFDLENBQUMsZ0JBQWdC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SUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNyYzMyIGZyb20gJ2NyYy0zMic7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgdW5saW5rU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgZW1wdHlEaXJTeW5jLCBta2RpclN5bmMsIHJlYWRGaWxlU3luYywgcm1kaXJTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBpc0Fic29sdXRlLCBqb2luLCBub3JtYWxpemUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgR2V0QWNjZXNzb3JEZWNsYXJhdGlvblN0cnVjdHVyZSwgUHJvamVjdCwgU2NvcGUsIFN0cnVjdHVyZUtpbmQsIFN5bnRheEtpbmQgfSBmcm9tIFwidHMtbW9ycGhcIjtcclxuaW1wb3J0IHsgQXBwLCBjcmVhdGVBcHAgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vLi4vLi4vcGFja2FnZS5qc29uJztcclxuaW1wb3J0IHsgUGFyc2VyLCBQYXJzZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tcGlsZXIvcGFyc2VyJztcclxuXHJcbmZ1bmN0aW9uIGNvdW50RXhwb3J0cyhmaWxlUGF0aDogc3RyaW5nKSB7XHJcbiAgICAvLyDliJvlu7rpobnnm65cclxuICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdCgpO1xyXG5cclxuICAgIC8vIOa3u+WKoOa6kOaWh+S7tlxyXG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHByb2plY3QuYWRkU291cmNlRmlsZUF0UGF0aChmaWxlUGF0aCk7XHJcblxyXG4gICAgLy8g6I635Y+W5omA5pyJ5a+85Ye65aOw5piOXHJcbiAgICBjb25zdCBleHBvcnRzID0ge1xyXG4gICAgICAgIC8vIOiOt+WPliBleHBvcnQg5aOw5piOXHJcbiAgICAgICAgZXhwb3J0RGVjbGFyYXRpb25zOiBzb3VyY2VGaWxlLmdldEV4cG9ydERlY2xhcmF0aW9ucygpLFxyXG4gICAgICAgIC8vIOiOt+WPliBleHBvcnQgZGVmYXVsdCDlo7DmmI5cclxuICAgICAgICBkZWZhdWx0RXhwb3J0czogc291cmNlRmlsZS5nZXREZWZhdWx0RXhwb3J0U3ltYm9sKCkgPyAxIDogMCxcclxuICAgICAgICAvLyDojrflj5bluKbmnIkgZXhwb3J0IOWFs+mUruWtl+eahOWPmOmHj+WjsOaYjlxyXG4gICAgICAgIGV4cG9ydFZhcmlhYmxlczogc291cmNlRmlsZS5nZXRWYXJpYWJsZURlY2xhcmF0aW9ucygpLmZpbHRlcihkID0+XHJcbiAgICAgICAgICAgIGQuaGFzRXhwb3J0S2V5d29yZCgpXHJcbiAgICAgICAgKSxcclxuICAgICAgICAvLyDojrflj5bluKbmnIkgZXhwb3J0IOWFs+mUruWtl+eahOWHveaVsOWjsOaYjlxyXG4gICAgICAgIGV4cG9ydEZ1bmN0aW9uczogc291cmNlRmlsZS5nZXRGdW5jdGlvbnMoKS5maWx0ZXIoZiA9PlxyXG4gICAgICAgICAgICBmLmhhc0V4cG9ydEtleXdvcmQoKVxyXG4gICAgICAgICksXHJcbiAgICAgICAgLy8g6I635Y+W5bim5pyJIGV4cG9ydCDlhbPplK7lrZfnmoTnsbvlo7DmmI5cclxuICAgICAgICBleHBvcnRDbGFzc2VzOiBzb3VyY2VGaWxlLmdldENsYXNzZXMoKS5maWx0ZXIoYyA9PlxyXG4gICAgICAgICAgICBjLmhhc0V4cG9ydEtleXdvcmQoKVxyXG4gICAgICAgICksXHJcbiAgICAgICAgLy8g6I635Y+W5bim5pyJIGV4cG9ydCDlhbPplK7lrZfnmoTmjqXlj6Plo7DmmI5cclxuICAgICAgICBleHBvcnRJbnRlcmZhY2VzOiBzb3VyY2VGaWxlLmdldEludGVyZmFjZXMoKS5maWx0ZXIoaSA9PlxyXG4gICAgICAgICAgICBpLmhhc0V4cG9ydEtleXdvcmQoKVxyXG4gICAgICAgIClcclxuICAgIH07XHJcblxyXG4gICAgLy8gLy8g5omT5Y2w57uT5p6cXHJcbiAgICAvLyBjb25zb2xlLmxvZyhg5paH5Lu2ICR7ZmlsZVBhdGh9IOS4reeahOWvvOWHuue7n+iuoe+8mmApO1xyXG4gICAgLy8gY29uc29sZS5sb2coYC0gZXhwb3J0IOWjsOaYjuaVsOmHjzogJHtleHBvcnRzLmV4cG9ydERlY2xhcmF0aW9ucy5sZW5ndGh9YCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgLSBleHBvcnQgZGVmYXVsdCDmlbDph486ICR7ZXhwb3J0cy5kZWZhdWx0RXhwb3J0c31gKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGAtIOWvvOWHuuWPmOmHj+aVsOmHjzogJHtleHBvcnRzLmV4cG9ydFZhcmlhYmxlcy5sZW5ndGh9YCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgLSDlr7zlh7rlh73mlbDmlbDph486ICR7ZXhwb3J0cy5leHBvcnRGdW5jdGlvbnMubGVuZ3RofWApO1xyXG4gICAgLy8gY29uc29sZS5sb2coYC0g5a+85Ye657G75pWw6YePOiAke2V4cG9ydHMuZXhwb3J0Q2xhc3Nlcy5sZW5ndGh9YCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgLSDlr7zlh7rmjqXlj6PmlbDph486ICR7ZXhwb3J0cy5leHBvcnRJbnRlcmZhY2VzLmxlbmd0aH1gKTtcclxuXHJcbiAgICAvLyAvLyDojrflj5blhbfkvZPnmoTlr7zlh7rlkI3np7BcclxuICAgIC8vIGNvbnN0IGV4cG9ydE5hbWVzID0gc291cmNlRmlsZS5nZXRFeHBvcnRTeW1ib2xzKCkubWFwKHN5bWJvbCA9PiBzeW1ib2wuZ2V0TmFtZSgpKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKCflr7zlh7rnmoTlhbfkvZPlkI3np7A6JywgZXhwb3J0TmFtZXMpO1xyXG5cclxuICAgIHJldHVybiBleHBvcnRzO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVGaWxlc0luRGlyZWN0b3J5KGRpclBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBpdGVtcyA9IHJlYWRkaXJTeW5jKGRpclBhdGgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBqb2luKGRpclBhdGgsIGl0ZW0pO1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGZ1bGxQYXRoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOWmguaenOaYr+aWh+S7tuWwseWIoOmZpO+8jOaYr+ebruW9leWwsei3s+i/h1xyXG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHVubGlua1N5bmMoZnVsbFBhdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfliKDpmaTmlofku7blpLHotKU6JywgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IGVycm9yOyAvLyDmiJbogIXmoLnmja7pnIDopoHlpITnkIbplJnor69cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNWYWxpZFBhdGgocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIOinhOiMg+WMlui3r+W+hFxyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gbm9ybWFsaXplKHBhdGgpO1xyXG5cclxuICAgICAgICAvLyDln7rmnKzot6/lvoTmoLzlvI/mo4Dmn6VcclxuICAgICAgICBjb25zdCBwYXRoUmVnZXggPSAvXig/OlthLXpBLVpdOlxcXFx8XFwvKVtePD46XCJ8PypdKyQvO1xyXG5cclxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbkuLrnu53lr7not6/lvoRcclxuICAgICAgICBjb25zdCBpc0Fic29sdXRlUGF0aCA9IGlzQWJzb2x1dGUobm9ybWFsaXplZFBhdGgpO1xyXG5cclxuICAgICAgICAvLyDov5Tlm57nu7zlkIjmo4Dmn6Xnu5PmnpxcclxuICAgICAgICByZXR1cm4gcGF0aFJlZ2V4LnRlc3Qobm9ybWFsaXplZFBhdGgpICYmIGlzQWJzb2x1dGVQYXRoO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFzU3ViRGlyZWN0b3JpZXMoZGlyUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGl0ZW1zID0gcmVhZGRpclN5bmMoZGlyUGF0aCk7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW1zLnNvbWUoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbihkaXJQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRTeW5jKGZ1bGxQYXRoKS5pc0RpcmVjdG9yeSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfmo4Dmn6Xnm67lvZXlpLHotKU6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxubGV0IHBhdGggPSBFZGl0b3IuUGFja2FnZS5nZXRQYXRoKHBhY2thZ2VKU09OLm5hbWUpITtcclxubGV0IGZpbGUgPSBqb2luKHBhdGgsIFwiY29uZmlnLmpzb25cIik7XHJcbmlmICghZXhpc3RzU3luYyhmaWxlKSkge1xyXG4gICAgd3JpdGVGaWxlU3luYyhmaWxlLCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgeGxzeFBhdGg6IFwiXCIsXHJcbiAgICAgICAgcHJvdG9idWZQYXRoOiBcIlwiLFxyXG4gICAgICAgIGV4cG9ydERpcmVjdG9yOiBcIlwiLFxyXG4gICAgICAgIGV4cG9ydFRTRGlyZWN0b3I6IFwiXCIsXHJcbiAgICAgICAgbW9kRmlsZTogXCJcIixcclxuICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyUGF0aDogXCJcIixcclxuICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyRmlsZTogXCJcIixcclxuICAgICAgICBnbG9iYWxNb2R1bGVOYW1lOiBcIklHYW1lRnJhbWV3b3JrXCIsIC8vIOm7mOiupOeahOaooeWdl+WQjVxyXG4gICAgICAgIGdsb2JhbE1vZHVsZVRTTmFtZTogXCJrc2dhbWVzMjZcIiwgLy8g6buY6K6k55qE5paH5Lu25ZCN56ewXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogXCJJVGFibGVDb25mXCIgLy8g6buY6K6k55qE5o6l5Y+j5ZCNXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhdmUgPSBmdW5jdGlvbiAoXHJcbiAgICB4bHN4UGF0aDogc3RyaW5nLFxyXG4gICAgZXhwb3J0RGlyZWN0b3I6IHN0cmluZyxcclxuICAgIGV4cG9ydFRTRGlyZWN0b3I6IHN0cmluZyxcclxuICAgIG1vZEZpbGU6IHN0cmluZyxcclxuICAgIGdsb2JhbE1vZHVsZU5hbWU6IHN0cmluZyxcclxuICAgIGdsb2JhbE1vZHVsZVRTTmFtZTogc3RyaW5nLFxyXG4gICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogc3RyaW5nLFxyXG4gICAgcHJvdG9idWZQYXRoOiBzdHJpbmcsXHJcbiAgICBwcm90b2J1ZlJlZ2lzdGVyUGF0aDogc3RyaW5nLFxyXG4gICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IHN0cmluZ1xyXG4pIHtcclxuICAgIHdyaXRlRmlsZVN5bmMoZmlsZSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHhsc3hQYXRoOiB4bHN4UGF0aCxcclxuICAgICAgICBleHBvcnREaXJlY3RvcjogZXhwb3J0RGlyZWN0b3IsXHJcbiAgICAgICAgZXhwb3J0VFNEaXJlY3RvcjogZXhwb3J0VFNEaXJlY3RvcixcclxuICAgICAgICBtb2RGaWxlOiBtb2RGaWxlLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZU5hbWU6IGdsb2JhbE1vZHVsZU5hbWUsXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlVFNOYW1lOiBnbG9iYWxNb2R1bGVUU05hbWUsXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSxcclxuICAgICAgICBwcm90b2J1ZlBhdGg6IHByb3RvYnVmUGF0aCxcclxuICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyUGF0aDogcHJvdG9idWZSZWdpc3RlclBhdGgsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IHByb3RvYnVmUmVnaXN0ZXJGaWxlXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbmNvbnN0IHBhbmVsRGF0YU1hcCA9IG5ldyBXZWFrTWFwPGFueSwgQXBwPigpO1xyXG4vKipcclxuICogQHpoIOWmguaenOW4jOacm+WFvOWuuSAzLjMg5LmL5YmN55qE54mI5pys5Y+v5Lul5L2/55So5LiL5pa555qE5Luj56CBXHJcbiAqIEBlbiBZb3UgY2FuIGFkZCB0aGUgY29kZSBiZWxvdyBpZiB5b3Ugd2FudCBjb21wYXRpYmlsaXR5IHdpdGggdmVyc2lvbnMgcHJpb3IgdG8gMy4zXHJcbiAqL1xyXG4vLyBFZGl0b3IuUGFuZWwuZGVmaW5lID0gRWRpdG9yLlBhbmVsLmRlZmluZSB8fCBmdW5jdGlvbihvcHRpb25zOiBhbnkpIHsgcmV0dXJuIG9wdGlvbnMgfVxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvci5QYW5lbC5kZWZpbmUoe1xyXG4gICAgbGlzdGVuZXJzOiB7XHJcbiAgICAgICAgc2hvdygpIHsgY29uc29sZS5sb2coJ3Nob3cnKTsgfSxcclxuICAgICAgICBoaWRlKCkgeyBjb25zb2xlLmxvZygnaGlkZScpOyB9LFxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvZGVmYXVsdC9pbmRleC5odG1sJyksICd1dGYtOCcpLFxyXG4gICAgc3R5bGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy9zdHlsZS9kZWZhdWx0L2luZGV4LmNzcycpLCAndXRmLTgnKSxcclxuICAgICQ6IHtcclxuICAgICAgICBhcHA6ICcjYXBwJyxcclxuICAgIH0sXHJcbiAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgfSxcclxuICAgIHJlYWR5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZUFwcCh7fSk7XHJcbiAgICAgICAgICAgIGFwcC5jb25maWcuY29tcGlsZXJPcHRpb25zLmlzQ3VzdG9tRWxlbWVudCA9ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCd1aS0nKTtcclxuICAgICAgICAgICAgYXBwLmNvbXBvbmVudCgnTXlDb3VudGVyJywge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS92dWUvY291bnRlci5odG1sJyksICd1dGYtOCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0YSgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiOiAndGFiMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhsc3hQYXRoOiBkYXRhLnhsc3hQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvcnREaXJlY3RvcjogZGF0YS5leHBvcnREaXJlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0VFNEaXJlY3RvcjogZGF0YS5leHBvcnRUU0RpcmVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RGaWxlOiBkYXRhLm1vZEZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvYnVmUmVnaXN0ZXJQYXRoOiBkYXRhLnByb3RvYnVmUmVnaXN0ZXJQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyRmlsZTogZGF0YS5wcm90b2J1ZlJlZ2lzdGVyRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9idWZQYXRoOiBkYXRhLnByb3RvYnVmUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsTW9kdWxlTmFtZTogZGF0YS5nbG9iYWxNb2R1bGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxNb2R1bGVUU05hbWU6IGRhdGEuZ2xvYmFsTW9kdWxlVFNOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lOiBkYXRhLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0czogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTG9nczogW10sICAvLyDnlKjkuo7lrZjlgqjmnoTlu7rml6Xlv5dcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2hUYWIodGFiTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gdGFiTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0WGxzeFBhdGgoZGlyZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnhsc3hQYXRoID0gZGlyZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRFeHBvcnREaXJlY3RvcihkaXJlY3Rvcjogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0RGlyZWN0b3IgPSBkaXJlY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldEV4cG9ydFRTRGlyZWN0b3IoZGlyZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydFRTRGlyZWN0b3IgPSBkaXJlY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldEdsb2JhbE1vZHVsZU5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRHbG9iYWxNb2R1bGVUU05hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlVFNOYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldEdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRNb2RGaWxlKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZEZpbGUgPSBmaWxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmUodGhpcy54bHN4UGF0aCwgdGhpcy5leHBvcnREaXJlY3RvciwgdGhpcy5leHBvcnRUU0RpcmVjdG9yLCB0aGlzLm1vZEZpbGUsIHRoaXMuZ2xvYmFsTW9kdWxlTmFtZSwgdGhpcy5nbG9iYWxNb2R1bGVUU05hbWUsIHRoaXMuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSwgdGhpcy5wcm90b2J1ZlBhdGgsIHRoaXMucHJvdG9idWZSZWdpc3RlclBhdGgsIHRoaXMucHJvdG9idWZSZWdpc3RlckZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRQcm90b2J1ZlBhdGgoZmlsZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvdG9idWZQYXRoID0gZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldFByb3RvYnVmUmVnaXN0ZXJQYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRoID0gcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldFByb3RvYnVmUmVnaXN0ZXJGaWxlKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvYnVmUmVnaXN0ZXJGaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhc3luYyBvblBhcnNlcigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0cy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb2RGaWxlKSB0aGlzLm1vZEZpbGUgPSBcImNsaWVudFwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueGxzeFBhdGggJiYgdGhpcy5leHBvcnREaXJlY3RvciAmJiB0aGlzLmV4cG9ydFRTRGlyZWN0b3IgJiYgdGhpcy5tb2RGaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gbmV3IFBhcnNlck9wdGlvbnMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54bHN4UGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydERpcmVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0VFNEaXJlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZEZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxNb2R1bGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlVFNOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHBhcnNlci5leGVjdXRlKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RzLnB1c2goZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChuYW1lOiBzdHJpbmcsIHN1Y2Nlc3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluZCA9IHRoaXMucG9zdHMuZmluZCgoZTogeyBpZDogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbiB9KSA9PiBlLmlkID09IG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmQudmFsdWUgPSBzdWNjZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHByb2dyZXNzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJyZWZyZXNoLWFzc2V0XCIsIFwiZGI6Ly9hc3NldHNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oXCLphY3nva7mlofku7bkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOaXpeW/l+eahOaWueazlVxyXG4gICAgICAgICAgICAgICAgICAgIGFkZEJ1aWxkTG9nKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkTG9ncy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDoh6rliqjmu5rliqjliLDlupXpg6hcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9nTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2ctbGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dMaXN0LnNjcm9sbFRvcCA9IGxvZ0xpc3Quc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIG9uQnVpbGRQcm90b2J1ZigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvdG9idWZSZWdpc3RlckZpbGUgJiYgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aCAmJiB0aGlzLnByb3RvYnVmUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzVmFsaWRQYXRoKHRoaXMucHJvdG9idWZSZWdpc3RlckZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKFwi5rOo5YaM5paH5Lu25LiN5piv6Lev5b6E77yM6ICM5piv5paH5Lu25ZCNXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByUGF0aCA9IHRoaXMucHJvdG9idWZSZWdpc3RlclBhdGgucmVwbGFjZShcInByb2plY3Q6L1wiLCBFZGl0b3IuUHJvamVjdC5wYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZyhgJHtyUGF0aH0g5LiN5a2Y5Zyo77yM5Yib5bu655uu5b2VLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlEaXJTeW5jKHJQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc1N1YkRpcmVjdG9yaWVzKHJQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfovpPlh7rnm67lvZXmnInlrZDnm67lvZUsIOS7heS7hea4heepuuagueebruW9leiAjOS4jeWIoOmZpOWtkOebruW9lS4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZWFkZGlyU3luYyhyUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBqb2luKHJQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoZnVsbFBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSByUGF0aC5yZXBsYWNlKEVkaXRvci5Qcm9qZWN0LnBhdGgsIFwiZGI6L1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcImFzc2V0LWRiXCIsIFwicXVlcnktdXVpZFwiLCBwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJkZWxldGUtYXNzZXRcIiwgdXVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn6L6T5Ye655uu5b2V5rKh5pyJ5a2Q55uu5b2V77yM6YCa6L+H5Yig6Zmk5paH5Lu25aS55YaN5Yib5bu65paH5Lu25aS555qE5pa55byP5riF56m655uu5b2VLi4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwID0gclBhdGgucmVwbGFjZShFZGl0b3IuUHJvamVjdC5wYXRoLCBcImRiOi9cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcImFzc2V0LWRiXCIsIFwicXVlcnktdXVpZFwiLCBwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcImRlbGV0ZS1hc3NldFwiLCB1dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS4iumdouS8muWIoOaOiXJQYXRo55uu5b2VXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZyhgJHtyUGF0aH0g5LiN5a2Y5Zyo77yM5Yib5bu655uu5b2VLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlEaXJTeW5jKHJQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkTG9ncyA9IFtdOyAgLy8g5riF56m65LmL5YmN55qE5pel5b+XXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCflvIDlp4vnvJbor5HljY/orq4uLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfliJvlu7rkuIDkuKrkuLTml7bnm67lvZXnlKjmnaXnvJbor5HljY/orq7nmoTovpPlh7rot6/lvoQuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm90b2J1Zk91dFRlbXAgPSBqb2luKHBhdGgsIFwiLnByb3RvYnVmT3V0VGVtcFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhwcm90b2J1Zk91dFRlbXApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWtkaXJTeW5jKHByb3RvYnVmT3V0VGVtcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn57yW6K+R5Y2P6K6u5Yiw5Li05pe255uu5b2VLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzT2sgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiZ2FtZS1jb25maWd1cmVcIiwgJ2NvbXBpZXItcHJvdG9idWYnLCBgbnB4IHByb3RvYyAtLXRzX291dCAke3Byb3RvYnVmT3V0VGVtcH0gLS1wcm90b19wYXRoICR7dGhpcy5wcm90b2J1ZlBhdGh9ICR7dGhpcy5wcm90b2J1ZlBhdGh9LyoucHJvdG8gLS1leHBlcmltZW50YWxfYWxsb3dfcHJvdG8zX29wdGlvbmFsYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzT2sgPT0gXCJzdWNjZXNzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn57yW6K+R5Y2P6K6u5a6M5oiQLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coYOe8luivkeWNj+iuruWHuumUmSwke2Vycm9yLnRvU3RyaW5nKCl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHByb3RvYnVmT3V0VGVtcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gcmVhZEZpbGVTeW5jKGAke3Byb3RvYnVmT3V0VGVtcH0vJHtmaWxlfWAsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cChcIkBwcm90b2J1Zi10cy9ydW50aW1lXCIsIFwiZ21cIiksIFwiZGI6Ly9nYW1lLXByb3RvYnVmL2dhbWUtZnJhbWV3b3JrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKGDkv67mlLkke2ZpbGV95Y2P6K6u5a+85YWl5L+h5oGv5bm25ou36LSd5YiwJHt0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRofS4uLmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGAke3JQYXRofS8ke2ZpbGV9YCwgdGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rpobnnm65cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBQcm9qZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOa6kOaWh+S7tlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5hZGRTb3VyY2VGaWxlQXRQYXRoKGAke3JQYXRofS8ke2ZpbGV9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWcqOa3u+WKoCzlho3mt7vliqDlrrnlmahcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiQ29udGFpbmVyXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29yZS9nYW1lLWZyYW1ld29ya1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoGNj5a+85YWlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuYWRkSW1wb3J0RGVjbGFyYXRpb25zKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1R5cGVPbmx5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lZEltcG9ydHM6IFtcImRpcmVjdG9yXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJjY1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHcgPSBwcm9qZWN0LmNyZWF0ZVdyaXRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy53cml0ZShgZGlyZWN0b3Iub24oXCJnYW1lLWZyYW1ld29yay1pbml0aWFsaXplXCIsICgpID0+IHtgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPluaJgOacieWvvOWHuueahOWjsOaYjlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBvcnRlZERlY2xhcmF0aW9ucyA9IHNvdXJjZUZpbGUuZ2V0RXhwb3J0ZWREZWNsYXJhdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6YGN5Y6G5omA5pyJ5a+85Ye6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydGVkRGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2xhcmF0aW9ucywgbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6Xlo7DmmI7nsbvlnotcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24uZ2V0S2luZCgpID09PSBTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFyRGVjbCA9IGRlY2xhcmF0aW9uLmFzS2luZChTeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbml0aWFsaXplciA9IHZhckRlY2w/LmdldEluaXRpYWxpemVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbGl6ZXI/LmdldEtpbmQoKSA9PT0gU3ludGF4S2luZC5OZXdFeHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGBDb250YWluZXIuZ2V0SW50ZXJmYWNlKFwiSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6YWJsZVwiKT8ucmVnaXN0ZXJJbnN0KCR7bmFtZX0pO2ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy5uZXdMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bnsbvlo7DmmI5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gPSBzb3VyY2VGaWxlLmdldENsYXNzKG5hbWUgKyBcIiRUeXBlXCIpITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuoeeulyBDUkMzMiDlgLxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyY1ZhbHVlID0gY3JjMzIuc3RyKG5hbWUpOyAvLyDkvb/nlKjnsbvlkI3orqHnrpcgQ1JDMzJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaWueazlTHvvJrnm7TmjqXmt7vliqAgaW1wbGVtZW50cyDlrZDlj6VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzRGVjbGFyYXRpb24uYWRkSW1wbGVtZW50cyhgSUdhbWVGcmFtZXdvcmsuSVNlcmlhbGl6ZXJgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdldHRlclN0cnVjdHVyZTogR2V0QWNjZXNzb3JEZWNsYXJhdGlvblN0cnVjdHVyZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInByb3RvSWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBTdHJ1Y3R1cmVLaW5kLkdldEFjY2Vzc29yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50czogYHJldHVybiAke2NyY1ZhbHVlfTtgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhdGljOiBmYWxzZSwgICAgICAgIC8vIOaYr+WQpuaYr+mdmeaAgeaWueazlVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlOiBTY29wZS5QdWJsaWMgICAgICAgICAvLyDorr/pl67ojIPlm7RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0RlY2xhcmF0aW9uLmFkZEdldEFjY2Vzc29yKGdldHRlclN0cnVjdHVyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5nZXRDbGFzc2VzKCkuZm9yRWFjaChlID0+IHsgZS5nZXROYW1lKCkgfSlcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3LndyaXRlKGB9KTtgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5pbnNlcnRUZXh0KHNvdXJjZUZpbGUuZ2V0RW5kKCksIHcudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuZm9ybWF0VGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhgJHtyUGF0aH0vJHtmaWxlfWAsIHNvdXJjZUZpbGUuZ2V0RnVsbFRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn5p6E5bu65Y2P6K6u5rOo5YWl5L+h5oGv5paH5Lu2Li4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gYCR7dGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aH0vJHt0aGlzLnByb3RvYnVmUmVnaXN0ZXJGaWxlfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn5Yig6Zmk5Li05pe255uu5b2VLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBybWRpclN5bmMocHJvdG9idWZPdXRUZW1wLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfmnoTlu7rlrozmr5XvvIzliLfmlrDotYTmupDmlbDmja7lupMuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInJlZnJlc2gtYXNzZXRcIiwgXCJkYjovL2Fzc2V0c1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5EaWFsb2cuaW5mbyhcIumFjee9ruS4jeiDveS4uuepulwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFwcC5tb3VudCh0aGlzLiQuYXBwKTtcclxuICAgICAgICAgICAgcGFuZWxEYXRhTWFwLnNldCh0aGlzLCBhcHApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBiZWZvcmVDbG9zZSgpIHsgfSxcclxuICAgIGNsb3NlKCkge1xyXG4gICAgICAgIGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XHJcbiAgICAgICAgaWYgKGFwcCkge1xyXG4gICAgICAgICAgICBhcHAudW5tb3VudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pO1xyXG4iXX0=