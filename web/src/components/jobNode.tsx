import { forwardRef, useState } from "react";
import Extends from "./extends";
import type { Job } from "../utils/types";

interface JobNodeProps {
  jobId: string;
  stage: string;
  jobData: Job;
  extendables: string[];
}

const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, stage, jobData, extendables }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasOneExtendsWrong = jobData.extends
      ? Array.isArray(jobData.extends)
        ? jobData.extends.some((ext) => !extendables.includes(ext))
        : !extendables.includes(jobData.extends)
      : false;

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: `1px solid ${
            stage === "" || hasOneExtendsWrong ? "red" : "#ccc"
          }`,
          borderRadius: "8px",
          padding: "10px",
          margin: "10px 0",
          boxShadow: isHovered ? "0 0 10px rgba(0,0,0,0.2)" : "none",
          transition: "box-shadow 0.3s ease",
          cursor: "pointer",
          opacity: jobData.disabled ? 0.5 : 1,
          background: jobData.disabled ? "#f0f0f0" : "white",
        }}
      >
        {jobId}
        {isHovered && jobData.extends && (
          <Extends jobData={jobData} extendables={extendables} />
        )}
      </div>
    );
  }
);
export default JobNode;
