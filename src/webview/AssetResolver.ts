import * as vscode from 'vscode';
import * as fs from 'fs';

export class AssetResolver {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly distFolder = 'web/dist/assets',
  ) {}

  resolve(panel: vscode.WebviewPanel) {
    const dist = vscode.Uri.joinPath(this.context.extensionUri, this.distFolder);
    const files = fs.readdirSync(dist.fsPath);

    const jsFile = files.find((f) => /^index-.*\.js$/.test(f));
    const cssFile = files.find((f) => /^index-.*\.css$/.test(f));

    if (!jsFile || !cssFile) {
      throw new Error('Assets not found in the dist folder');
    }

    const jsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, jsFile));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, cssFile));

    return { jsUri, cssUri };
  }
}
