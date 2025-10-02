import { forwardRef, useState } from "react";
import Extends from "./extends";
import type { Job } from "../utils/types";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface JobNodeProps {
  jobId: string;
  jobData: Job;
}

const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, jobData }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasExtendsUndefined =
      jobData.extendsUndefined && jobData.extendsUndefined.length > 0;
    const isWrongStage = jobData.stage === undefined || jobData.stage === "";

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: `1px solid ${
            hasExtendsUndefined || isWrongStage ? "red" : "#ccc"
          }`,
          borderRadius: "8px",
          padding: "10px",
          margin: "10px 0",
          boxShadow: isHovered ? "0 0 10px rgba(0,0,0,0.2)" : "none",
          transition: "box-shadow 0.3s ease",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {jobId}
          {(hasExtendsUndefined || isWrongStage) && (
            <VSCodeButton>⚠️</VSCodeButton>
          )}
        </div>
        {isHovered && jobData.extends && <Extends jobData={jobData} />}
      </div>
    );
  }
);
export default JobNode;
