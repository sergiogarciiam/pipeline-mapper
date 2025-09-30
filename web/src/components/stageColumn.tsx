import type { RefObject } from "react";
import type { Job, PipelineData } from "../utils/types";
import JobNode from "./jobNode";

interface StageColumnProps {
  stage: string;
  pipelineData: PipelineData;
  jobRefs: RefObject<{ [key: string]: HTMLDivElement }>;
  extendables: string[];
}

const StageColumn = ({
  stage,
  pipelineData,
  jobRefs,
  extendables,
}: StageColumnProps) => {
  const stages = pipelineData?.stages || [];
  const renderJobs = () => {
    return Object.entries(pipelineData)
      .filter(([key, jobData]) => {
        if (
          key.startsWith("variables") ||
          key.startsWith("stages") ||
          key.startsWith(".")
        ) {
          return false;
        }

        if (typeof jobData !== "object" || !jobData) {
          return false;
        }

        if (stage === "") {
          return !("stage" in jobData) || !stages.includes(jobData.stage || "");
        }

        return "stage" in jobData && jobData.stage === stage;
      })
      .map(([key]) => (
        <JobNode
          key={key}
          jobId={key}
          stage={stage}
          ref={(el) => {
            if (el) jobRefs.current[key] = el;
          }}
          jobData={pipelineData[key] as Job}
          extendables={extendables}
        />
      ));
  };

  return (
    <div
      style={{
        minWidth: "150px",
      }}
    >
      <h2 style={{ fontWeight: "bold" }}>{stage}</h2>
      <div>{renderJobs()}</div>
    </div>
  );
};

export default StageColumn;
