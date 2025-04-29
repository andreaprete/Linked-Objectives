type KeyResultHeaderProps = {
    title: string;
    comment: string;
  };
  
  export default function KeyResultHeader({ title, comment }: KeyResultHeaderProps) {
    // Function to get the first two letters of the first two words from the title
    const getInitials = (title: string) => {
      const words = title.split(' '); // Split title into words
      const firstTwoWords = words.slice(0, 2); // Take the first two words
      const initials = firstTwoWords
        .map(word => word.charAt(0).toUpperCase()) // Get the first letter of each word
        .join(''); // Join the letters together
      return initials;
    };
  
    const initials = getInitials(title);
  
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Dynamic initials in the circle */}
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-gray-600 italic">{comment}</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit</button>
      </div>
    );
  }