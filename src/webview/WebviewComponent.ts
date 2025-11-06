import * as vscode from 'vscode';
import type { PipelineData } from '../utils/types';
import { AssetResolver } from './AssetResolver';
import { HtmlBuilder } from './HtmlBuilder';

export class WebviewComponent {
  private assetResolver: AssetResolver;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.assetResolver = new AssetResolver(this.context);
  }

  public createPanel(title = 'Pipeline Mapper'): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel('pipelineMapper', title, vscode.ViewColumn.One, {
      enableScripts: true,
    });

    panel.iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'icon.png');

    return panel;
  }

  public async render(panel: vscode.WebviewPanel, data: PipelineData): Promise<void> {
    const { jsUri, cssUri } = this.assetResolver.resolve(panel);
    const html = new HtmlBuilder()
      .withTitle('Pipeline Mapper')
      .withAssets(jsUri.toString(), cssUri.toString())
      .withData(data)
      .build();

    panel.webview.html = html;
  }
}
