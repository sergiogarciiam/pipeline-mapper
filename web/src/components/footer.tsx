import { useErrors } from "../hooks/useErrors";
import type { PipelineData } from "../utils/types";

interface FooterProps {
  pipelineData: PipelineData;
  jobSelected: string;
}

const Footer = ({ pipelineData, jobSelected }: FooterProps) => {
  const errors = useErrors(pipelineData, jobSelected);

  return (
    <div className="app__footer">
      <div className="app__footer-job-info">
        {jobSelected ? (
          <>
            <h2>{jobSelected}</h2>
            <p>
              <strong>Stage:</strong>{" "}
              {pipelineData.jobs[jobSelected]
                ? pipelineData.jobs[jobSelected].stage
                : "N/A"}
            </p>
            <p>
              <strong>Extends:</strong>{" "}
              {pipelineData.jobs[jobSelected] &&
              pipelineData.jobs[jobSelected].extends &&
              pipelineData.jobs[jobSelected].extends.length > 0
                ? pipelineData.jobs[jobSelected].extends?.join(", ")
                : "N/A"}
            </p>
            <p>
              <strong>Needs:</strong>{" "}
              {pipelineData.jobs[jobSelected] &&
              pipelineData.jobs[jobSelected].needs &&
              pipelineData.jobs[jobSelected].needs.length > 0
                ? pipelineData.jobs[jobSelected].needs?.join(", ")
                : "N/A"}
            </p>
            <div className="app__footer-rules">
              <strong>Rules:</strong>
              {pipelineData.jobs[jobSelected] &&
              pipelineData.jobs[jobSelected].rules &&
              pipelineData.jobs[jobSelected].rules.length > 0 ? (
                <ul>
                  {pipelineData.jobs[jobSelected].rules?.map((rule, index) => (
                    <li key={index}>
                      {rule.type} <code>{rule.value}</code>, then{" "}
                      <code>{rule.when}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                "N/A"
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
