import { useErrors } from '../hooks/useErrors';
import type { PipelineData } from '../utils/types';
import ErrorsList from './errorList';
import JobInfo from './jobInfo';

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
      <JobInfo activeJobId={activeJobId} pipelineData={pipelineData}></JobInfo>
      <ErrorsList errors={errors} />
    </div>
  );
};

export default Footer;
