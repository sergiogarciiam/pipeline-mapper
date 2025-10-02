import * as vscode from "vscode";
import * as YAML from "yaml";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "pipeline-mapper" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "pipeline-mapper.showPipelineMapper",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }

      if (!editor.document.fileName.endsWith("gitlab.yml")) {
        vscode.window.showErrorMessage(
          "This extension only works with gitlab.yml files"
        );
        return;
      }

      const fileContent = editor.document.getText();

      const panel = vscode.window.createWebviewPanel(
        "pipelineMapper",
        "Pipeline Mapper",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent(context, panel, fileContent);
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  fileContent: string
): string {
  const jsonContent = YAML.parse(fileContent);
  const processedData = processData(jsonContent);

  const webDist = vscode.Uri.joinPath(
    context.extensionUri,
    "web",
    "dist",
    "assets"
  );
  const files = fs.readdirSync(webDist.fsPath);

  const jsFile = files.find((file) => file.match(/^index-.*\.js$/));
  const cssFile = files.find((file) => file.match(/^index-.*\.css$/));

  if (!jsFile || !cssFile) {
    throw new Error("Required assets not found");
  }

  const scriptSrc = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "web", "dist", "assets", jsFile)
  );

  const cssSrc = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "web", "dist", "assets", cssFile)
  );

  return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <link rel="stylesheet" href="${cssSrc}" />
          </head>
										<script>
              window.pipelineData = ${JSON.stringify(processedData)};
          </script>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <div><pre>${JSON.stringify(processedData, null, 2)}</pre></div>
          </body>
        </html>
        `;
  //<script src="${scriptSrc}"></script>
}

function processData(data: any) {
  const stages = data.stages || [];
  const hiddenJobs = Object.keys(data).filter((job) => job.startsWith("."));
  const jobs = stages.reduce((acc: Record<string, any>, stage: string) => {
    acc[stage] = {};
    return acc;
  }, {});
  jobs["none"] = {};
  jobs["undefined"] = {};

  Object.keys(data).forEach((jobName) => {
    if (isJob(jobName)) {
      const job = processJob(jobName, data);

      if (!job) {
        return;
      }

      if (!job.stage) {
        jobs["none"][jobName] = job;
      } else if (!stages.includes(job.stage)) {
        jobs["undefined"][jobName] = job;
      } else {
        jobs[job.stage][jobName] = job;
      }
    }
  });

  return { stages, jobs, hiddenJobs };
}

function isJob(jobName: any): boolean {
  const reservedKeys = [
    "stages",
    "variables",
    "include",
    "default",
    "image",
    "services",
    "before_script",
    "after_script",
    "types",
  ];

  return !reservedKeys.includes(jobName) && !jobName.startsWith(".");
}

function processJob(
  jobName: string,
  data: any,
  resolvedJobs: Record<string, any> = {},
  stack: string[] = []
): any {
  if (resolvedJobs[jobName]) {
    return resolvedJobs[jobName];
  }

  if (data[jobName] === undefined) {
    return null;
  }

  const job = data[jobName];

  if (!job || typeof job !== "object") {
    return null;
  }

  let processedJob: any = {
    stage: job.stage,
    rules: normalizeRules(job.rules || []),
    needs: job.needs || [],
    extends: normalizeExtends(job.extends),
    extendsUndefined: [],
  };

  if (job.extends) {
    const parentsExtends = Array.isArray(processedJob.extends)
      ? processedJob.extends
      : [processedJob.extends];
    const validExtends: string[] = [];

    parentsExtends.forEach((parent: string) => {
      if (stack.includes(parent)) {
        throw new Error(
          `Cyclic extends detected: ${stack.join(" -> ")} -> ${parent}`
        );
      }

      stack.push(parent);
      const parentJob = processJob(parent, data, resolvedJobs, stack);

      if (!parentJob) {
        processedJob.extendsUndefined.push(parent);
        return;
      } else {
        validExtends.push(parent);
      }

      parentJob.rules = normalizeRules(parentJob.rules || []);

      if (parentJob) {
        processedJob.rules = [
          ...(parentJob.rules || []),
          ...(processedJob.rules || []),
        ];

        processedJob.needs = [
          ...(parentJob.needs || []),
          ...(processedJob.needs || []),
        ];

        processedJob.extendsUndefined = Array.from(
          new Set([
            ...(parentJob.extendsUndefined || []),
            ...(processedJob.extendsUndefined || []),
          ])
        );
      }

      stack.pop();
    });
    processedJob.extends = Array.from(new Set(validExtends));
  }

  resolvedJobs[jobName] = processedJob;
  return processedJob;
}

function normalizeRules(rules: any[]): {
  type: string;
  value?: any;
  when?: string;
}[] {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules.map((rule) => {
    if (rule.if) {
      return { type: "if", value: rule.if, when: rule.when || "on_success" };
    } else if (rule.exists) {
      return {
        type: "exists",
        value: rule.exists,
        when: rule.when || "on_success",
      };
    } else if (rule.changes) {
      return {
        type: "changes",
        value: rule.changes,
        when: rule.when || "on_success",
      };
    }
    return { type: "unknown", when: rule.when || "on_success" };
  });
}

function normalizeExtends(extendsField: any): string[] {
  if (!extendsField) {
    return [];
  }
  return Array.isArray(extendsField) ? extendsField : [extendsField];
}

export function deactivate() {}
