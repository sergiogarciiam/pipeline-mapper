import * as vscode from 'vscode';
import path from 'path';
import { WebviewComponent } from './webview/WebviewComponent';
import { PipelineProcessor } from './pipeline/PipelineProcesor';

export function activate(context: vscode.ExtensionContext) {
  const webview = new WebviewComponent(context);
  let panel: vscode.WebviewPanel | undefined;

  const command = vscode.commands.registerCommand(
    'pipeline-mapper.generatePipelineMapper',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage('No active editor');
      }

      const filePath = editor.document.fileName;
      if (!filePath.endsWith('.yml')) {
        return vscode.window.showErrorMessage('It is not a .yml file');
      }

      panel = webview.createPanel();
      await renderPipeline(panel, filePath, webview);
    },
  );

  const watcher = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (panel && doc.fileName.endsWith('.yml')) {
      await renderPipeline(panel, doc.fileName, webview);
    }
  });

  context.subscriptions.push(command, watcher);
}

async function renderPipeline(
  panel: vscode.WebviewPanel,
  filePath: string,
  webview: WebviewComponent,
) {
  try {
    const processor = new PipelineProcessor(path.dirname(filePath));
    const data = await processor.process(filePath);
    await webview.render(panel, data);
  } catch (err) {
    vscode.window.showErrorMessage(`Error processing the pipeline: ${err}`);
  }
}

export function deactivate() {}
