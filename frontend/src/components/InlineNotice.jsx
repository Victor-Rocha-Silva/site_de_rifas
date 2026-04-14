export default function InlineNotice({ type = "info", title, children }) {
    return (
      <div className={`inline-notice ${type}`}>
        {title && <strong>{title}</strong>}
        <span>{children}</span>
      </div>
    );
  }