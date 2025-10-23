import StageColumn from './components/stageColumn';
import ArrowsCanvas from './components/arrowsCanvas';
import Footer from './components/footer';
import { useRef, useState } from 'react';
import { type PipelineData, type SelectedRule } from './utils/types';
import { usePipelineArrows } from './hooks/usePipelineArrows';
import { usePipeline } from './hooks/usePipeline';
import { Header } from './components/header';

function App() {
  const pipelineData = (window as { pipelineData?: PipelineData }).pipelineData;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isShowAllDependencies, setIsShowAllDependencies] = useState(false);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [newPipelineData] = usePipeline(pipelineData, selectedRules);

  const arrows = usePipelineArrows(
    pipelineData,
    jobRefs,
    isShowAllDependencies,
    selectedJobId,
    hoveredJobId,
  );

  if (!newPipelineData) return;

  return (
    <div className="relative grid grid-rows-[1.5fr_7fr_1.5fr] gap-5 w-full h-screen">
      <Header
        isShowAllDependencies={isShowAllDependencies}
        setIsShowAllDependencies={setIsShowAllDependencies}
        selectedRules={selectedRules}
        setSelectedRules={setSelectedRules}
      ></Header>

      <div className="flex w-full gap-10 !pl-5 overflow-auto">
        <ArrowsCanvas arrows={arrows} />

        {newPipelineData.stages.length > 0 &&
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
          ))}
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
