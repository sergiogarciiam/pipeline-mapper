import {
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { EXAMPLE } from "./utils/constants";
import { useEffect, useRef, useState } from "react";
import type { Job, PipelineData } from "./utils/types";
import ArrowsCanvas from "./components/arrowsCanvas";
import StageColumn from "./components/stageColumn";

function App() {
  const pipelineData: PipelineData =
    (window as { pipelineData?: PipelineData }).pipelineData || EXAMPLE;
  const stages = [...(pipelineData?.stages || []), ""]; // Add empty stage for jobs without a defined stage
  const [arrows, setArrows] = useState<Array<{ start: DOMRect; end: DOMRect }>>(
    []
  );
  const [isShowArrows, setIsShowArrows] = useState(false);
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  useEffect(() => {
    const newArrows: Array<{ start: DOMRect; end: DOMRect }> = [];

    Object.entries(pipelineData).forEach(([jobId, jobData]) => {
      const job = jobData as Job;
      if (job?.needs && Array.isArray(job.needs)) {
        job.needs.forEach((needId: string) => {
          const startElement = jobRefs.current[needId];
          const endElement = jobRefs.current[jobId];

          if (startElement && endElement) {
            newArrows.push({
              start: startElement.getBoundingClientRect(),
              end: endElement.getBoundingClientRect(),
            });
          }
        });
      }
    });

    setArrows(newArrows);
  }, [pipelineData]);

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <VSCodeButton onClick={() => setIsShowArrows(!isShowArrows)}>
        Show Dependencies
      </VSCodeButton>

      {isShowArrows && <ArrowsCanvas arrows={arrows} />}

      <div style={{ display: "flex", gap: "50px" }}>
        {stages.length > 0 ? (
          stages.map((stage: string) => (
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
