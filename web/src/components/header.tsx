import type { Dispatch, SetStateAction } from 'react';
import type { SelectedRule } from '../utils/types';
import Rules from './rules';

interface HeaderProps {
  isShowAllDependencies: boolean;
  setIsShowAllDependencies: Dispatch<SetStateAction<boolean>>;
  selectedRules: SelectedRule[];
  setSelectedRules: Dispatch<SetStateAction<SelectedRule[]>>;
}

export const Header = ({
  isShowAllDependencies,
  setIsShowAllDependencies,
  selectedRules,
  setSelectedRules,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-[var(--mixed-bg-darker)] !p-4">
      <button
        className="self-start"
        onClick={() => setIsShowAllDependencies(!isShowAllDependencies)}
      >
        {isShowAllDependencies ? 'Hide' : 'Show'} Dependencies
      </button>
      <Rules selectedRules={selectedRules} setSelectedRules={setSelectedRules}></Rules>
    </div>
  );
};
