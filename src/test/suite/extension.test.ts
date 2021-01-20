import * as assert from 'assert';
import * as path from 'path';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { CreateDockerFile, CreateIgnoreDockerFile, GetTemplates } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('CreateDockerFile', () => {
		const templatePath = path.join(__dirname, '../templates');
		const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : path.join(__dirname, '../');
		assert.strictEqual(CreateDockerFile("Nodejs app",templatePath,workspaceFolder), true);
	});

	test('CreateIgnoreDockerFile', () => {
		const templatePath = path.join(__dirname, '../templates');
		const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : path.join(__dirname, '../');
		assert.strictEqual(CreateIgnoreDockerFile("Nodejs app",templatePath,workspaceFolder), true);
	});

	test('GetTemplates', () => {
		const templatePath = path.join(__dirname, '../../../templates');
		assert.strictEqual(GetTemplates(templatePath).length > 0 ? true : false, true);
	});
});
