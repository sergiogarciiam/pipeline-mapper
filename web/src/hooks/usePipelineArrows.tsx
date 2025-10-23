import { useEffect, useState, useCallback } from 'react';
import type { PipelineData } from '../utils/types';

export function usePipelineArrows(
  pipelineData: PipelineData | undefined,
  jobRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>,
  isShowAllDependencies: boolean,
  selectedJobId: string | null,
  hoveredJobId: string | null,
) {
  const [arrows, setArrows] = useState<Array<{ start: DOMRect; end: DOMRect }>>([]);

  const calculateArrows = useCallback(() => {
    const newArrows: Array<{ start: DOMRect; end: DOMRect }> = [];
    const activeJobId = selectedJobId ?? hoveredJobId;

    const addArrow = (fromId: string, toId: string) => {
      const startElement = jobRefs.current[fromId];
      const endElement = jobRefs.current[toId];
      if (startElement && endElement) {
        newArrows.push({
          start: startElement.getBoundingClientRect(),
          end: endElement.getBoundingClientRect(),
        });
      }
    };

    if (!pipelineData) {
      return;
    }

    if (activeJobId && pipelineData.jobs[activeJobId]) {
      const job = pipelineData.jobs[activeJobId];
      job.needs?.forEach((needId) => {
        if (pipelineData.jobs[needId]) addArrow(needId, activeJobId);
      });

      Object.entries(pipelineData.jobs).forEach(([jobId, j]) => {
        if (j.needs?.includes(activeJobId)) addArrow(activeJobId, jobId);
      });
    } else if (isShowAllDependencies) {
      Object.entries(pipelineData.jobs).forEach(([jobId, job]) => {
        job.needs?.forEach((needId) => {
          if (pipelineData.jobs[needId]) addArrow(needId, jobId);
        });
      });
    }

    setArrows(newArrows);
  }, [pipelineData, jobRefs, isShowAllDependencies, selectedJobId, hoveredJobId]);

  useEffect(() => {
    calculateArrows();
    window.addEventListener('scroll', calculateArrows, true);
    return () => window.removeEventListener('scroll', calculateArrows, true);
  }, [calculateArrows]);

  return arrows;
}
