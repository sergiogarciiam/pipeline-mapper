import * as vscode from "vscode";
import * as YAML from "yaml";
import * as fs from "fs";
import { Job, PipelineData, Rule } from "./types";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined;

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

      const panel = vscode.window.createWebviewPanel(
        "pipelineMapper",
        "Pipeline Mapper",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const fileContent = editor.document.getText();
      const jsonContent = YAML.parse(fileContent);
      const rootFileName = path.basename(editor.document.fileName);
      const initialData = processData(jsonContent, rootFileName);
      const mergedData = await processIncludes(
        initialData,
        path.dirname(editor.document.fileName)
      );
      panel.webview.html = await getWebviewContent(context, panel, mergedData);
    }
  );

  const watcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (!document.fileName.endsWith("gitlab.yml")) {
      return;
    }
    if (!panel) {
      return;
    }

    try {
      const fileContent = document.getText();
      const jsonContent = YAML.parse(fileContent);
      const rootFileName = path.basename(document.fileName);
      const initialData = processData(jsonContent, rootFileName);
      const mergedData = await processIncludes(
        initialData,
        path.dirname(document.fileName)
      );

      panel.webview.html = "";
      panel.webview.html = await getWebviewContent(context, panel, mergedData);
      vscode.window.showInformationMessage("Pipeline Mapper actualizado ✔️");
    } catch (err) {
      vscode.window.showErrorMessage(`Error al recargar el esquema: ${err}`);
    }
  });

  context.subscriptions.push(disposable, watcher);
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
          </body>
          <script src="${scriptSrc}"></script>
        </html>
        `;
}

function processData(data: PipelineData, includePath: string) {
  const stages = data.stages || [];
  const hiddenJobs = Object.keys(data).filter((job) => job.startsWith("."));
  const jobs: Record<string, any> = {};
  const include = data.include || [];
  const noExistInclude: string[] = [];

  Object.keys(data).forEach((jobName) => {
    if (isJob(jobName)) {
      const job = processJob(jobName, data, includePath);

      if (!job) {
        return;
      }

      jobs[jobName] = job;
    }
  });

  return { stages, jobs, hiddenJobs, include, noExistInclude };
}

async function processIncludes(
  data: PipelineData,
  baseDir: string,
  visited: Set<string> = new Set()
) {
  const includes = Array.isArray(data.include) ? data.include : [];
  let mergedData = { ...data };

  for (const includePath of includes) {
    const resolvedPath = path.resolve(baseDir, includePath);
    if (visited.has(resolvedPath)) {
      continue;
    }

    visited.add(resolvedPath);

    if (!fs.existsSync(resolvedPath)) {
      mergedData.noExistInclude.push(includePath);
      continue;
    }

    const fileContent = fs.readFileSync(resolvedPath, "utf8");
    const includedRaw = YAML.parse(fileContent);
    const includedData = processData(includedRaw, includePath);

    const includedMerged = await processIncludes(
      includedData,
      path.dirname(resolvedPath),
      visited
    );

    mergedData = {
      ...mergedData,
      ...includedMerged,
      jobs: {
        ...(includedMerged.jobs || {}),
        ...(mergedData.jobs || {}),
      },
      stages: Array.from(
        new Set([
          ...(mergedData.stages || []),
          ...(includedMerged.stages || []),
        ])
      ),
      hiddenJobs: Array.from(
        new Set([
          ...(mergedData.hiddenJobs || []),
          ...(includedMerged.hiddenJobs || []),
        ])
      ),
      include: Array.from(
        new Set([
          ...(mergedData.include || []),
          ...(includedMerged.include || []),
        ])
      ),
      noExistInclude: Array.from(
        new Set([
          ...(mergedData.noExistInclude || []),
          ...(includedMerged.noExistInclude || []),
        ])
      ),
    };
  }

  return mergedData;
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
  includePath: string,
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
    includePath,
  };

  if (job.extends) {
    resolveExtendsHierarchy(processed, data, includePath, resolvedJobs, stack);
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
  if (!rules) return [];

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
      const values = Array.isArray(rule.exists) ? rule.exists : [rule.exists];
      values.forEach((value: string) =>
        normalized.push({ type: "exists", value, when })
      );
    } else if (rule.changes) {
      const values = Array.isArray(rule.changes)
        ? rule.changes
        : [rule.changes];
      values.forEach((value: string) =>
        normalized.push({ type: "changes", value, when })
      );
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
  includePath: string,
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
    const parentJob = processJob(
      parent,
      data,
      includePath,
      resolvedJobs,
      stack
    );

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
  const parentRules = Array.isArray(parent.rules)
    ? parent.rules
    : normalizeRules(parent.rules);

  child.rules = [...parentRules, ...child.rules];
  child.needs = [...new Set([...parent.needs, ...child.needs])];
  child.noExistNeeds = [
    ...new Set([...parent.noExistNeeds, ...child.noExistNeeds]),
  ];
  child.noExistExtends = [
    ...new Set([...parent.noExistExtends, ...child.noExistExtends]),
  ];
}

export function deactivate() {}
