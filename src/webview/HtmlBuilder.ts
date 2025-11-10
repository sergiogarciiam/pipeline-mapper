import type { PipelineData } from '../utils/types';

export class HtmlBuilder {
  private title = 'Pipeline Mapper';
  private jsUri = '';
  private cssUri = '';
  private data: PipelineData | null = null;
  private bodyContent = '<div id="root"></div>';
  private extraHeadContent = '';

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withAssets(jsUri: string, cssUri: string) {
    this.jsUri = jsUri;
    this.cssUri = cssUri;
    return this;
  }

  withData(data: PipelineData) {
    this.data = data;
    return this;
  }

  withBody(content: string) {
    this.bodyContent = content;
    return this;
  }

  withHeadContent(extra: string) {
    this.extraHeadContent += extra;
    return this;
  }

  private buildDataScript(): string {
    if (!this.data) return '';
    // Avoid XSS
    const safeJson = JSON.stringify(this.data)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

    return `<script id="pipeline-data">window.pipelineData = ${safeJson};</script>`;
  }

  build(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.title}</title>
    ${this.cssUri ? `<link rel="stylesheet" href="${this.cssUri}">` : ''}
    ${this.extraHeadContent}
  </head>
  <body>
    ${this.bodyContent}
    ${this.buildDataScript()}
    ${this.jsUri ? `<script src="${this.jsUri}"></script>` : ''}
  </body>
</html>`;
  }
}
