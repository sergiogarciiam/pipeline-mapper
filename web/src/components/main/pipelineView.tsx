import ArrowsCanvas from './arrowsCanvas';
import JobsColumn from './jobsColumn';
import type { PipelineData, ViewMode } from '../../utils/types';
import type { Dispatch } from 'react';
import { NO_STAGE_DEFINED_COLUMN, STAGES_VAR } from '../../utils/constants';

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
  const columns: (string | number)[] =
    viewMode === STAGES_VAR ? [...pipelineData.stages] : [...pipelineData.needsGroups];

  if (viewMode === STAGES_VAR) {
    const hasUndefinedStage = Object.keys(pipelineData.jobs).some(
      (job) => !pipelineData.jobs[job].stage,
    );

    if (hasUndefinedStage) {
      columns.push(NO_STAGE_DEFINED_COLUMN);
    }
  }
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
