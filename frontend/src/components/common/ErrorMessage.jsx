function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}) {
  return (
    <div
      className="alert alert-danger mycare-error-message"
      role="alert"
    >
      <div className="fw-semibold mb-1">
        Unable to continue
      </div>

      <p className="mb-2">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;