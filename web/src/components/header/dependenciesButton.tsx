interface DependenciesButtonProps {
  isShowAllDependencies: boolean;
  setIsShowAllDependencies: (value: boolean) => void;
}

const DependenciesButton = ({
  isShowAllDependencies,
  setIsShowAllDependencies,
}: DependenciesButtonProps) => {
  return (
    <label className="flex items-center gap-4 !p-1 rounded-sm cursor-pointer bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)]">
      <input
        className="vscode-checkbox"
        type="checkbox"
        checked={isShowAllDependencies}
        onChange={() => setIsShowAllDependencies(!isShowAllDependencies)}
      />
      Show Dependencies
    </label>
  );
};

export default DependenciesButton;
