type DescriptionBoxProps = {
    description: string;
  };
  
  export default function DescriptionBox({ description }: DescriptionBoxProps) {
    return (
      <div className="border p-4 rounded-md bg-gray-50">
        <p className="font-semibold">Description:</p>
        <p className="text-gray-700 mt-1">{description}</p>
      </div>
    );
  }
  