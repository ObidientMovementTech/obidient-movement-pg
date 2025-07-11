import { useState } from 'react';


const CustomCheckbox = ({ onClick }: { onClick: (checked: boolean) => void }) => {
  const [checked, setChecked] = useState(false);

  const toggleCheckbox = () => {
    setChecked(!checked);
    onClick(!checked)
  };

  return (
    <div onClick={toggleCheckbox} className="flex items-center cursor-pointer mt-8">
      <div
        className={`w-4 h-4 rounded-sm border-2 border-gray-600 ${
          checked ? 'bg-black text-white border-gray-600 dark:text-green-700' : 'bg-back border-gray-300'
        } flex items-center justify-center transition-all`}
      >
        {checked && (
          <svg
            className="w-4 h-4 dark:text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <label className="ml-2 text-gray-800 dark:text-gray-200">
        I agree to receive updates
      </label>
    </div>
  );
};

export default CustomCheckbox;
