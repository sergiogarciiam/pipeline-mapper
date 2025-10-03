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
import { useErrors } from "./hooks/useErrors";

function App() {
  const pipelineData =
    (window as { pipelineData?: PipelineData }).pipelineData || EXAMPLE;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [jobSelected, setJobSelected] = useState<string>("");
  const arrows = usePipelineArrows(pipelineData, jobRefs);
  const [isShowArrows, setIsShowArrows] = useState(false);
  const errors = useErrors(pipelineData, jobSelected);

  return (
    <div className="app">
      <div className="app__controls">
        <VSCodeButton onClick={() => setIsShowArrows(!isShowArrows)}>
          Show Dependencies
        </VSCodeButton>
      </div>

      {isShowArrows && <ArrowsCanvas arrows={arrows} />}

      <div className="app__stages">
        {pipelineData.stages.length > 0 ? (
          Object.keys(pipelineData.jobs).map((stage: string) => (
            <StageColumn
              key={stage}
              stage={stage}
              pipelineData={pipelineData}
              jobRefs={jobRefs}
              jobSelected={jobSelected}
              setJobSelected={setJobSelected}
            />
          ))
        ) : (
          <VSCodeProgressRing />
        )}
      </div>

      <div className="app__footer">
        <div className="app__footer-job-info">
          {jobSelected ? (
            <div>
              <strong>Job Name:</strong> {jobSelected}
            </div>
          ) : (
            <div>No job selected</div>
          )}
        </div>
        <div className="app__footer-errors">
          <p>Errors</p>
          {errors.length === 0 ? (
            <div>No errors</div>
          ) : (
            errors.map((error, index) => <div key={index}>{error}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
