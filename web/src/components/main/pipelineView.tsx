import ArrowsCanvas from './arrowsCanvas';
import JobsColumn from './jobsColumn';
import type { PipelineData, ViewMode } from '../../utils/types';
import type { Dispatch } from 'react';
import { STAGES_VAR } from '../../utils/constants';

interface PipelineViewProps {
  pipelineData: PipelineData;
  jobRefs: React.RefObject<Record<string, HTMLDivElement>>;
  selectedJobId: string | null;
  setSelectedJobId: Dispatch<React.SetStateAction<string | null>>;
  hoveredJobId: string | null;
  setHoveredJobId: Dispatch<React.SetStateAction<string | null>>;
  arrows: Array<{ start: DOMRect; end: DOMRect }>;
  viewMode: ViewMode;
}

export function PipelineView({
  pipelineData,
  jobRefs,
  selectedJobId,
  setSelectedJobId,
  hoveredJobId,
  setHoveredJobId,
  arrows,
  viewMode,
}: PipelineViewProps) {
  const columns = viewMode === STAGES_VAR ? pipelineData.stages : pipelineData.needsGroups;

  return (
    <main className="flex w-full gap-10 !pl-5 overflow-auto">
      <ArrowsCanvas arrows={arrows} />
      {columns.map((column: string | number) => (
        <JobsColumn
          key={column}
          column={column}
          pipelineData={pipelineData}
          jobRefs={jobRefs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          hoveredJobId={hoveredJobId}
          setHoveredJobId={setHoveredJobId}
        />
      ))}
    </main>
  );
}
