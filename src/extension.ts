import * as vscode from 'vscode';
import * as fs from 'fs';
import { normalize } from "path";
import { DockerFileTemplate } from './views/dockerfiletemplate';

export function getTemplates(templatePath: fs.PathLike): Array<Array<string>> {
	const files = fs.readdirSync(templatePath);
	const templates: Array<string> = [];
	files.filter(e => e.includes(".dockerignore") ? false : true).forEach(file => {
		templates.push(file.substr(0,file.length - 11)); // to remove ".dockerfile"
	});
	return [templates, files];
}

export function createDockerFile(templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(normalize(`${__dirname}/${templatePath}`));
	  fs.writeFileSync(`${workspaceFolder}/Dockerfile`, data);
	} catch (error:any) {
		throw new Error(error);
	}
	return true;
}

export function createIgnoreDockerFile(templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(normalize(`${__dirname}/${templatePath}`));
		fs.writeFileSync(`${workspaceFolder}/.dockerignore`, data);
	} catch (error:any) {
		throw new Error(error);
	}
	return true;
}

interface TemplateFile {
	name:string;
	path:string;
	ignoreFilePath?:string;
}
export interface Template {
	name:string;
	installs:TemplateFile[]
}

export function activate(context: vscode.ExtensionContext) {
	const templates:Template[] = require("../templates.json")
	new DockerFileTemplate(context,templates);
	registerCommands(context,templates);

}

function findInstallObjFromName(name:string,templates:Template[]):TemplateFile | undefined {
	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const template = templates[templateIndex];
		if(name.includes(template.name)){
			for (let index = 0; index < template.installs.length; index++) {
				const install = template.installs[index];
				if(install.name === name){
					return install;
				}
			}
			throw new Error(`Can't find ${name} inside ${template.name}`);
		}
	}
	throw new Error("Can't find "+name);
}

function updateConfiguration(parameter:string,value:any) {
	vscode.workspace.getConfiguration('dockerfiletemplate').update(parameter, value, vscode.ConfigurationTarget.Global)
}

function getConfiguration(parameter:string,value:any) {
	return vscode.workspace.getConfiguration('dockerfiletemplate').get(parameter, value);
}


const createIgnoreFileOptions = ["yes", "no","yes forever"]
function useTemplate(templateName:string,templates: Template[],workspaceFolder:string,forceUseDockerIgnore = false) {
	const templateFile = findInstallObjFromName(templateName,templates)
	const alwaysAddIgnoreFiles: Boolean = getConfiguration("alwaysAddIgnoreFiles",false);
				if(templateFile){
					createDockerFile(templateFile.path, workspaceFolder);
					if (templateFile.ignoreFilePath) {
						if(forceUseDockerIgnore || alwaysAddIgnoreFiles){
							createIgnoreDockerFile(templateFile.ignoreFilePath as string, workspaceFolder);
						}
						else{
							vscode.window.showInformationMessage("A .dockerignore file exist for this template , do you want to use it ?",...createIgnoreFileOptions).then(response => {		
							const optionIndex = createIgnoreFileOptions.findIndex((e)=>{ return e === response});
							switch (optionIndex) {
								case 2: // yes forever
									updateConfiguration("alwaysAddIgnoreFiles",true);
								case 0: // yes
									createIgnoreDockerFile(templateFile.ignoreFilePath as string, workspaceFolder);
									break;
								case 1: // no
									break;
								default:
									break;
							}
							});
					}
					}
				}
}

function getWorkSpace():string | undefined {
	const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
		if(workspaceFolder){
			return workspaceFolder;
		}
		else {
			vscode.window.showInformationMessage("workspaceFolder not found");
		}
}

interface CommandFromTreeView {
	key:string;
}
function registerCommands(context:vscode.ExtensionContext, templates:Template[]){
	const disposableGeneratedockerfile = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
		const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
		if(workspaceFolder){
			const templatesNames:string[] = []
			templates.forEach(template => {
				template.installs.forEach(install => {
					templatesNames.push(install.name)
				});
			});
			vscode.window.showQuickPick(templatesNames).then(option => {
				if (!option) {return;}
				useTemplate(option,templates,workspaceFolder);
			});
		}
		else {
			vscode.window.showInformationMessage("workspaceFolder not found");
		}
	});
	context.subscriptions.push(disposableGeneratedockerfile);
	const disposableUseTemplate = vscode.commands.registerCommand('dockerfiletemplate.useTemplate', (template:CommandFromTreeView) => {
		const templateName = template.key;
		const workspace = getWorkSpace();
		if(workspace){
			const alwaysAddIgnoreFiles = getConfiguration("alwaysAddIgnoreFiles", false);
			useTemplate(templateName,templates,workspace,alwaysAddIgnoreFiles)
		}
	});
	context.subscriptions.push(disposableUseTemplate);
	const disposableUseTemplateWDockerIgnore = vscode.commands.registerCommand('dockerfiletemplate.useTemplateWDockerIgnore', (template:CommandFromTreeView) => {
		const templateName = template.key;
		const workspace = getWorkSpace();
		if(workspace){
			useTemplate(templateName,templates,workspace,true)
		}
	});
	console.log(context.subscriptions)
	context.subscriptions.push(disposableUseTemplateWDockerIgnore);
}


export function deactivate() { }
