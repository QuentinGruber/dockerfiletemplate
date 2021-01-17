import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "dockerfiletemplate" is now active!');

	let disposable = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
		vscode.window.showInformationMessage('Hello World from DockerFileTemplate!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
