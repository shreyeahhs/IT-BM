function Alert({ type, message, onClose }) {
  return (
    <div className={`alert ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>✖</button>
    </div>
  );
}

export default Alert;