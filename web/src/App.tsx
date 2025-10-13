import { useRef, useState } from "react";
import { EXAMPLE } from "./utils/constants";
import StageColumn from "./components/stageColumn";
import { type PipelineData, type SelectedRule } from "./utils/types";
import { usePipelineArrows } from "./hooks/usePipelineArrows";
import ArrowsCanvas from "./components/arrowsCanvas";
import Footer from "./components/footer";
import Rules from "./components/rules";
import { usePipeline } from "./hooks/usePipeline";

function App() {
  const pipelineData =
    (window as { pipelineData?: PipelineData }).pipelineData || EXAMPLE;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [jobSelected, setJobSelected] = useState<string>("");
  const arrows = usePipelineArrows(pipelineData, jobRefs);
  const [isShowArrows, setIsShowArrows] = useState(false);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);

  const [newPipelineData] = usePipeline(pipelineData, selectedRules);

  return (
    <div className="app">
      <div className="app__controls">
        <button onClick={() => setIsShowArrows(!isShowArrows)}>
          Show Dependencies
        </button>
        <Rules
          selectedRules={selectedRules}
          setSelectedRules={setSelectedRules}
        ></Rules>
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
