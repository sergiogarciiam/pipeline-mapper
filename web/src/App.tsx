import {
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useRef, useState } from "react";
import { EXAMPLE } from "./utils/constants";
import StageColumn from "./components/stageColumn";
import type { PipelineData } from "./utils/types";
import { usePipelineArrows } from "./hooks/usePipelineArrows";
import ArrowsCanvas from "./components/arrowsCanvas";

function App() {
  const pipelineData =
    (window as { pipelineData?: PipelineData }).pipelineData || EXAMPLE;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const arrows = usePipelineArrows(pipelineData, jobRefs);
  const [isShowArrows, setIsShowArrows] = useState(false);

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <VSCodeButton onClick={() => setIsShowArrows(!isShowArrows)}>
        Show Dependencies
      </VSCodeButton>
      {isShowArrows && <ArrowsCanvas arrows={arrows} />}

      <div style={{ display: "flex", gap: "50px" }}>
        {pipelineData.stages.length > 0 ? (
          Object.keys(pipelineData.jobs).map((stage: string) => (
            <StageColumn
              key={stage}
              stage={stage}
              pipelineData={pipelineData}
              jobRefs={jobRefs}
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
