import { forwardRef, type Dispatch, type SetStateAction } from "react";
import type { Job } from "../utils/types";

interface JobNodeProps {
  jobId: string;
  jobData: Job;
  jobSelected: string;
  setJobSelected: Dispatch<SetStateAction<string>>;
}

const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, jobData, jobSelected, setJobSelected }, ref) => {
    const hasExtendsUndefined =
      jobData.extendsUndefined && jobData.extendsUndefined.length > 0;
    const isWrongStage = jobData.stage === undefined || jobData.stage === "";

    return (
      <div
        ref={ref}
        className={`job-node ${jobSelected ? "job-node--active" : ""} ${
          jobSelected && jobSelected !== jobId ? "job-node--blur" : ""
        }`}
        onMouseEnter={() => setJobSelected(jobId)}
        onMouseLeave={() => setJobSelected("")}
      >
        <div className="job-node__content">
          {jobId}
          {(hasExtendsUndefined || isWrongStage) && <p>⚠️</p>}
        </div>
      </div>
    );
  }
);
export default JobNode;
