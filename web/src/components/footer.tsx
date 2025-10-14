import { useErrors } from "../hooks/useErrors";
import type { PipelineData } from "../utils/types";

interface FooterProps {
  pipelineData: PipelineData;
  selectedJobId: string | null;
  hoveredJobId: string | null;
}

const Footer = ({ pipelineData, selectedJobId, hoveredJobId }: FooterProps) => {
  const activeJobId = selectedJobId ?? hoveredJobId;
  const errors = useErrors(pipelineData, activeJobId);

  return (
    <div className="app__footer">
      <div className="app__footer-job-info">
        {activeJobId ? (
          <>
            <h2>{activeJobId}</h2>
            <p>
              <strong>Stage:</strong>{" "}
              {pipelineData.jobs[activeJobId]
                ? pipelineData.jobs[activeJobId].stage
                : "N/A"}
            </p>
            <p>
              <strong>Extends:</strong>{" "}
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].extends &&
              pipelineData.jobs[activeJobId].extends.length > 0
                ? pipelineData.jobs[activeJobId].extends?.join(", ")
                : "N/A"}
            </p>
            <p>
              <strong>Needs:</strong>{" "}
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].needs &&
              pipelineData.jobs[activeJobId].needs.length > 0
                ? pipelineData.jobs[activeJobId].needs?.join(", ")
                : "N/A"}
            </p>
            <div className="app__footer-rules">
              <strong>Rules:</strong>
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].rules &&
              pipelineData.jobs[activeJobId].rules.length > 0 ? (
                <ul>
                  {pipelineData.jobs[activeJobId].rules?.map((rule, index) => (
                    <li key={index}>
                      {rule.type} <code>{rule.value}</code>, then{" "}
                      <code>{rule.when}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                " N/A"
              )}
            </div>
          </>
        ) : (
          <h2>No job selected</h2>
        )}
      </div>
      <div className="app__footer-errors">
        <h2>Errors</h2>
        {errors.length === 0 ? (
          <p>No errors!</p>
        ) : (
          errors.map((error, index) => <div key={index}>{error}</div>)
        )}
      </div>
    </div>
  );
};

export default Footer;
