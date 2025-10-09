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
          <div>
            <strong>Job Name:</strong> {jobSelected}
            <br />
            <strong>Stage:</strong>{" "}
            {pipelineData.jobs[jobSelected]
              ? pipelineData.jobs[jobSelected].stage
              : "N/A"}
            <br />
            <strong>Extends:</strong>{" "}
            {pipelineData.jobs[jobSelected] &&
            pipelineData.jobs[jobSelected].extends &&
            pipelineData.jobs[jobSelected].extends.length > 0
              ? pipelineData.jobs[jobSelected].extends?.join(", ")
              : "N/A"}
            <br />
            <strong>Needs:</strong>{" "}
            {pipelineData.jobs[jobSelected] &&
            pipelineData.jobs[jobSelected].needs &&
            pipelineData.jobs[jobSelected].needs.length > 0
              ? pipelineData.jobs[jobSelected].needs?.join(", ")
              : "N/A"}
            <br />
            <strong>Rules:</strong>
            <br />
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
        ) : (
          <div>No job selected</div>
        )}
      </div>
      <div className="app__footer-errors">
        <p>Errors</p>
        {errors.length === 0 ? (
          <div>No errors</div>
        ) : (
          errors.map((error, index) => <div key={index}>{error}</div>)
        )}
      </div>
    </div>
  );
};

export default Footer;
