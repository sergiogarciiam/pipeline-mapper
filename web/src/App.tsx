import { useRef, useState } from "react";
import { EXAMPLE } from "./utils/constants";
import StageColumn from "./components/stageColumn";
import type { PipelineData } from "./utils/types";
import { usePipelineArrows } from "./hooks/usePipelineArrows";
import ArrowsCanvas from "./components/arrowsCanvas";
import Footer from "./components/footer";
import Rules from "./components/rules";
import { DEFAULT_RULE } from "./utils/variables";
import { usePipeline } from "./hooks/usePipeline";

function App() {
  const pipelineData =
    (window as { pipelineData?: PipelineData }).pipelineData || EXAMPLE;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [jobSelected, setJobSelected] = useState<string>("");
  const arrows = usePipelineArrows(pipelineData, jobRefs);
  const [isShowArrows, setIsShowArrows] = useState(false);
  const [selectedRule, setSelectedRule] = useState(DEFAULT_RULE);

  const [newPipelineData] = usePipeline(pipelineData, selectedRule);

  return (
    <div className="app">
      <div className="app__controls">
        <Rules
          selectedRule={selectedRule}
          setSelectedRule={setSelectedRule}
        ></Rules>
        <button onClick={() => setIsShowArrows(!isShowArrows)}>
          Show Dependencies
        </button>
      </div>

      {isShowArrows && <ArrowsCanvas arrows={arrows} />}

      <div className="app__stages">
        {newPipelineData.stages.length > 0 ? (
          newPipelineData.stages.map((stage: string) => (
            <StageColumn
              key={stage}
              stage={stage}
              pipelineData={newPipelineData}
              jobRefs={jobRefs}
              jobSelected={jobSelected}
              setJobSelected={setJobSelected}
            />
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer pipelineData={newPipelineData} jobSelected={jobSelected}></Footer>
    </div>
  );
}

export default App;
