import * as vscode from 'vscode';
import * as YAML from 'yaml';
import path from 'path';
import fs from 'fs';
import { processIncludes } from './pipeine/includes';
import { getWebviewContent } from './webview/webviewContent';
import { processData } from './pipeine/parser';
import { processNeedsGroups } from './pipeine/needsProcessor';

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined;

  const command = vscode.commands.registerCommand(
    'pipeline-mapper.generatePipelineMapper',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage('No active editor');
      }

      const filePath = editor.document.fileName;
      if (!filePath.endsWith('gitlab.yml')) {
        return vscode.window.showErrorMessage('Solo funciona con gitlab.yml');
      }

      panel = vscode.window.createWebviewPanel(
        'pipelineMapper',
        'Pipeline Mapper',
        vscode.ViewColumn.One,
        { enableScripts: true },
      );

      await renderPipeline(panel, context, filePath);
    },
  );

  const watcher = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (doc.fileName.endsWith('gitlab.yml') && panel) {
      await renderPipeline(panel, context, doc.fileName, true);
    }
  });

  context.subscriptions.push(command, watcher);
}

async function renderPipeline(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  filePath: string,
  isReload = false,
) {
  try {
    const yamlText = fs.readFileSync(filePath, 'utf8');
    const jsonContent = YAML.parse(yamlText);
    const rootName = path.basename(filePath);

    const baseData = processData(jsonContent, rootName);
    const mergedData = await processIncludes(baseData, path.dirname(filePath));
    const finalData = processNeedsGroups(mergedData);

    panel.webview.html = await getWebviewContent(context, panel, finalData);

    if (isReload) {
      vscode.window.showInformationMessage('Pipeline Mapper actualizado ✔️');
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Error al procesar pipeline: ${err}`);
  }
}

export function deactivate() {}
