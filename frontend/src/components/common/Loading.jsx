function Loading({ message = "Loading..." }) {

  return (
    <div className="mycare-loading">

      <div
        className="spinner-border"
        role="status"
        aria-hidden="true"
      />

      <p className="mycare-loading-message">
        {message}
      </p>

    </div>
  );
}

export default Loading;