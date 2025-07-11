import { CheckIcon } from "@heroicons/react/24/outline";

type ProgressProps = {
  currentNumber: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
};

export default function Progressbar({
  currentNumber,
  totalSteps = 3,
  onStepClick,
  completedSteps = []
}: ProgressProps) {
  const checkpoints = Array.from({ length: totalSteps }, (_, i) => i + 1);

  // Function to handle step click only if the step is completed or current
  const handleStepClick = (step: number) => {
    // Only allow going to previous or current steps
    if (onStepClick && (step <= currentNumber || completedSteps.includes(step))) {
      onStepClick(step);
    }
  };

  return (
    <div className="flex justify-start items-center mb-6 w-full gap-3 md:gap-8 text-sm">
      {checkpoints.map((checkpoint, index) => {
        // Determine if this step is completed, current, or upcoming
        const isCompleted = checkpoint < currentNumber || completedSteps.includes(checkpoint);
        const isCurrent = checkpoint === currentNumber;
        const isClickable = isCompleted || isCurrent;

        // Add connecting line between steps (except last step)
        const hasConnector = index < checkpoints.length - 1;

        return (
          <div key={checkpoint} className="flex items-center">
            <div
              onClick={() => handleStepClick(checkpoint)}
              className={`
                w-8 h-8 rounded-full grid place-content-center text-sm
                ${isCompleted ? 'bg-accent-green text-white' : ''}
                ${isCurrent ? 'bg-accent-green text-white' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-200' : ''}
                ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-accent-green transition-all' : ''}
                ${isClickable ? 'after:content-[""] after:absolute after:-inset-2 after:z-[-1]' : ''}
                relative
              `}
              role={isClickable ? "button" : "presentation"}
              aria-label={isClickable ? `Go to step ${checkpoint}` : undefined}
              title={isClickable ? `Go to step ${checkpoint}` : undefined}
            >
              {isCompleted ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                checkpoint
              )}

              <span className={`absolute -bottom-5 whitespace-nowrap text-xs 
                ${isCurrent ? 'font-medium' : 'text-gray-500'}
                ${isClickable ? 'hover:text-accent-green hover:underline' : ''}
              `}>
                {checkpoint === 1 ? 'Personal Info' :
                  checkpoint === 2 ? 'Valid ID' : 'Selfie'}
              </span>
            </div>

            {/* Connector line between circles */}
            {hasConnector && (
              <div className={`h-[2px] w-8 md:w-16 mx-1 ${checkpoint < currentNumber ? 'bg-accent-green' : 'bg-gray-200'
                }`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
