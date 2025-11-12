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
  setSelectedJobId: Dispatch<SetStateAction<string | null>>;
}

export const Header = ({
  isShowAllDependencies,
  setIsShowAllDependencies,
  selectedRules,
  setSelectedRules,
  viewMode,
  setViewMode,
  setSelectedJobId,
}: HeaderProps) => {
  return (
    <header className="grid grid-cols-[auto_1fr] bg-[var(--mixed-bg-darker)] !p-4 gap-10 z-1">
      <div className="flex flex-col self-start gap-4 w-fit">
        <ViewModeTab viewMode={viewMode} setViewMode={setViewMode}></ViewModeTab>
        <DependenciesButton
          isShowAllDependencies={isShowAllDependencies}
          setIsShowAllDependencies={setIsShowAllDependencies}
        ></DependenciesButton>
      </div>

      <Rules
        selectedRules={selectedRules}
        setSelectedRules={setSelectedRules}
        setSelectedJobId={setSelectedJobId}
      />
    </header>
  );
};
