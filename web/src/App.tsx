import {
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useRef, useState } from "react";
import { EXAMPLE } from "./utils/constants";
import { usePipelineRules } from "./hooks/usePipelineRules";
import { usePipelineArrows } from "./hooks/usePipelineArrows";
import ArrowsCanvas from "./components/arrowsCanvas";
import StageColumn from "./components/stageColumn";
import RulesControl from "./components/rulesControl";

function App() {
  const { pipelineData, applyRules } = usePipelineRules(
    (window as { pipelineData?: typeof EXAMPLE }).pipelineData || EXAMPLE
  );
  const stages = [...(pipelineData?.stages || []), ""];
  const extendables = Object.keys(pipelineData).filter((key) =>
    key.startsWith(".")
  );
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const arrows = usePipelineArrows(pipelineData, jobRefs);
  const [isShowArrows, setIsShowArrows] = useState(false);

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <RulesControl pipelineData={pipelineData} onRulesChange={applyRules} />

      <VSCodeButton onClick={() => setIsShowArrows(!isShowArrows)}>
        Show Dependencies
      </VSCodeButton>

      {isShowArrows && <ArrowsCanvas arrows={arrows} />}

      <div style={{ display: "flex", gap: "50px" }}>
        {stages.length > 0 ? (
          stages.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              pipelineData={pipelineData}
              jobRefs={jobRefs}
              extendables={extendables}
            />
          ))
        ) : (
          <VSCodeProgressRing />
        )}
      </div>
    </div>
  );
}

export default App;
