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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [isShowAllDependencies, setIsShowAllDependencies] = useState(false);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [newPipelineData] = usePipeline(pipelineData, selectedRules);

  const arrows = usePipelineArrows(
    pipelineData,
    jobRefs,
    isShowAllDependencies,
    selectedJobId,
    hoveredJobId
  );
  return (
    <div className="app">
      <div className="app__controls">
        <Rules
          selectedRules={selectedRules}
          setSelectedRules={setSelectedRules}
        ></Rules>
        <button
          className="app__show-dependencies-button"
          onClick={() => setIsShowAllDependencies(!isShowAllDependencies)}
        >
          Show Dependencies
        </button>
      </div>

      <ArrowsCanvas arrows={arrows} />

      <div className="app__stages">
        {newPipelineData.stages.length > 0 ? (
          newPipelineData.stages.map((stage: string) => (
            <StageColumn
              key={stage}
              stage={stage}
              pipelineData={newPipelineData}
              jobRefs={jobRefs}
              selectedJobId={selectedJobId}
              setSelectedJobId={setSelectedJobId}
              hoveredJobId={hoveredJobId}
              setHoveredJobId={setHoveredJobId}
            />
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer
        pipelineData={newPipelineData}
        selectedJobId={selectedJobId}
        hoveredJobId={hoveredJobId}
      ></Footer>
    </div>
  );
}

export default App;
