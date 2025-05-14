import '@/app/styles/DescriptionBox.css';

export default function DescriptionBox({ description }) {
  return (
    <div className="description-box">
      <p className="description-label">Description:</p>
      <p className="description-text">{description}</p>
    </div>
  );
}
