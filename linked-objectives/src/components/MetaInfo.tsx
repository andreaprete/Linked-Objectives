type MetaInfoProps = {
  created: string;
  modified: string;
};

export default function MetaInfo({ created, modified }: MetaInfoProps) {
  return (
    <div className="flex flex-col justify-center items-center text-sm text-gray-500 space-y-4 h-full">
      <p><strong>Created:</strong> {created}</p>
      <p><strong>Modified:</strong> {modified}</p>
    </div>
  );
}