function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  message = "There is no information to display.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="mycare-empty-state text-center py-5">
      <div
        className="display-4 mb-3"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h2 className="h4 mb-2">
        {title}
      </h2>

      <p className="mycare-muted mb-4">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;