"use client";

import { useState } from "react";
import GoalCard from "./GoalCard";

export default function OkrList({ username, okrs }) {
  const [caresForOpen, setCaresForOpen] = useState(true);
  const [operatesOpen, setOperatesOpen] = useState(false);
  const [accountableForOpen, setAccountableForOpen] = useState(false);

  const caresForOkrs = okrs.filter((okr) => okr.responsibility === "caresFor");
  const operatesOkrs = okrs.filter((okr) => okr.responsibility === "operates");
  const accountableOkrs = okrs.filter(
    (okr) => okr.responsibility === "isAccountableFor"
  );

  const hasAnyOkrs =
    caresForOkrs.length > 0 ||
    operatesOkrs.length > 0 ||
    accountableOkrs.length > 0;

  const renderSection = (title, open, setOpen, okrList) => {
    if (okrList.length === 0) return null;

    return (
      <div>
        <button
          className="flex items-center mb-2 w-full text-left"
          onClick={() => setOpen(!open)}
        >
          <div className="text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transform transition-transform ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="ml-2 text-lg text-gray-600">{title}</div>
        </button>

        {open && (
          <div className="space-y-4">
            {okrList.map((okr) => (
              <GoalCard
                key={okr.id}
                id={okr.id}
                title={okr.title}
                description={okr.description}
                progress={okr.progress}
                state={okr.state}
                category={okr.category}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!hasAnyOkrs) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{username}'s OKRs:</h2>

      <div className="space-y-6">
        {renderSection(
          "Cares for",
          caresForOpen,
          setCaresForOpen,
          caresForOkrs
        )}
        {renderSection("Operates", operatesOpen, setOperatesOpen, operatesOkrs)}
        {renderSection(
          "Accountable for",
          accountableForOpen,
          setAccountableForOpen,
          accountableOkrs
        )}
      </div>
    </div>
  );
}
