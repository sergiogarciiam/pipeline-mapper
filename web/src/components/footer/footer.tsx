import type { Dispatch, SetStateAction } from 'react';
import { useErrors } from '../../hooks/useErrors';
import type { PipelineData, SelectedRule } from '../../utils/types';
import ErrorsList from './errorList';
import JobInfo from './jobInfo';

interface FooterProps {
  pipelineData: PipelineData;
  selectedJobId: string | null;
  hoveredJobId: string | null;
  setSelectedRules: Dispatch<SetStateAction<SelectedRule[]>>;
}

const Footer = ({ pipelineData, selectedJobId, hoveredJobId, setSelectedRules }: FooterProps) => {
  const activeJobId = selectedJobId ?? hoveredJobId;
  const errors = useErrors(pipelineData, activeJobId);

  return (
    <footer className="grid grid-cols-[5fr_5fr] transition duration-200  min-h-[220px] max-h-[220px] overflow-hidder bg-[var(--mixed-bg-darker)] !p-4">
      <JobInfo
        activeJobId={activeJobId}
        pipelineData={pipelineData}
        setSelectedRules={setSelectedRules}
      ></JobInfo>
      <ErrorsList errors={errors} />
    </footer>
  );
};

export default Footer;
