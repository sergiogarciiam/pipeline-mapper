import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Job, PipelineData } from "../utils/types";
import JobNode from "./jobNode";

interface StageColumnProps {
  stage: string;
  pipelineData: PipelineData;
  jobRefs: RefObject<{ [key: string]: HTMLDivElement }>;
  jobSelected: string;
  setJobSelected: Dispatch<SetStateAction<string>>;
}

const StageColumn = ({
  stage,
  pipelineData,
  jobRefs,
  jobSelected,
  setJobSelected,
}: StageColumnProps) => {
  if (stage === "undefined" || stage === "none") {
    return;
  }

  return (
    <div className="stage-column">
      <h2 className="stage-column__title">{stage}</h2>
      {Object.entries(pipelineData.jobs[stage] || {}).map(
        ([jobId, jobData]) => (
          <JobNode
            key={jobId}
            ref={(el) => {
              if (el) jobRefs.current[jobId] = el;
            }}
            jobId={jobId}
            jobData={jobData as Job}
            jobSelected={jobSelected}
            setJobSelected={setJobSelected}
          />
        )
      )}
    </div>
  );
};
export default StageColumn;
