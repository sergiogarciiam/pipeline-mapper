import { useEffect, useState } from "react";
import type { PipelineData } from "../utils/types";

export function usePipelineArrows(
  pipelineData: PipelineData,
  jobRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement }>
) {
  const [arrows, setArrows] = useState<Array<{ start: DOMRect; end: DOMRect }>>(
    []
  );

  useEffect(() => {
    const newArrows: Array<{ start: DOMRect; end: DOMRect }> = [];

    Object.entries(pipelineData.jobs).forEach(([jobId, job]) => {
      job?.needs?.forEach((needId) => {
        const startElement = jobRefs.current[needId];
        const endElement = jobRefs.current[jobId];
        if (startElement && endElement) {
          newArrows.push({
            start: startElement.getBoundingClientRect(),
            end: endElement.getBoundingClientRect(),
          });
        }
      });
    });

    setArrows(newArrows);
  }, [pipelineData, jobRefs]);

  return arrows;
}
