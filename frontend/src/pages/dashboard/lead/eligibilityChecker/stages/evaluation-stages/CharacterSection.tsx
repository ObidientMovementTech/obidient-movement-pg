import { useState } from "react";
import evaluationQuestions from "../../../../../../lib/evaluationQuestions.js";
import type { EvaluationCategory } from "../../../../../../types/evaluationQuestions.js";

interface CharacterSectionProps {
  onNext: (data: { characterScore: number }) => void;
}

const CharacterSection: React.FC<CharacterSectionProps> = ({ onNext }) => {
  const { title, sections }: EvaluationCategory = evaluationQuestions.character;

  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScores({ ...scores, [e.target.name]: parseInt(e.target.value) });
  };

  const calculateScore = () => {
    return sections.reduce((total, section) => {
      const subgroupScore = section.questions.reduce((subTotal, q) => {
        const selectedValue = scores[q.text] || 0;
        return subTotal + (selectedValue / 10) * (section.weight / section.questions.length);
      }, 0);
      return total + subgroupScore;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allAnswered = sections.every((section) =>
      section.questions.every((q) => scores[q.text] !== undefined)
    );

    if (!allAnswered) {
      setError("⚠️ Please answer all questions before proceeding.");
      return;
    }

    setError("");
    const totalCharacterScore = parseFloat(calculateScore().toFixed(2));
    onNext({ characterScore: totalCharacterScore });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#006837] mb-2 sm:mb-0">
          {title}
        </h2>
        <div className="bg-[#006837]/10 text-[#006837] text-sm font-medium px-3 py-1.5 rounded-full">
          40% of Total Score
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
        <p>Evaluate the candidate's moral values, integrity, and ethical standards.</p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-100 p-4 mb-6">
        {sections.map((section) => (
          <div key={section.subgroup} className="mb-8 last:mb-0">
            <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
              {section.subgroup} <span className="text-sm font-normal text-gray-500">(Weight: {section.weight}%)</span>
            </h3>
            {section.questions.map((q, index) => (
              <div key={q.text} className="mb-6 last:mb-0 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <label className="block text-gray-700 font-medium mb-2">
                  <span className="text-sm font-normal text-gray-500 mr-2">{index + 1}.</span>
                  {q.text}
                </label>
                <select
                  name={q.text}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm transition-colors ${error && scores[q.text] === undefined ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  value={scores[q.text] !== undefined ? scores[q.text] : ""}
                  required
                  aria-label={q.text}
                >
                  <option value="">Select an answer</option>
                  {q.options.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>

      {error &&
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6">
          <p className="text-sm font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      }

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] transition-colors duration-200 font-medium min-w-[140px] flex items-center justify-center"
        >
          <span>See Results</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default CharacterSection;
