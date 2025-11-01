import type { Dispatch, SetStateAction } from 'react';
import { NEEDS_VAR, STAGES_VAR } from '../../utils/constants';
import type { ViewMode } from '../../utils/types';

interface ViewModeTabProps {
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

const ViewModeTab = ({ viewMode, setViewMode }: ViewModeTabProps) => {
  return (
    <div>
      <button
        className={`${viewMode === STAGES_VAR && 'opacity-60'} !rounded-br-none !rounded-tr-none`}
        onClick={() => setViewMode(STAGES_VAR)}
      >
        Show by stages
      </button>
      <button
        className={`${viewMode === NEEDS_VAR && 'opacity-60'}  !rounded-bl-none !rounded-tl-none`}
        onClick={() => setViewMode(NEEDS_VAR)}
      >
        Show by needs
      </button>
    </div>
  );
};

export default ViewModeTab;
