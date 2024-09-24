import { existsSync, writeFileSync } from 'fs';
import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { App, createApp } from 'vue';
import packageJSON from '../../../package.json';
import { Parser, ParserOptions } from '../../compiler/parser';

let path = Editor.Package.getPath(packageJSON.name)!;
let file = join(path, "config.json");
if (!existsSync(file)) {
    writeFileSync(file, JSON.stringify({
        xlsxPath: "",
        exportDirector: "",
        exportTSDirector: "",
        modFile: "",
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
    globalModuleInterfaceName: string
) {
    writeFileSync(file, JSON.stringify({
        xlsxPath: xlsxPath,
        exportDirector: exportDirector,
        exportTSDirector: exportTSDirector,
        modFile: modFile,
        globalModuleName: globalModuleName,
        globalModuleTSName: globalModuleTSName,
        globalModuleInterfaceName: globalModuleInterfaceName,
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
                        xlsxPath: data.xlsxPath,
                        exportDirector: data.exportDirector,
                        exportTSDirector: data.exportTSDirector,
                        modFile: data.modFile,
                        globalModuleName: data.globalModuleName,
                        globalModuleTSName: data.globalModuleTSName,
                        globalModuleInterfaceName: data.globalModuleInterfaceName,
                        count: 0,
                        posts: []
                    };
                },
                methods: {
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
                        save(this.xlsxPath, this.exportDirector, this.exportTSDirector, this.modFile, this.globalModuleName, this.globalModuleTSName, this.globalModuleInterfaceName);
                    },
                    async onParser() {
                        this.posts.length = 0;
                        this.count = 0;

                        if (!this.modFile) this.modFile = "client";

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
                    }
                },
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
