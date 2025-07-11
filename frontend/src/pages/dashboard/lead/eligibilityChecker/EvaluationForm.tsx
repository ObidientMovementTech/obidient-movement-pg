import { useState } from 'react';
import { User, UserCheck, Briefcase, Award, Heart } from 'lucide-react';
import AssessorInfo from './stages/evaluation-stages/AssessorInfo';
import CandidateInfo from './stages/evaluation-stages/CandidateInfo';
import CapacitySection from './stages/evaluation-stages/CapacitySection';
import CompetenceSection from './stages/evaluation-stages/CompetenceSection';
import CharacterSection from './stages/evaluation-stages/CharacterSection';
import ResultPopup from './stages/evaluation-stages/ResultPopup';

interface EvaluationFormProps {
  closeModal: () => void;
}

interface EvaluationData {
  [key: string]: any;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ closeModal }) => {
  const [stage, setStage] = useState<number>(1);
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({});

  const totalStages = 5;
  const stages = [
    { label: 'Assessor Info', icon: <User size={16} /> },
    { label: 'Candidate Info', icon: <UserCheck size={16} /> },
    { label: 'Capacity', icon: <Briefcase size={16} /> },
    { label: 'Competence', icon: <Award size={16} /> },
    { label: 'Character', icon: <Heart size={16} /> },
  ];

  const handleNext = (data: EvaluationData) => {
    setEvaluationData({ ...evaluationData, ...data });
    setStage(stage + 1);
  };

  const getProgressColor = (index: number) => {
    if (stage > index + 1) return 'bg-[#006837] text-white'; // completed
    if (stage === index + 1) return 'bg-[#006837] text-white'; // current
    return 'bg-gray-200 text-gray-500'; // upcoming
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Responsive Stepper */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile: Horizontal scrollable stepper */}
        <div className="block sm:hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {stages.map((stageItem, index) => (
              <div key={index} className="flex flex-col items-center min-w-[60px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${getProgressColor(index)}`}
                >
                  {index + 1}
                </div>
                <p className={`mt-1 text-[10px] font-medium text-center leading-tight ${stage >= index + 1 ? 'text-[#006837]' : 'text-gray-500'}`}>
                  {stageItem.label.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
          <div className="relative mt-3 h-1.5 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-1.5 bg-[#006837] rounded-full transition-all duration-300"
              style={{ width: `${(stage / totalStages) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop: Full stepper */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center">
            {stages.map((stageItem, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-base font-medium transition-colors ${getProgressColor(index)}`}
                >
                  {index + 1}
                </div>
                <p className={`mt-2 text-xs lg:text-sm font-medium text-center ${stage >= index + 1 ? 'text-[#006837]' : 'text-gray-500'}`}>
                  {stageItem.label}
                </p>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-2 bg-[#006837] rounded-full transition-all duration-300"
              style={{ width: `${(stage / totalStages) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Mobile: Current stage indicator */}
        <div className="block sm:hidden mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            {stages[stage - 1]?.icon}
            <span className="text-sm font-medium text-gray-700">
              {stage <= 5 ? stages[stage - 1]?.label : 'Results'}
            </span>
            <span className="text-xs text-gray-500">
              ({stage}/{totalStages})
            </span>
          </div>
        </div>
      </div>

      {/* Stage Content */}
      <div className="bg-white">
        {stage === 1 && <AssessorInfo onNext={handleNext} />}
        {stage === 2 && <CandidateInfo onNext={handleNext} />}
        {stage === 3 && <CapacitySection onNext={handleNext} />}
        {stage === 4 && <CompetenceSection onNext={handleNext} />}
        {stage === 5 && <CharacterSection onNext={handleNext} />}
        {stage === 6 && (
          <ResultPopup
            evaluationData={evaluationData}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default EvaluationForm;