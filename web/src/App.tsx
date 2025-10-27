import { Header } from './components/header/header';
import { useRef, useState } from 'react';
import { type PipelineData, type SelectedRule, type ViewMode } from './utils/types';
import { usePipelineArrows } from './hooks/usePipelineArrows';
import { usePipeline } from './hooks/usePipeline';
import { NEEDS_VAR } from './utils/constants';
import Footer from './components/footer/footer';
import { PipelineView } from './components/main/pipelineView';

function App() {
  const pipelineData = (window as { pipelineData?: PipelineData }).pipelineData;
  const jobRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isShowAllDependencies, setIsShowAllDependencies] = useState(false);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(NEEDS_VAR);

  const [newPipelineData] = usePipeline(pipelineData, selectedRules);

  const arrows = usePipelineArrows(
    pipelineData,
    jobRefs,
    isShowAllDependencies,
    selectedJobId,
    hoveredJobId,
    viewMode,
  );

  if (!newPipelineData) return null;

  return (
    <div className="relative grid grid-rows-[1.5fr_7fr_1.5fr] gap-5 w-full h-screen">
      <Header
        isShowAllDependencies={isShowAllDependencies}
        setIsShowAllDependencies={setIsShowAllDependencies}
        selectedRules={selectedRules}
        setSelectedRules={setSelectedRules}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <PipelineView
        pipelineData={newPipelineData}
        jobRefs={jobRefs}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        hoveredJobId={hoveredJobId}
        setHoveredJobId={setHoveredJobId}
        arrows={arrows}
        viewMode={viewMode}
      />

      <Footer
        pipelineData={newPipelineData}
        selectedJobId={selectedJobId}
        hoveredJobId={hoveredJobId}
      />
    </div>
  );
}

export default App;
