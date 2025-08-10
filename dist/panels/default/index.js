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
                        console.log("配置表目录：", this.xlsxPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUFnQztBQUNoQywyQkFBa0Y7QUFDbEYsdUNBQTRGO0FBQzVGLCtCQUFtRDtBQUNuRCx1Q0FBc0c7QUFDdEcsNkJBQXFDO0FBQ3JDLHlFQUFnRDtBQUNoRCxrREFBOEQ7QUFFOUQsU0FBUyxXQUFXLENBQUMsSUFBWTtJQUM3QixJQUFJLENBQUM7UUFDRCxRQUFRO1FBQ1IsTUFBTSxjQUFjLEdBQUcsSUFBQSxnQkFBUyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZDLFdBQVc7UUFDWCxNQUFNLFNBQVMsR0FBRyxpQ0FBaUMsQ0FBQztRQUVwRCxZQUFZO1FBQ1osTUFBTSxjQUFjLEdBQUcsSUFBQSxpQkFBVSxFQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWxELFdBQVc7UUFDWCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksY0FBYyxDQUFDO0lBQzVELENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLE9BQWU7SUFDdEMsSUFBSSxDQUFDO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixNQUFNLFFBQVEsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckMsT0FBTyxJQUFBLGFBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFBQyxP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QyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQzdFLENBQUM7NkJBQU0sQ0FBQzs0QkFDSixNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN2QyxDQUFDO29CQUNMLENBQUM7aUJBQ0o7YUFDSixDQUFDLENBQUM7WUFDSCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7SUFDRCxXQUFXLEtBQUssQ0FBQztJQUNqQixLQUFLO1FBQ0QsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xCLENBQUM7SUFDTCxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY3JjMzIgZnJvbSAnY3JjLTMyJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZGRpclN5bmMsIHN0YXRTeW5jLCB1bmxpbmtTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBlbXB0eURpclN5bmMsIG1rZGlyU3luYywgcGF0aEV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcm1kaXJTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBpc0Fic29sdXRlLCBqb2luLCBub3JtYWxpemUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgR2V0QWNjZXNzb3JEZWNsYXJhdGlvblN0cnVjdHVyZSwgUHJvamVjdCwgU2NvcGUsIFN0cnVjdHVyZUtpbmQsIFN5bnRheEtpbmQgfSBmcm9tIFwidHMtbW9ycGhcIjtcclxuaW1wb3J0IHsgQXBwLCBjcmVhdGVBcHAgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vLi4vLi4vcGFja2FnZS5qc29uJztcclxuaW1wb3J0IHsgUGFyc2VyLCBQYXJzZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tcGlsZXIvcGFyc2VyJztcclxuXHJcbmZ1bmN0aW9uIGlzVmFsaWRQYXRoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyDop4TojIPljJbot6/lvoRcclxuICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcclxuXHJcbiAgICAgICAgLy8g5Z+65pys6Lev5b6E5qC85byP5qOA5p+lXHJcbiAgICAgICAgY29uc3QgcGF0aFJlZ2V4ID0gL14oPzpbYS16QS1aXTpcXFxcfFxcLylbXjw+OlwifD8qXSskLztcclxuXHJcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5Li657ud5a+56Lev5b6EXHJcbiAgICAgICAgY29uc3QgaXNBYnNvbHV0ZVBhdGggPSBpc0Fic29sdXRlKG5vcm1hbGl6ZWRQYXRoKTtcclxuXHJcbiAgICAgICAgLy8g6L+U5Zue57u85ZCI5qOA5p+l57uT5p6cXHJcbiAgICAgICAgcmV0dXJuIHBhdGhSZWdleC50ZXN0KG5vcm1hbGl6ZWRQYXRoKSAmJiBpc0Fic29sdXRlUGF0aDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc1N1YkRpcmVjdG9yaWVzKGRpclBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBpdGVtcyA9IHJlYWRkaXJTeW5jKGRpclBhdGgpO1xyXG4gICAgICAgIHJldHVybiBpdGVtcy5zb21lKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oZGlyUGF0aCwgaXRlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0U3luYyhmdWxsUGF0aCkuaXNEaXJlY3RvcnkoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign5qOA5p+l55uu5b2V5aSx6LSlOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBwYXRoID0gRWRpdG9yLlBhY2thZ2UuZ2V0UGF0aChwYWNrYWdlSlNPTi5uYW1lKSE7XHJcbmxldCBmaWxlID0gam9pbihwYXRoLCBcImNvbmZpZy5qc29uXCIpO1xyXG5pZiAoIWV4aXN0c1N5bmMoZmlsZSkpIHtcclxuICAgIHdyaXRlRmlsZVN5bmMoZmlsZSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHhsc3hQYXRoOiBcIlwiLFxyXG4gICAgICAgIHByb3RvYnVmUGF0aDogXCJcIixcclxuICAgICAgICBleHBvcnREaXJlY3RvcjogXCJcIixcclxuICAgICAgICBleHBvcnRUU0RpcmVjdG9yOiBcIlwiLFxyXG4gICAgICAgIG1vZEZpbGU6IFwiXCIsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IFwiXCIsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IFwiXCIsXHJcbiAgICAgICAgZ2xvYmFsTW9kdWxlTmFtZTogXCJJR2FtZUZyYW1ld29ya1wiLCAvLyDpu5jorqTnmoTmqKHlnZflkI1cclxuICAgICAgICBnbG9iYWxNb2R1bGVUU05hbWU6IFwia3NnYW1lczI2XCIsIC8vIOm7mOiupOeahOaWh+S7tuWQjeensFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IFwiSVRhYmxlQ29uZlwiIC8vIOm7mOiupOeahOaOpeWPo+WQjVxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5jb25zdCBzYXZlID0gZnVuY3Rpb24gKFxyXG4gICAgeGxzeFBhdGg6IHN0cmluZyxcclxuICAgIGV4cG9ydERpcmVjdG9yOiBzdHJpbmcsXHJcbiAgICBleHBvcnRUU0RpcmVjdG9yOiBzdHJpbmcsXHJcbiAgICBtb2RGaWxlOiBzdHJpbmcsXHJcbiAgICBnbG9iYWxNb2R1bGVOYW1lOiBzdHJpbmcsXHJcbiAgICBnbG9iYWxNb2R1bGVUU05hbWU6IHN0cmluZyxcclxuICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IHN0cmluZyxcclxuICAgIHByb3RvYnVmUGF0aDogc3RyaW5nLFxyXG4gICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IHN0cmluZyxcclxuICAgIHByb3RvYnVmUmVnaXN0ZXJGaWxlOiBzdHJpbmdcclxuKSB7XHJcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGUsIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICB4bHN4UGF0aDogeGxzeFBhdGgsXHJcbiAgICAgICAgZXhwb3J0RGlyZWN0b3I6IGV4cG9ydERpcmVjdG9yLFxyXG4gICAgICAgIGV4cG9ydFRTRGlyZWN0b3I6IGV4cG9ydFRTRGlyZWN0b3IsXHJcbiAgICAgICAgbW9kRmlsZTogbW9kRmlsZSxcclxuICAgICAgICBnbG9iYWxNb2R1bGVOYW1lOiBnbG9iYWxNb2R1bGVOYW1lLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZVRTTmFtZTogZ2xvYmFsTW9kdWxlVFNOYW1lLFxyXG4gICAgICAgIGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWU6IGdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUsXHJcbiAgICAgICAgcHJvdG9idWZQYXRoOiBwcm90b2J1ZlBhdGgsXHJcbiAgICAgICAgcHJvdG9idWZSZWdpc3RlclBhdGg6IHByb3RvYnVmUmVnaXN0ZXJQYXRoLFxyXG4gICAgICAgIHByb3RvYnVmUmVnaXN0ZXJGaWxlOiBwcm90b2J1ZlJlZ2lzdGVyRmlsZVxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcclxuLyoqXHJcbiAqIEB6aCDlpoLmnpzluIzmnJvlhbzlrrkgMy4zIOS5i+WJjeeahOeJiOacrOWPr+S7peS9v+eUqOS4i+aWueeahOS7o+eggVxyXG4gKiBAZW4gWW91IGNhbiBhZGQgdGhlIGNvZGUgYmVsb3cgaWYgeW91IHdhbnQgY29tcGF0aWJpbGl0eSB3aXRoIHZlcnNpb25zIHByaW9yIHRvIDMuM1xyXG4gKi9cclxuLy8gRWRpdG9yLlBhbmVsLmRlZmluZSA9IEVkaXRvci5QYW5lbC5kZWZpbmUgfHwgZnVuY3Rpb24ob3B0aW9uczogYW55KSB7IHJldHVybiBvcHRpb25zIH1cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3IuUGFuZWwuZGVmaW5lKHtcclxuICAgIGxpc3RlbmVyczoge1xyXG4gICAgICAgIHNob3coKSB7IGNvbnNvbGUubG9nKCdzaG93Jyk7IH0sXHJcbiAgICAgICAgaGlkZSgpIHsgY29uc29sZS5sb2coJ2hpZGUnKTsgfSxcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcclxuICAgIHN0eWxlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvZGVmYXVsdC9pbmRleC5jc3MnKSwgJ3V0Zi04JyksXHJcbiAgICAkOiB7XHJcbiAgICAgICAgYXBwOiAnI2FwcCcsXHJcbiAgICB9LFxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgIH0sXHJcbiAgICByZWFkeSgpIHtcclxuICAgICAgICBpZiAodGhpcy4kLmFwcCkge1xyXG4gICAgICAgICAgICBjb25zdCBhcHAgPSBjcmVhdGVBcHAoe30pO1xyXG4gICAgICAgICAgICBhcHAuY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5pc0N1c3RvbUVsZW1lbnQgPSAodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgndWktJyk7XHJcbiAgICAgICAgICAgIGFwcC5jb21wb25lbnQoJ015Q291bnRlcicsIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvdnVlL2NvdW50ZXIuaHRtbCcpLCAndXRmLTgnKSxcclxuICAgICAgICAgICAgICAgIGRhdGEoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhmaWxlLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYjogJ3RhYjEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4bHN4UGF0aDogZGF0YS54bHN4UGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0RGlyZWN0b3I6IGRhdGEuZXhwb3J0RGlyZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydFRTRGlyZWN0b3I6IGRhdGEuZXhwb3J0VFNEaXJlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kRmlsZTogZGF0YS5tb2RGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm90b2J1ZlJlZ2lzdGVyUGF0aDogZGF0YS5wcm90b2J1ZlJlZ2lzdGVyUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9idWZSZWdpc3RlckZpbGU6IGRhdGEucHJvdG9idWZSZWdpc3RlckZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvYnVmUGF0aDogZGF0YS5wcm90b2J1ZlBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbE1vZHVsZU5hbWU6IGRhdGEuZ2xvYmFsTW9kdWxlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsTW9kdWxlVFNOYW1lOiBkYXRhLmdsb2JhbE1vZHVsZVRTTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZTogZGF0YS5nbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdHM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZExvZ3M6IFtdLCAgLy8g55So5LqO5a2Y5YKo5p6E5bu65pel5b+XXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoVGFiKHRhYk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYk5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvblNldFhsc3hQYXRoKGRpcmVjdG9yOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54bHN4UGF0aCA9IGRpcmVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0RXhwb3J0RGlyZWN0b3IoZGlyZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydERpcmVjdG9yID0gZGlyZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRFeHBvcnRUU0RpcmVjdG9yKGRpcmVjdG9yOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBvcnRUU0RpcmVjdG9yID0gZGlyZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRHbG9iYWxNb2R1bGVOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0R2xvYmFsTW9kdWxlVFNOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZVRTTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRHbG9iYWxNb2R1bGVJbnRlcmZhY2VOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0TW9kRmlsZShmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RGaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzYXZlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlKHRoaXMueGxzeFBhdGgsIHRoaXMuZXhwb3J0RGlyZWN0b3IsIHRoaXMuZXhwb3J0VFNEaXJlY3RvciwgdGhpcy5tb2RGaWxlLCB0aGlzLmdsb2JhbE1vZHVsZU5hbWUsIHRoaXMuZ2xvYmFsTW9kdWxlVFNOYW1lLCB0aGlzLmdsb2JhbE1vZHVsZUludGVyZmFjZU5hbWUsIHRoaXMucHJvdG9idWZQYXRoLCB0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRoLCB0aGlzLnByb3RvYnVmUmVnaXN0ZXJGaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU2V0UHJvdG9idWZQYXRoKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvYnVmUGF0aCA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRQcm90b2J1ZlJlZ2lzdGVyUGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aCA9IHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25TZXRQcm90b2J1ZlJlZ2lzdGVyRmlsZShmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgb25QYXJzZXIoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW9kRmlsZSkgdGhpcy5tb2RGaWxlID0gXCJjbGllbnRcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6YWN572u6KGo55uu5b2V77yaXCIsIHRoaXMueGxzeFBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueGxzeFBhdGggJiYgdGhpcy5leHBvcnREaXJlY3RvciAmJiB0aGlzLmV4cG9ydFRTRGlyZWN0b3IgJiYgdGhpcy5tb2RGaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gbmV3IFBhcnNlck9wdGlvbnMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54bHN4UGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydERpcmVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0VFNEaXJlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZEZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxNb2R1bGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlVFNOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsTW9kdWxlSW50ZXJmYWNlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHBhcnNlci5leGVjdXRlKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RzLnB1c2goZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChuYW1lOiBzdHJpbmcsIHN1Y2Nlc3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluZCA9IHRoaXMucG9zdHMuZmluZCgoZTogeyBpZDogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbiB9KSA9PiBlLmlkID09IG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmQudmFsdWUgPSBzdWNjZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHByb2dyZXNzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJyZWZyZXNoLWFzc2V0XCIsIFwiZGI6Ly9hc3NldHNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oXCLphY3nva7mlofku7bkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOaXpeW/l+eahOaWueazlVxyXG4gICAgICAgICAgICAgICAgICAgIGFkZEJ1aWxkTG9nKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkTG9ncy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDoh6rliqjmu5rliqjliLDlupXpg6hcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9nTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2ctbGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dMaXN0LnNjcm9sbFRvcCA9IGxvZ0xpc3Quc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIG9uQnVpbGRQcm90b2J1ZigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvdG9idWZSZWdpc3RlckZpbGUgJiYgdGhpcy5wcm90b2J1ZlJlZ2lzdGVyUGF0aCAmJiB0aGlzLnByb3RvYnVmUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzVmFsaWRQYXRoKHRoaXMucHJvdG9idWZSZWdpc3RlckZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKFwi5rOo5YaM5paH5Lu25LiN5piv6Lev5b6E77yM6ICM5piv5paH5Lu25ZCNXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByUGF0aCA9IHRoaXMucHJvdG9idWZSZWdpc3RlclBhdGgucmVwbGFjZShcInByb2plY3Q6L1wiLCBFZGl0b3IuUHJvamVjdC5wYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZyhgJHtyUGF0aH0g5LiN5a2Y5Zyo77yM5Yib5bu655uu5b2VLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlEaXJTeW5jKHJQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc1N1YkRpcmVjdG9yaWVzKHJQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfovpPlh7rnm67lvZXmnInlrZDnm67lvZUsIOS7heS7hea4heepuuagueebruW9leiAjOS4jeWIoOmZpOWtkOebruW9lS4uLicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZWFkZGlyU3luYyhyUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBqb2luKHJQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoZnVsbFBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSByUGF0aC5yZXBsYWNlKEVkaXRvci5Qcm9qZWN0LnBhdGgsIFwiZGI6L1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcImFzc2V0LWRiXCIsIFwicXVlcnktdXVpZFwiLCBwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJkZWxldGUtYXNzZXRcIiwgdXVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn6L6T5Ye655uu5b2V5rKh5pyJ5a2Q55uu5b2V77yM6YCa6L+H5Yig6Zmk5paH5Lu25aS55YaN5Yib5bu65paH5Lu25aS555qE5pa55byP5riF56m655uu5b2VLi4uJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwID0gclBhdGgucmVwbGFjZShFZGl0b3IuUHJvamVjdC5wYXRoLCBcImRiOi9cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcImFzc2V0LWRiXCIsIFwicXVlcnktdXVpZFwiLCBwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcImRlbGV0ZS1hc3NldFwiLCB1dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS4iumdouS8muWIoOaOiXJQYXRo55uu5b2VXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZyhgJHtyUGF0aH0g5LiN5a2Y5Zyo77yM5Yib5bu655uu5b2VLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlEaXJTeW5jKHJQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkTG9ncyA9IFtdOyAgLy8g5riF56m65LmL5YmN55qE5pel5b+XXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCflvIDlp4vnvJbor5HljY/orq4uLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKCfliJvlu7rkuIDkuKrkuLTml7bnm67lvZXnlKjmnaXnvJbor5HljY/orq7nmoTovpPlh7rot6/lvoQuLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm90b2J1Zk91dFRlbXAgPSBqb2luKHBhdGgsIFwiLnByb3RvYnVmT3V0VGVtcFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhwcm90b2J1Zk91dFRlbXApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWtkaXJTeW5jKHByb3RvYnVmT3V0VGVtcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn57yW6K+R5Y2P6K6u5Yiw5Li05pe255uu5b2VLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzT2sgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiZ2FtZS1jb25maWd1cmVcIiwgJ2NvbXBpZXItcHJvdG9idWYnLCBgbnB4IHByb3RvYyAtLXRzX291dCAke3Byb3RvYnVmT3V0VGVtcH0gLS1wcm90b19wYXRoICR7dGhpcy5wcm90b2J1ZlBhdGh9ICR7dGhpcy5wcm90b2J1ZlBhdGh9LyoucHJvdG8gLS1leHBlcmltZW50YWxfYWxsb3dfcHJvdG8zX29wdGlvbmFsYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzT2sgPT0gXCJzdWNjZXNzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn57yW6K+R5Y2P6K6u5a6M5oiQLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coYOe8luivkeWNj+iuruWHuumUmSwke2Vycm9yLnRvU3RyaW5nKCl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHByb3RvYnVmT3V0VGVtcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gcmVhZEZpbGVTeW5jKGAke3Byb3RvYnVmT3V0VGVtcH0vJHtmaWxlfWAsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cChcIkBwcm90b2J1Zi10cy9ydW50aW1lXCIsIFwiZ21cIiksIFwiZGI6Ly9nYW1lLXByb3RvYnVmL2dhbWUtZnJhbWV3b3JrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1aWxkTG9nKGDkv67mlLkke2ZpbGV95Y2P6K6u5a+85YWl5L+h5oGv5bm25ou36LSd5YiwJHt0aGlzLnByb3RvYnVmUmVnaXN0ZXJQYXRofS4uLmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGAke3JQYXRofS8ke2ZpbGV9YCwgdGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rpobnnm65cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBQcm9qZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOa6kOaWh+S7tlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5hZGRTb3VyY2VGaWxlQXRQYXRoKGAke3JQYXRofS8ke2ZpbGV9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWcqOa3u+WKoCzlho3mt7vliqDlrrnlmahcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZS5hZGRJbXBvcnREZWNsYXJhdGlvbnMoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVHlwZU9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVkSW1wb3J0czogW1wiQ29udGFpbmVyXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJkYjovL2dhbWUtY29yZS9nYW1lLWZyYW1ld29ya1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoGNj5a+85YWlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuYWRkSW1wb3J0RGVjbGFyYXRpb25zKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1R5cGVPbmx5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lZEltcG9ydHM6IFtcImRpcmVjdG9yXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVNwZWNpZmllcjogXCJjY1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3ID0gcHJvamVjdC5jcmVhdGVXcml0ZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHcud3JpdGUoYGRpcmVjdG9yLm9uKFwiZ2FtZS1mcmFtZXdvcmstaW5pdGlhbGl6ZVwiLCAoKSA9PiB7YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bmiYDmnInlr7zlh7rnmoTlo7DmmI5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb3J0ZWREZWNsYXJhdGlvbnMgPSBzb3VyY2VGaWxlLmdldEV4cG9ydGVkRGVjbGFyYXRpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOmBjeWOhuaJgOacieWvvOWHulxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRlZERlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbnMsIG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9ucy5mb3JFYWNoKGRlY2xhcmF0aW9uID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+l5aOw5piO57G75Z6LXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmdldEtpbmQoKSA9PT0gU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhckRlY2wgPSBkZWNsYXJhdGlvbi5hc0tpbmQoU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5pdGlhbGl6ZXIgPSB2YXJEZWNsPy5nZXRJbml0aWFsaXplcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWxpemVyPy5nZXRLaW5kKCkgPT09IFN5bnRheEtpbmQuTmV3RXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy53cml0ZShgQ29udGFpbmVyLmdldEludGVyZmFjZShcIklHYW1lRnJhbWV3b3JrLklTZXJpYWxpemFibGVcIik/LnJlZ2lzdGVySW5zdCgke25hbWV9KTtgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHcubmV3TGluZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W57G75aOw5piOXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gc291cmNlRmlsZS5nZXRDbGFzcyhuYW1lICsgXCIkVHlwZVwiKSE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDorqHnrpcgQ1JDMzIg5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmNWYWx1ZSA9IGNyYzMyLnN0cihuYW1lKTsgLy8g5L2/55So57G75ZCN6K6h566XIENSQzMyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0RlY2xhcmF0aW9uLmFkZEltcGxlbWVudHMoYElHYW1lRnJhbWV3b3JrLklTZXJpYWxpemVyYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZXR0ZXJTdHJ1Y3R1cmU6IEdldEFjY2Vzc29yRGVjbGFyYXRpb25TdHJ1Y3R1cmUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJwcm90b0lkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogU3RydWN0dXJlS2luZC5HZXRBY2Nlc3NvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudHM6IGByZXR1cm4gJHtjcmNWYWx1ZX07YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N0YXRpYzogZmFsc2UsICAgICAgICAvLyDmmK/lkKbmmK/pnZnmgIHmlrnms5VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZTogU2NvcGUuUHVibGljICAgICAgICAgLy8g6K6/6Zeu6IyD5Zu0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NEZWNsYXJhdGlvbi5hZGRHZXRBY2Nlc3NvcihnZXR0ZXJTdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuZ2V0Q2xhc3NlcygpLmZvckVhY2goZSA9PiB7IGUuZ2V0TmFtZSgpIH0pXHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdy53cml0ZShgfSk7YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUuaW5zZXJ0VGV4dChzb3VyY2VGaWxlLmdldEVuZCgpLCB3LnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlLmZvcm1hdFRleHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoYCR7clBhdGh9LyR7ZmlsZX1gLCBzb3VyY2VGaWxlLmdldEZ1bGxUZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coJ+aehOW7uuWNj+iuruazqOWFpeS/oeaBr+aWh+S7ti4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGAke3RoaXMucHJvdG9idWZSZWdpc3RlclBhdGh9LyR7dGhpcy5wcm90b2J1ZlJlZ2lzdGVyRmlsZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVpbGRMb2coJ+WIoOmZpOS4tOaXtuebruW9lS4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm1kaXJTeW5jKHByb3RvYnVmT3V0VGVtcCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRCdWlsZExvZygn5p6E5bu65a6M5q+V77yM5Yi35paw6LWE5rqQ5pWw5o2u5bqTLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJyZWZyZXNoLWFzc2V0XCIsIFwiZGI6Ly9hc3NldHNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oXCLphY3nva7kuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcHAubW91bnQodGhpcy4kLmFwcCk7XHJcbiAgICAgICAgICAgIHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYmVmb3JlQ2xvc2UoKSB7IH0sXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICBjb25zdCBhcHAgPSBwYW5lbERhdGFNYXAuZ2V0KHRoaXMpO1xyXG4gICAgICAgIGlmIChhcHApIHtcclxuICAgICAgICAgICAgYXBwLnVubW91bnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuIl19