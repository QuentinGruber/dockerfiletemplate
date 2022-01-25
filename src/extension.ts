import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DockerFileTemplate } from './views/dockerfiletemplate';

export function getTemplates(templatePath: fs.PathLike): Array<Array<string>> {
	const files = fs.readdirSync(templatePath);
	const templates: Array<string> = [];
	files.filter(e => e.includes(".dockerignore") ? false : true).forEach(file => {
		templates.push(file.substr(0,file.length - 11)); // to remove ".dockerfile"
	});
	return [templates, files];
}

export function createDockerFile(option: any, templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(`${templatePath}/${option}.dockerfile`);
	  fs.writeFileSync(`${workspaceFolder}/Dockerfile`, data);
	} catch (error) {
		return false;
	}
	return true;
}

export function createIgnoreDockerFile(option: any, templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(`${templatePath}/.dockerignore ${option}`);
		fs.writeFileSync(`${workspaceFolder}/.dockerignore`, data);
	} catch (error) {
		return false;
	}
	return true;
}

function checkForIgnoreFile(choosedFile:string,allFiles:string[],templatePath:string,workspaceFolder:string){
	allFiles.forEach((file:string) => {
		// check if a ignore file exist
		if (file === `.dockerignore ${choosedFile}`) {
			vscode.window.showInformationMessage("A .dockerignore file exist for this template , do you want to use it ?", "yes", "no").then(response => {		
			if (response === "yes") {createIgnoreDockerFile(choosedFile , templatePath, workspaceFolder);}
			});
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	const templatePath = path.join(__dirname, '../templates');

	const [ templates, allFiles ] :Array<Array<string>> = getTemplates(templatePath);
	new DockerFileTemplate(context,templates);
	let disposable = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
		const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
		if(workspaceFolder){
			vscode.window.showQuickPick(templates).then(option => {
				if (!option) {return;}
				checkForIgnoreFile(option,allFiles,templatePath,workspaceFolder);
				createDockerFile(option, templatePath, workspaceFolder);
			});
		}
		else {
			vscode.window.showInformationMessage("workspaceFolder not found");
		}
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }
