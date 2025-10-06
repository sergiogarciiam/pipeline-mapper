import * as vscode from "vscode";
import * as YAML from "yaml";
import * as fs from "fs";
import { Job, PipelineData, Rule } from "./types";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "pipeline-mapper.generatePipelineMapper",
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

function processData(data: PipelineData) {
  const stages = data.stages || [];
  const hiddenJobs = Object.keys(data).filter((job) => job.startsWith("."));
  const jobs: Record<string, any> = {};

  Object.keys(data).forEach((jobName) => {
    if (isJob(jobName)) {
      const job = processJob(jobName, data);

      if (!job) {
        return;
      }

      jobs[jobName] = job;
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
  data: Record<string, any>,
  resolvedJobs: Record<string, Job> = {},
  stack: string[] = []
): Job | null {
  if (resolvedJobs[jobName]) {
    return resolvedJobs[jobName];
  }

  const job = data[jobName];
  if (!job || typeof job !== "object") {
    return null;
  }

  const { validNeeds, missingNeeds } = analyzeNeeds(job, data);

  const processed: Job = {
    stage: job.stage,
    rules: normalizeRules(job.rules),
    needs: validNeeds,
    noExistNeeds: missingNeeds,
    extends: normalizeExtends(job.extends),
    noExistExtends: [],
  };

  if (job.extends) {
    resolveExtendsHierarchy(processed, job, data, resolvedJobs, stack);
  }

  resolvedJobs[jobName] = processed;
  return processed;
}

function analyzeNeeds(
  job: any,
  data: Record<string, any>
): { validNeeds: string[]; missingNeeds: string[] } {
  const validNeeds: string[] = [];
  const missingNeeds: string[] = [];

  for (const need of job.needs || []) {
    const needName = typeof need === "string" ? need : need.job;
    if (!needName) {
      continue;
    }
    if (!data[needName]) {
      missingNeeds.push(needName);
    } else {
      validNeeds.push(needName);
    }
  }

  return {
    validNeeds: [...new Set(validNeeds)],
    missingNeeds: [...new Set(missingNeeds)],
  };
}

function normalizeRules(rules: any[]): Rule[] {
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

function resolveExtendsHierarchy(
  processed: Job,
  job: any,
  data: Record<string, any>,
  resolvedJobs: Record<string, Job>,
  stack: string[]
) {
  const parents = Array.isArray(processed.extends)
    ? processed.extends
    : [processed.extends];
  const validParents: string[] = [];

  for (const parent of parents) {
    if (stack.includes(parent)) {
      throw new Error(
        `Cyclic extends detected: ${stack.join(" -> ")} -> ${parent}`
      );
    }

    stack.push(parent);
    const parentJob = processJob(parent, data, resolvedJobs, stack);

    if (!parentJob) {
      processed.noExistExtends.push(parent);
      stack.pop();
      continue;
    }

    validParents.push(parent);
    mergeJobInheritance(processed, parentJob);
    stack.pop();
  }

  processed.extends = [...new Set(validParents)];
}

function mergeJobInheritance(child: Job, parent: Job): void {
  child.rules = [...normalizeRules(parent.rules), ...child.rules];
  child.needs = [...new Set([...parent.needs, ...child.needs])];
  child.noExistNeeds = [
    ...new Set([...parent.noExistNeeds, ...child.noExistNeeds]),
  ];
  child.noExistExtends = [
    ...new Set([...parent.noExistExtends, ...child.noExistExtends]),
  ];
}

export function deactivate() {}
