import * as vscode from 'vscode';
import fs from 'fs';
import { PipelineData } from '../utils/types';

export async function getWebviewContent(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  finalData: PipelineData,
) {
  const dist = vscode.Uri.joinPath(context.extensionUri, 'web', 'dist', 'assets');
  const files = fs.readdirSync(dist.fsPath);

  const jsFile = files.find((f) => f.match(/^index-.*\.js$/));
  const cssFile = files.find((f) => f.match(/^index-.*\.css$/));

  if (!jsFile || !cssFile) {
    throw new Error('No se encontraron assets compilados');
  }

  const jsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, jsFile));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, cssFile));

  const dataScript = `<script>window.pipelineData = ${JSON.stringify(finalData)};</script>`;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <link rel="stylesheet" href="${cssUri}">
    </head>
    <body>
      <div id="root"></div>
      ${dataScript}
      <script src="${jsUri}"></script>
    </body>
  </html>`;
}
