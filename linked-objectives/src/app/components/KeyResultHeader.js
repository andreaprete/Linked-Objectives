import '@/app/styles/KeyResultHeader.css';

export default function KeyResultHeader({ title, comment, setModalOpen, canEdit }) {
  const getInitials = (title) => {
    const words = title.split(' ');
    const firstTwoWords = words.slice(0, 2);
    const initials = firstTwoWords
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    return initials;
  };

  const initials = getInitials(title);

  return (
    <div className="keyresult-header">
      <div className="header-left">
        <div className="header-initials">{initials}</div>
        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-comment">{comment}</p>
        </div>
      </div>
      {canEdit && (
        <button
          onClick={() => setModalOpen(true)}
          className="edit-button"
        >
          Edit
        </button>
      )}
    </div>
  );
}
