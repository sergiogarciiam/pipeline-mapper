import { forwardRef, type Dispatch, type SetStateAction } from "react";
import type { Job } from "../utils/types";
import { DangerIcon } from "../utils/icons";

interface JobNodeProps {
  jobId: string;
  jobData: Job;
  jobSelected: string;
  setJobSelected: Dispatch<SetStateAction<string>>;
}

const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, jobData, jobSelected, setJobSelected }, ref) => {
    const hasNoExistExtends =
      jobData.noExistExtends && jobData.noExistExtends.length > 0;
    const hasNoExistNeeds =
      jobData.noExistNeeds && jobData.noExistNeeds.length > 0;
    const hasNeedsErros = jobData.needsErrors && jobData.needsErrors.length > 0;

    const isWrongStage = jobData.stage === undefined || jobData.stage === "";

    return (
      <div
        ref={ref}
        className={`job-node ${jobSelected ? "job-node--active" : ""} ${
          jobSelected && jobSelected !== jobId ? "job-node--blur" : ""
        } ${jobData.isDisabled === true ? "job-node--undefined" : ""}`}
        onMouseEnter={() => setJobSelected(jobId)}
        onMouseLeave={() => setJobSelected("")}
      >
        <div className="job-node__content">
          {jobId}
          {(hasNoExistNeeds ||
            hasNoExistExtends ||
            hasNeedsErros ||
            isWrongStage) && <DangerIcon></DangerIcon>}
        </div>
      </div>
    );
  }
);
export default JobNode;
