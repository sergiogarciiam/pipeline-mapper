import { forwardRef } from "react";

interface JobNodeProps {
  jobId: string;
  stage: string;
}

const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, stage }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          border: `1px solid ${stage === "" ? "red" : "#ccc"}`,
          borderRadius: "8px",
          padding: "10px",
          margin: "10px 0",
        }}
      >
        {jobId}
      </div>
    );
  }
);

export default JobNode;
