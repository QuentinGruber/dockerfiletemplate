import * as vscode from 'vscode';
const path = require('path');
import * as fs from 'fs';
const templatePath = path.join(__dirname, '../templates');
import * as _  from 'lodash';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "dockerfiletemplate" is now active!');

	const templates: Array<string> = [];
	let allFiles: Array<string>;
	fs.readdir(templatePath, function (err:any, files:Array<string>) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
		} 
		allFiles = files;
		files.filter(e => e.includes(".dockerignore") ? false : true).forEach(file => {

			templates.push(_.trimEnd(file, ".dockerfile"))
		})
		
	});
	
	let disposable = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
		const { workspace: { workspaceFolders } } = vscode;
		console.log(workspaceFolders)
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;

		vscode.window.showQuickPick(templates).then(option => {
			if (!option) return;
			allFiles.forEach((file) => {
					// check if a ignore file exist
				if (file === `.dockerignore ${option}`) {
					vscode.window.showInformationMessage("A .dockerignore file exist for this template , do you want to use it ?", "yes", "no").then(response => {		
						if (response === "yes") {
							fs.readFile(`${templatePath}/.dockerignore ${option}`, (err: any , data: Buffer) => {
								console.log(data)
								fs.writeFileSync (`${workspaceFolder}/.dockerignore`, data)
							})
						}
					})
				}
				fs.readFile(`${templatePath}/${option}.dockerfile`, (err: any , data: Buffer) => {
					console.log(`${workspaceFolder}/Dockerfile`)
					fs.writeFileSync (`${workspaceFolder}/Dockerfile`, data);
			})
			})

		})

	})

	context.subscriptions.push(disposable);
}

export function deactivate() {}
