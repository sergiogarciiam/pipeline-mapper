export function ErrorsList({ errors }: { errors: string[] }) {
  return (
    <div className="app__footer-errors">
      <h2>Errors {errors.length > 0 && `(${errors.length})`}</h2>
      {errors.length === 0 ? (
        <p>No errors!</p>
      ) : (
        errors.map((error, index) => <div key={index}>{error}</div>)
      )}
    </div>
  );
}

export default ErrorsList;
