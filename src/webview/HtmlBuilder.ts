export class HtmlBuilder {
  private title = 'Pipeline Mapper';
  private jsUri = '';
  private cssUri = '';
  private dataScript = '';
  private bodyContent = '<div id="root"></div>';

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withAssets(jsUri: string, cssUri: string) {
    this.jsUri = jsUri;
    this.cssUri = cssUri;
    return this;
  }

  withData(data: any) {
    this.dataScript = `<script>window.pipelineData = ${JSON.stringify(data)};</script>`;
    return this;
  }

  withBody(content: string) {
    this.bodyContent = content;
    return this;
  }

  build(): string {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${this.title}</title>
        <link rel="stylesheet" href="${this.cssUri}">
      </head>
      <body>
        ${this.bodyContent}
        ${this.dataScript}
        <script src="${this.jsUri}"></script>
      </body>
    </html>`;
  }
}
