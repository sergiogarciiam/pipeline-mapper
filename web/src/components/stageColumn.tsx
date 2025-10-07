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
  const jobs = pipelineData.jobs || {};

  return (
    <div className="stage-column">
      <h2 className="stage-column__title">{stage}</h2>
      {Object.keys(jobs).map((jobName) => {
        if (jobs[jobName].stage !== stage) {
          return null;
        }
        return (
          <JobNode
            key={jobName}
            ref={(el) => {
              if (el) jobRefs.current[jobName] = el;
            }}
            jobId={jobName}
            jobData={jobs[jobName] as Job}
            jobSelected={jobSelected}
            setJobSelected={setJobSelected}
          />
        );
      })}
    </div>
  );
};
export default StageColumn;
