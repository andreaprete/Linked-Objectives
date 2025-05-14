import '@/app/styles/MetaInfo.css';

export default function MetaInfo({ created, modified }) {
  // Function to format the date to a readable format (without time)
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="meta-info">
      <div className="meta-info-row">
        <p className="meta-info-label">Created:</p>
        <p>{formatDate(created)}</p>
      </div>
      <div className="meta-info-row">
        <p className="meta-info-label">Modified:</p>
        <p>{formatDate(modified)}</p>
      </div>
    </div>
  );
}
