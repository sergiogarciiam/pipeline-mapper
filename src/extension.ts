import * as vscode from "vscode";
import * as YAML from "yaml";
import * as fs from "fs";
import { Job, PipelineData, Rule } from "./types";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "pipeline-mapper.generatePipelineMapper",
    async () => {
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

      const jsonContent = YAML.parse(fileContent);
      const initialData = processData(jsonContent);
      const mergedData = await processIncludes(
        initialData,
        path.dirname(editor.document.fileName)
      );
      panel.webview.html = await getWebviewContent(context, panel, mergedData);
    }
  );

  context.subscriptions.push(disposable);
}

async function getWebviewContent(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  mergedData: PipelineData
) {
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
              window.pipelineData = ${JSON.stringify(mergedData)};
          </script>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <div><pre>${JSON.stringify(mergedData, null, 2)}</pre></div>
          </body>
          <script src="${scriptSrc}"></script>
        </html>
        `;
}

function processData(data: PipelineData) {
  const stages = data.stages || [];
  const hiddenJobs = Object.keys(data).filter((job) => job.startsWith("."));
  const jobs: Record<string, any> = {};
  const include = data.include || [];

  Object.keys(data).forEach((jobName) => {
    if (isJob(jobName)) {
      const job = processJob(jobName, data);

      if (!job) {
        return;
      }

      jobs[jobName] = job;
    }
  });

  return { stages, jobs, hiddenJobs, include };
}

async function processIncludes(
  data: PipelineData,
  baseDir: string,
  visited: Set<string> = new Set()
) {
  return data;
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
    resolveExtendsHierarchy(processed, data, resolvedJobs, stack);
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

  const normalized: Rule[] = [];

  rules.forEach((rule) => {
    const when = rule.when || "on_success";

    if (typeof rule.if === "string") {
      if (
        rule.if.includes("&&") ||
        rule.if.includes("(") ||
        rule.if.includes(")")
      ) {
        normalized.push({ type: "unknown", when });
      } else {
        const conditions = rule.if.split("||").map((c: string) => c.trim());
        conditions.forEach((condition: string) => {
          normalized.push({ type: "if", value: condition, when });
        });
      }
    } else if (rule.exists) {
      normalized.push({ type: "exists", value: rule.exists, when });
    } else if (rule.changes) {
      normalized.push({ type: "changes", value: rule.changes, when });
    } else {
      normalized.push({ type: "unknown", when });
    }
  });

  return normalized;
}

function normalizeExtends(extendsField: any): string[] {
  if (!extendsField) {
    return [];
  }

  return Array.isArray(extendsField) ? extendsField : [extendsField];
}

function resolveExtendsHierarchy(
  processed: Job,
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
