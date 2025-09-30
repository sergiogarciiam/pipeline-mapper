import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import type { PipelineData } from "../utils/types";

interface RulesControlProps {
  pipelineData: PipelineData;
  onRulesChange: (rules: { [key: string]: string }) => void;
}

const RulesControl = ({ pipelineData, onRulesChange }: RulesControlProps) => {
  const extractRuleVariables = () => {
    const variables = new Set<string>();

    Object.values(pipelineData).forEach((job) => {
      if (typeof job === "object" && job !== null && "rules" in job) {
        const rules = job.rules as Array<{ if?: string }>;
        rules.forEach((rule) => {
          if (rule.if) {
            const matches = rule.if.match(/\$([A-Z_]+)/g);
            if (matches) {
              matches.forEach((match) => variables.add(match.substring(1)));
            }
          }
        });
      }
    });

    return Object.fromEntries([...variables].map((v) => [v, ""]));
  };

  const [rules, setRules] = useState<{ [key: string]: string }>(
    extractRuleVariables()
  );

  const handleRuleChange = (key: string, value: string) => {
    const newRules = { ...rules, [key]: value };
    setRules(newRules);
    onRulesChange(newRules);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Pipeline Rules</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {Object.keys(rules).map((key) => (
          <VSCodeTextField
            key={key}
            placeholder={key}
            value={rules[key]}
            onChange={(e) =>
              handleRuleChange(key, (e.target as HTMLInputElement).value)
            }
          >
            {key}
          </VSCodeTextField>
        ))}
      </div>
    </div>
  );
};

export default RulesControl;
