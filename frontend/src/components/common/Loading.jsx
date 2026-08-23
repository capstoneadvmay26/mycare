function Loading({ message = "Loading..." }) {
  return (
    <div
      className="mycare-loading text-center py-5"
      role="status"
      aria-live="polite"
    >
      <div
        className="spinner-border text-primary mb-3"
        aria-hidden="true"
      />

      <p className="mycare-muted mb-0">
        {message}
      </p>
    </div>
  );
}

export default Loading;