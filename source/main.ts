import { execSync } from 'child_process';
import packageJSON from '../package.json';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {

    configureParser() {
        Editor.Panel.open(packageJSON.name);
    },

    compierProtobuf(command: string) {

        try {
            execSync(command, { cwd: __dirname });
        } catch (error) {

            console.log("执行失败: " + error);
            return "error";
        }

        return "success"
    }
};

/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export function load() { }

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() { }
