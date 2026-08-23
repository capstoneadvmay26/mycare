function Loading({ message = "Loading..." }) {

  return (
    <div className="dosewise-loading">

      <div
        className="spinner-border"
        role="status"
        aria-hidden="true"
      />

      <p className="dosewise-loading-message">
        {message}
      </p>

    </div>
  );
}

export default Loading;