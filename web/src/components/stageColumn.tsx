import type { RefObject } from "react";
import type { Job, PipelineData } from "../utils/types";
import JobNode from "./jobNode";

interface StageColumnProps {
  stage: string;
  pipelineData: PipelineData;
  jobRefs: RefObject<{ [key: string]: HTMLDivElement }>;
}

const StageColumn = ({ stage, pipelineData, jobRefs }: StageColumnProps) => {
  return (
    <div
      style={{
        minWidth: "150px",
      }}
    >
      <h2 style={{ fontWeight: "bold" }}>{stage}</h2>
      {Object.entries(pipelineData.jobs[stage] || {}).map(
        ([jobId, jobData]) => (
          <JobNode
            key={jobId}
            ref={(el) => {
              if (el) jobRefs.current[jobId] = el;
            }}
            jobId={jobId}
            jobData={jobData as Job}
          />
        )
      )}
    </div>
  );
};

export default StageColumn;
