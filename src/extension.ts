import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as _  from 'lodash';

export function GetTemplates(templatePath: fs.PathLike): Array<Array<string>> {
	const files = fs.readdirSync(templatePath);
	const templates: Array<string> = [];
	files.filter(e => e.includes(".dockerignore") ? false : true).forEach(file => {
		templates.push(_.trimEnd(file, ".dockerfile"));
	});
	return [templates, files];
}

export function CreateDockerFile(option: any, templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(`${templatePath}/${option}.dockerfile`);
	  fs.writeFileSync(`${workspaceFolder}/Dockerfile`, data);
	} catch (error) {
		return false;
	}
	finally {
		return true;
	}
}

export function CreateIgnoreDockerFile(option: any, templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(`${templatePath}/.dockerignore ${option}`);
		fs.writeFileSync(`${workspaceFolder}/.dockerignore`, data);
	} catch (error) {
		return false;
	}
	finally {
		return true;
	}
}

export function activate(context: vscode.ExtensionContext) {
	const templatePath = path.join(__dirname, '../templates');

	const [ templates, allFiles ] :Array<Array<string>> = GetTemplates(templatePath);
	let disposable = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
	const { workspace: { workspaceFolders } } = vscode;
	const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
	if(workspaceFolder){
	vscode.window.showQuickPick(templates).then(option => {
		if (!option) {return;}
		allFiles.forEach((file) => {
			// check if a ignore file exist
			if (file === `.dockerignore ${option}`) {
				vscode.window.showInformationMessage("A .dockerignore file exist for this template , do you want to use it ?", "yes", "no").then(response => {		
				if (response === "yes") {CreateIgnoreDockerFile(option , templatePath, workspaceFolder);}
				});
			}
			CreateDockerFile(option, templatePath, workspaceFolder);
		});
	});
	}
	else {
		vscode.window.showInformationMessage("workspaceFolder not found");
	}
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }
