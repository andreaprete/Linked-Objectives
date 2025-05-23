import { useState } from "react";
import "@/app/styles/PeopleInvolvedComponent.css";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}


export default function PeopleInvolved({ label, people }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!people || (Array.isArray(people) && people.length === 0)) return null;

  const peopleArray = Array.isArray(people) ? people : [people];

  return (
    <div className="people-section">
      <button className="people-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "▲" : "▼"} {label}
      </button>

      {isOpen && (
        <div className="people-list">
          {peopleArray.map((person, i) => (
            <div className="people-card" key={i}>
              {person.image ? (
                <img
                  src={person.image}
                  alt={person.name}
                  className="people-avatar"
                />
              ) : (
                <div className="people-initials">
                  {getInitials(person.name)}
                </div>
              )}

              <div>
                <a href={`/people/${person.id}`} className="people-link">
                  {person.name}
                </a>
                <p className="people-role">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
