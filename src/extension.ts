import * as vscode from 'vscode';
import path from 'path';
import { WebviewComponent } from './webview/WebviewComponent';
import { PipelineProcessor } from './pipeline/PipelineProcesor';

export function activate(context: vscode.ExtensionContext) {
  const webview = new WebviewComponent(context);
  let panel: vscode.WebviewPanel | undefined;
  let watcher: vscode.Disposable | undefined;

  const command = vscode.commands.registerCommand(
    'pipeline-mapper.generatePipelineMapper',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage('No active editor');
      }

      const filePath = editor.document.fileName;
      if (!/\.(ya?ml)$/i.test(filePath)) {
        return vscode.window.showErrorMessage('This is not a YAML file (.yml or .yaml)');
      }

      if (panel) {
        panel.reveal(vscode.ViewColumn.One);
      } else {
        panel = webview.createPanel();
      }

      await renderPipeline(panel, filePath, webview);

      watcher = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        if (panel && /\.(ya?ml)$/i.test(doc.fileName)) {
          try {
            await renderPipeline(panel, doc.fileName, webview);
          } catch (err) {
            const msg = (err as Error).message || '';
            if (!msg.includes('Webview is disposed') && !msg.includes('cannot post message')) {
              vscode.window.showErrorMessage(`Error processing the pipeline: ${err}`);
            }
          }
        }
      });

      panel.onDidDispose(() => {
        watcher?.dispose();
        watcher = undefined;
        panel = undefined;
      });
    },
  );

  context.subscriptions.push(command);
}

async function renderPipeline(
  panel: vscode.WebviewPanel,
  filePath: string,
  webview: WebviewComponent,
) {
  const processor = new PipelineProcessor(path.dirname(filePath));
  const data = await processor.process(filePath);
  await webview.render(panel, data);
}

export function deactivate() {}
