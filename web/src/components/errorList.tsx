export function ErrorsList({ errors }: { errors: string[] }) {
  return (
    <div className="flex flex-col gap-2 h-full w-full overflow-y-auto !pl-2 transition duration-200transition duration-200">
      <h2>Errors {errors.length > 0 && `(${errors.length})`}</h2>
      {errors.length === 0 ? (
        <p>No errors found</p>
      ) : (
        errors.map((error, index) => (
          <div
            className="border rounded-sm !p-2 border-[var(--vscode-inputValidation-errorBorder,var(--vscode-errorForeground))] bg-[var(--mixed-bg-lighter)]"
            key={index}
          >
            {error}
          </div>
        ))
      )}
    </div>
  );
}

export default ErrorsList;
