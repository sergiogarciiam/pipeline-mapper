import type { Dispatch, SetStateAction } from 'react';
import type { SelectedRule, ViewMode } from '../../utils/types';
import Rules from './rules';
import DependenciesButton from './dependenciesButton';
import ViewModeTab from './viewModeTab';

interface HeaderProps {
  isShowAllDependencies: boolean;
  setIsShowAllDependencies: Dispatch<SetStateAction<boolean>>;
  selectedRules: SelectedRule[];
  setSelectedRules: Dispatch<SetStateAction<SelectedRule[]>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

export const Header = ({
  isShowAllDependencies,
  setIsShowAllDependencies,
  selectedRules,
  setSelectedRules,
  viewMode,
  setViewMode,
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between bg-[var(--mixed-bg-darker)] !p-4">
      <div className="flex flex-col self-start gap-4">
        <ViewModeTab viewMode={viewMode} setViewMode={setViewMode}></ViewModeTab>
        <DependenciesButton
          isShowAllDependencies={isShowAllDependencies}
          setIsShowAllDependencies={setIsShowAllDependencies}
        ></DependenciesButton>
      </div>

      <Rules selectedRules={selectedRules} setSelectedRules={setSelectedRules}></Rules>
    </header>
  );
};
