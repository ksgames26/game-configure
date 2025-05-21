import * as crc32 from 'crc-32';
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { emptyDirSync, mkdirSync, pathExistsSync, readFileSync, rmdirSync } from 'fs-extra';
import { isAbsolute, join, normalize } from 'path';
import { GetAccessorDeclarationStructure, Project, Scope, StructureKind, SyntaxKind } from "ts-morph";
import { App, createApp } from 'vue';
import packageJSON from '../../../package.json';
import { Parser, ParserOptions } from '../../compiler/parser';

function isValidPath(path: string): boolean {
    try {
        // 规范化路径
        const normalizedPath = normalize(path);

        // 基本路径格式检查
        const pathRegex = /^(?:[a-zA-Z]:\\|\/)[^<>:"|?*]+$/;

        // 检查是否为绝对路径
        const isAbsolutePath = isAbsolute(normalizedPath);

        // 返回综合检查结果
        return pathRegex.test(normalizedPath) && isAbsolutePath;
    } catch (e) {
        return false;
    }
}

function hasSubDirectories(dirPath: string): boolean {
    try {
        const items = readdirSync(dirPath);
        return items.some(item => {
            const fullPath = join(dirPath, item);
            return statSync(fullPath).isDirectory();
        });
    } catch (error) {
        console.error('检查目录失败:', error);
        return false;
    }
}

let path = Editor.Package.getPath(packageJSON.name)!;
let file = join(path, "config.json");
if (!existsSync(file)) {
    writeFileSync(file, JSON.stringify({
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

const save = function (
    xlsxPath: string,
    exportDirector: string,
    exportTSDirector: string,
    modFile: string,
    globalModuleName: string,
    globalModuleTSName: string,
    globalModuleInterfaceName: string,
    protobufPath: string,
    protobufRegisterPath: string,
    protobufRegisterFile: string
) {
    writeFileSync(file, JSON.stringify({
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
}

const panelDataMap = new WeakMap<any, App>();
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
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {

    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: readFileSync(join(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    var data = JSON.parse(readFileSync(file, { encoding: "utf-8" }));
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
                        buildLogs: [],  // 用于存储构建日志
                    };
                },
                methods: {
                    switchTab(tabName: string) {
                        this.activeTab = tabName;
                    },
                    onSetXlsxPath(director: string) {
                        this.xlsxPath = director;
                        this.save();
                    },
                    onSetExportDirector(director: string) {
                        this.exportDirector = director;
                        this.save();
                    },
                    onSetExportTSDirector(director: string) {
                        this.exportTSDirector = director;
                        this.save();
                    },
                    onSetGlobalModuleName(name: string) {
                        this.globalModuleName = name;
                        this.save();
                    },
                    onSetGlobalModuleTSName(name: string) {
                        this.globalModuleTSName = name;
                        this.save();
                    },
                    onSetGlobalModuleInterfaceName(name: string) {
                        this.globalModuleInterfaceName = name;
                        this.save();
                    },
                    onSetModFile(file: string) {
                        this.modFile = file;
                        this.save();
                    },
                    save() {
                        save(this.xlsxPath, this.exportDirector, this.exportTSDirector, this.modFile, this.globalModuleName, this.globalModuleTSName, this.globalModuleInterfaceName, this.protobufPath, this.protobufRegisterPath, this.protobufRegisterFile);
                    },
                    onSetProtobufPath(file: string) {
                        this.protobufPath = file;
                        this.save();
                    },
                    onSetProtobufRegisterPath(path: string) {
                        this.protobufRegisterPath = path;
                        this.save();
                    },
                    onSetProtobufRegisterFile(file: string) {
                        this.protobufRegisterFile = file;
                        this.save();
                    },
                    async onParser() {
                        this.posts.length = 0;
                        this.count = 0;

                        if (!this.modFile) this.modFile = "client";

                        console.log("配置表目录：", this.xlsxPath);

                        if (this.xlsxPath && this.exportDirector && this.exportTSDirector && this.modFile) {
                            const options = new ParserOptions(
                                this.xlsxPath,
                                this.exportDirector,
                                this.exportTSDirector,
                                this.modFile,
                                this.globalModuleName,
                                this.globalModuleTSName,
                                this.globalModuleInterfaceName,
                            );
                            const parser = new Parser(options);

                            await parser.execute((data) => {
                                data.forEach(e => {
                                    this.posts.push(e);
                                })
                            }, (name: string, success) => {
                                let find = this.posts.find((e: { id: string, value: boolean }) => e.id == name);
                                if (find) {
                                    find.value = success;
                                }
                            }, progress => {
                                this.count = progress;
                            });

                            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
                        } else {
                            await Editor.Dialog.info("配置文件不能为空");
                        }
                    },
                    // 添加日志的方法
                    addBuildLog(message: string) {
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

                            if (!existsSync(rPath)) {
                                this.addBuildLog(`${rPath} 不存在，创建目录...`);
                                emptyDirSync(rPath);
                            } else {
                                if (hasSubDirectories(rPath)) {
                                    this.addBuildLog('输出目录有子目录, 仅仅清空根目录而不删除子目录...');

                                    const items = readdirSync(rPath);
                                    for (const item of items) {
                                        const fullPath = join(rPath, item);
                                        const stats = statSync(fullPath);

                                        if (stats.isFile()) {
                                            const p = rPath.replace(Editor.Project.path, "db:/");
                                            const uuid = await Editor.Message.request("asset-db", "query-uuid", p);
                                            if (uuid) {
                                                await Editor.Message.request("asset-db", "delete-asset", uuid);
                                            }
                                        }
                                    }
                                } else {
                                    this.addBuildLog('输出目录没有子目录，通过删除文件夹再创建文件夹的方式清空目录...');

                                    const p = rPath.replace(Editor.Project.path, "db:/");

                                    const uuid = await Editor.Message.request("asset-db", "query-uuid", p);
                                    if (uuid) {
                                        await Editor.Message.request("asset-db", "delete-asset", uuid);
                                    }

                                    await new Promise(resolve => { setTimeout(resolve, 2000) });
                                }
                            }

                            // 上面会删掉rPath目录
                            if (!existsSync(rPath)) {
                                this.addBuildLog(`${rPath} 不存在，创建目录...`);
                                emptyDirSync(rPath);
                            }

                            this.buildLogs = [];  // 清空之前的日志
                            this.addBuildLog('开始编译协议...');

                            this.addBuildLog('创建一个临时目录用来编译协议的输出路径...');
                            let protobufOutTemp = join(path, ".protobufOutTemp");
                            if (!existsSync(protobufOutTemp)) {
                                mkdirSync(protobufOutTemp);
                            }

                            this.addBuildLog('编译协议到临时目录...');
                            try {
                                const isOk = await Editor.Message.request("game-configure", 'compier-protobuf', `npx protoc --ts_out ${protobufOutTemp} --proto_path ${this.protobufPath} ${this.protobufPath}/*.proto --experimental_allow_proto3_optional`);
                                if (isOk == "success") {
                                    this.addBuildLog('编译协议完成...');
                                }
                            } catch (error: any) {
                                this.addBuildLog(`编译协议出错,${error.toString()}`);
                                console.error(error);
                            }

                            let content = ``;

                            const files = readdirSync(protobufOutTemp);
                            if (files.length > 0) {
                                files.forEach(file => {
                                    let text = readFileSync(`${protobufOutTemp}/${file}`, "utf-8");
                                    text = text.replace(new RegExp("@protobuf-ts/runtime", "gm"), "db://game-protobuf/game-framework");
                                    this.addBuildLog(`修改${file}协议导入信息并拷贝到${this.protobufRegisterPath}...`);
                                    writeFileSync(`${rPath}/${file}`, text);

                                    // 创建项目
                                    const project = new Project();
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
                                            if (declaration.getKind() === SyntaxKind.VariableDeclaration) {
                                                const varDecl = declaration.asKind(SyntaxKind.VariableDeclaration);
                                                const initializer = varDecl?.getInitializer();

                                                if (initializer?.getKind() === SyntaxKind.NewExpression) {
                                                    w.write(`Container.getInterface("IGameFramework.ISerializable")?.registerInst(${name});`);
                                                    w.newLine();
                                                    // 获取类声明
                                                    const classDeclaration = sourceFile.getClass(name + "$Type")!;
                                                    // 计算 CRC32 值
                                                    const crcValue = crc32.str(name); // 使用类名计算 CRC32
                                                    classDeclaration.addImplements(`IGameFramework.ISerializer`);
                                                    const getterStructure: GetAccessorDeclarationStructure = {
                                                        name: "protoId",
                                                        kind: StructureKind.GetAccessor,
                                                        returnType: "number",
                                                        statements: `return ${crcValue};`,
                                                        isStatic: false,        // 是否是静态方法
                                                        scope: Scope.Public         // 访问范围
                                                    };
                                                    classDeclaration.addGetAccessor(getterStructure);
                                                }

                                            }
                                        });
                                    });

                                    sourceFile.getClasses().forEach(e => { e.getName() })


                                    w.write(`});`);
                                    sourceFile.insertText(sourceFile.getEnd(), w.toString());
                                    sourceFile.formatText();

                                    writeFileSync(`${rPath}/${file}`, sourceFile.getFullText());
                                });
                            }

                            this.addBuildLog('构建协议注入信息文件...');
                            const file = `${this.protobufRegisterPath}/${this.protobufRegisterFile}`;

                            this.addBuildLog('删除临时目录...');
                            rmdirSync(protobufOutTemp, { recursive: true });

                            this.addBuildLog('构建完毕，刷新资源数据库...');
                            await Editor.Message.request("asset-db", "refresh-asset", "db://assets");
                        } else {
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
