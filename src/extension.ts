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

  const job = data[jobName];

  if (!job || typeof job !== "object") {
    return null;
  }

  let processedJob: any = {
    stage: job.stage,
    rules: job.rules || [],
    needs: job.needs || [],
    extends: Array.isArray(job.extends)
      ? job.extends
      : job.extends
      ? [job.extends]
      : [],
  };

  if (job.extends) {
    const parentsExtends = Array.isArray(job.extends)
      ? job.extends
      : [job.extends];

    parentsExtends.forEach((parent: string) => {
      if (stack.includes(parent)) {
        throw new Error(
          `Cyclic extends detected: ${stack.join(" -> ")} -> ${parent}`
        );
      }

      stack.push(parent);
      const parentJob = processJob(parent, data, resolvedJobs, stack);

      if (parentJob) {
        processedJob = {
          stage: processedJob.stage || parentJob.stage,
          rules: [...(parentJob.rules || []), ...(processedJob.rules || [])],
          needs: [...(parentJob.needs || []), ...(processedJob.needs || [])],
          extends: [
            ...(parentJob.extends || []),
            ...(processedJob.extends || []),
          ],
        };
      }
    });
  }

  resolvedJobs[jobName] = processedJob;
  return processedJob;
}

export function deactivate() {}
