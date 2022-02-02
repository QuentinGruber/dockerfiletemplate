import * as vscode from "vscode";
import { readFileSync, writeFileSync, readdirSync, PathLike } from "fs";
import { normalize } from "path";
import { DockerFileTemplate } from "./views/dockerfiletemplate";

export function createDockerFile(
  templatePath: String,
  workspaceFolder: String
): Boolean {
  try {
    const data = readFileSync(normalize(`${__dirname}/${templatePath}`));
    writeFileSync(`${workspaceFolder}/Dockerfile`, data);
  } catch (error: any) {
    throw new Error(error);
  }
  return true;
}

export function createIgnoreDockerFile(
  templatePath: String,
  workspaceFolder: String
): Boolean {
  try {
    const data = readFileSync(normalize(`${__dirname}/${templatePath}`));
    writeFileSync(`${workspaceFolder}/.dockerignore`, data);
  } catch (error: any) {
    throw new Error(error);
  }
  return true;
}

interface TemplateFile {
  name: string;
  path: string;
  ignoreFilePath?: string;
}
export interface Template {
  name: string;
  installs: TemplateFile[];
}

export function activate(context: vscode.ExtensionContext) {
  const templates: Template[] = require("../templates.json");
  new DockerFileTemplate(context, templates);
  registerCommands(context, templates);
}

function findInstallObjFromName(
  name: string,
  templates: Template[]
): TemplateFile | undefined {
  for (
    let templateIndex = 0;
    templateIndex < templates.length;
    templateIndex++
  ) {
    const template = templates[templateIndex];
    if (name.includes(template.name)) {
      for (let index = 0; index < template.installs.length; index++) {
        const install = template.installs[index];
        if (install.name === name) {
          return install;
        }
      }
      throw new Error(`Can't find ${name} inside ${template.name}`);
    }
  }
  throw new Error("Can't find " + name);
}

function updateConfiguration(parameter: string, value: any) {
  vscode.workspace
    .getConfiguration("dockerfiletemplate")
    .update(parameter, value, vscode.ConfigurationTarget.Global);
}

function getConfiguration(parameter: string, value: any) {
  return vscode.workspace
    .getConfiguration("dockerfiletemplate")
    .get(parameter, value);
}

const createIgnoreFileOptions = ["yes", "no", "yes forever"];
function useTemplate(
  templateName: string,
  templates: Template[],
  workspaceFolder: string,
  forceUseDockerIgnore = false
) {
  const templateFile = findInstallObjFromName(templateName, templates);
  const alwaysAddIgnoreFiles: Boolean = getConfiguration(
    "alwaysAddIgnoreFiles",
    false
  );
  if (templateFile) {
    createDockerFile(templateFile.path, workspaceFolder);
    if (templateFile.ignoreFilePath) {
      if (forceUseDockerIgnore || alwaysAddIgnoreFiles) {
        createIgnoreDockerFile(
          templateFile.ignoreFilePath as string,
          workspaceFolder
        );
      } else {
        vscode.window
          .showInformationMessage(
            "A .dockerignore file exist for this template , do you want to use it ?",
            ...createIgnoreFileOptions
          )
          .then((response) => {
            const optionIndex = createIgnoreFileOptions.findIndex((e) => {
              return e === response;
            });
            switch (optionIndex) {
              case 2: // yes forever
                updateConfiguration("alwaysAddIgnoreFiles", true);
              case 0: // yes
                createIgnoreDockerFile(
                  templateFile.ignoreFilePath as string,
                  workspaceFolder
                );
                break;
              case 1: // no
                break;
              default:
                break;
            }
          });
      }

      if (getConfiguration("askToStar", true)) {
        const askForStarsOptions = [
          "Open github repository",
          "I've already star it !",
          "Remind me later",
        ];
        vscode.window
          .showInformationMessage(
            "If dockerfiletemplate helped you, leave a star on the github repository to show your support!",
            ...askForStarsOptions
          )
          .then((response) => {
            const optionIndex = askForStarsOptions.findIndex((e) => {
              return e === response;
            });
            switch (optionIndex) {
              case 0: // yes
                vscode.env.openExternal(
                  vscode.Uri.parse(
                    "https://github.com/QuentinGruber/dockerfiletemplate"
                  )
                );
                break;
              case 1: // no
                updateConfiguration("askToStar", false);
                break;
              default:
                break;
            }
          });
      }
    }
  }
}

function openPreview(path: string) {
  const openPath = vscode.Uri.file(`${__dirname}/${path}`);
  vscode.workspace.openTextDocument(openPath).then((doc) => {
    vscode.window.showTextDocument(doc);
  });
}
function getWorkSpace(): string | undefined {
  const {
    workspace: { workspaceFolders },
  } = vscode;
  const workspaceFolder = workspaceFolders
    ? workspaceFolders[0].uri.fsPath
    : null;
  if (workspaceFolder) {
    return workspaceFolder;
  } else {
    vscode.window.showInformationMessage(
      "workspace folder not found, please open a folder to use dockerfiletemplate."
    );
  }
}

interface CommandFromTreeView {
  key: string;
}
function registerCommands(
  context: vscode.ExtensionContext,
  templates: Template[]
) {
  const disposableGeneratedockerfile = vscode.commands.registerCommand(
    "dockerfiletemplate.generatedockerfile",
    () => {
      const {
        workspace: { workspaceFolders },
      } = vscode;
      const workspaceFolder = workspaceFolders
        ? workspaceFolders[0].uri.fsPath
        : null;
      if (workspaceFolder) {
        const templatesNames: string[] = [];
        templates.forEach((template) => {
          template.installs.forEach((install) => {
            templatesNames.push(install.name);
          });
        });
        vscode.window.showQuickPick(templatesNames).then((option) => {
          if (!option) {
            return;
          }
          useTemplate(option, templates, workspaceFolder);
        });
      } else {
        vscode.window.showInformationMessage(
          "workspace folder not found, please open a folder to use dockerfiletemplate."
        );
      }
    }
  );
  context.subscriptions.push(disposableGeneratedockerfile);
  const disposableUseTemplate = vscode.commands.registerCommand(
    "dockerfiletemplate.useTemplate",
    (template: CommandFromTreeView) => {
      const templateName = template.key;
      const workspace = getWorkSpace();
      if (workspace) {
        const alwaysAddIgnoreFiles = getConfiguration(
          "alwaysAddIgnoreFiles",
          false
        );
        useTemplate(templateName, templates, workspace, alwaysAddIgnoreFiles);
      }
    }
  );
  context.subscriptions.push(disposableUseTemplate);
  const disposableUseTemplateWDockerIgnore = vscode.commands.registerCommand(
    "dockerfiletemplate.useTemplateWDockerIgnore",
    (template: CommandFromTreeView) => {
      const templateName = template.key;
      const workspace = getWorkSpace();
      if (workspace) {
        useTemplate(templateName, templates, workspace, true);
      }
    }
  );
  context.subscriptions.push(disposableUseTemplateWDockerIgnore);
  const disposablePreviewTemplate = vscode.commands.registerCommand(
    "dockerfiletemplate.previewTemplate",
    (template: CommandFromTreeView) => {
      const templateName: any = template.key;
      const templateFile = findInstallObjFromName(templateName, templates);
      if (templateFile) {
        openPreview(templateFile.path);
      }
    }
  );
  context.subscriptions.push(disposablePreviewTemplate);
}

export function deactivate() {}
