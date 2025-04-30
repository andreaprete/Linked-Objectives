type MetaInfoProps = {
  created: string;
  modified: string;
};

export default function MetaInfo({ created, modified }: MetaInfoProps) {
  return (
    <div className="border p-4 rounded-md bg-gray-50 text-sm text-gray-700 w-full max-w-xl space-y-2">
      <div className="flex justify-between">
        <p className="font-semibold">Created:</p>
        <p>{created}</p>
      </div>
      <div className="flex justify-between">
        <p className="font-semibold">Modified:</p>
        <p>{modified}</p>
      </div>
    </div>
  );
}