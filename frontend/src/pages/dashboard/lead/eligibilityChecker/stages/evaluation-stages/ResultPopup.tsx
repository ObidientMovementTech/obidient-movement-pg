import { useEffect, useRef } from "react";
import axios from "axios";
import domtoimage from "dom-to-image";
import { BarChart3 } from "lucide-react";

interface ResultPopupProps {
  evaluationData: Record<string, any>;
  closeModal: () => void;
}

const ResultPopup: React.FC<ResultPopupProps> = ({ evaluationData, closeModal }) => {
  const resultRef = useRef<HTMLDivElement | null>(null);

  const capacityPercent = ((evaluationData.capacityScore / 30) * 100).toFixed(1);
  const competencePercent = ((evaluationData.competenceScore / 30) * 100).toFixed(1);
  const characterPercent = ((evaluationData.characterScore / 40) * 100).toFixed(1);
  const totalScore = (
    (parseFloat(capacityPercent) + parseFloat(competencePercent) + parseFloat(characterPercent)) / 3
  ).toFixed(1);

  const candidateName = evaluationData.candidateName || "Unknown Candidate";
  const assessorName = evaluationData.fullName || "Unknown Assessor";

  const getRating = (score: string) => {
    const numeric = parseFloat(score);
    if (numeric >= 90) return { title: "✨ Outstanding Leadership Potential", recommendation: "Highly recommended for leadership." };
    if (numeric >= 80) return { title: "✅ Strong Leadership Capacity", recommendation: "Recommended for leadership with minor improvements." };
    if (numeric >= 65) return { title: "⚠️ Moderate Leadership Readiness", recommendation: "Some qualities present, but needs improvements." };
    if (numeric >= 50) return { title: "🚩 Basic Leadership Fitness", recommendation: "Needs significant development before assuming office." };
    return { title: "❌ Unfit for Office", recommendation: "Not recommended for leadership." };
  };

  const { title, recommendation } = getRating(totalScore);

  useEffect(() => {
    const submitEvaluation = async () => {
      const evaluationDataToSubmit = {
        assessor: {
          fullName: evaluationData.fullName,
          email: evaluationData.email,
          phone: evaluationData.phone,
          organisation: evaluationData.organisation,
          state: evaluationData.state,
          votingExperience: evaluationData.votingExperience,
          designation: evaluationData.designation,
          relationship: evaluationData.relationship,
        },
        candidate: {
          candidateName: evaluationData.candidateName,
          position: evaluationData.position,
          party: evaluationData.party,
          state: evaluationData.state,
        },
        scores: {
          capacity: capacityPercent,
          competence: competencePercent,
          character: characterPercent,
        },
        finalScore: totalScore,
        evaluatedAt: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/evaluation/submit`,
          evaluationDataToSubmit
        );
        console.log("Evaluation successfully stored:", response.data);
      } catch (error: any) {
        console.error("Error storing evaluation:", error.response?.data || error.message);
      }
    };

    submitEvaluation();
  }, []);

  const handleDownload = () => {
    if (resultRef.current) {
      const scale = 3;
      domtoimage
        .toPng(resultRef.current, {
          quality: 1,
          bgcolor: "#ffffff",
          width: resultRef.current.clientWidth * scale,
          height: resultRef.current.clientHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${resultRef.current.clientWidth}px`,
            height: `${resultRef.current.clientHeight}px`,
          },
        })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `Evaluation Result - ${candidateName}.png`;
          link.click();
        })
        .catch((error) => console.error("Error generating image:", error));
    }
  };

  return (
    <div className=" inset-0 flex items-center justify-center bg-black/70 px-4 py-6 z-[9999] overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-lg p-0 rounded-2xl shadow-xl relative my-4 sm:my-8 mx-auto animate-fadeInUp">
        <button
          onClick={() => closeModal()}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Start Over"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="bg-[#006837]/5 rounded-t-2xl p-4 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-[#006837] text-center">3Cs Evaluation Results</h2>
        </div>

        <div ref={resultRef} className="px-6 pt-6 pb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">{candidateName}</h3>
            <p className="text-sm text-gray-500">Assessed by {assessorName} • {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm text-center">
              <div className="text-base sm:text-lg font-semibold">Capacity</div>
              <div className="flex items-center justify-center my-2 sm:my-3">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  <svg className="h-16 w-16 sm:h-20 sm:w-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#6ee7b7"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (parseFloat(capacityPercent) / 100) * 283}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-lg font-bold">
                    {capacityPercent}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">30% of total score</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm text-center">
              <div className="text-base sm:text-lg font-semibold">Competence</div>
              <div className="flex items-center justify-center my-2 sm:my-3">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  <svg className="h-16 w-16 sm:h-20 sm:w-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (parseFloat(competencePercent) / 100) * 283}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-lg font-bold">
                    {competencePercent}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">30% of total score</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm text-center">
              <div className="text-base sm:text-lg font-semibold">Character</div>
              <div className="flex items-center justify-center my-2 sm:my-3">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  <svg className="h-16 w-16 sm:h-20 sm:w-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#fcd34d"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (parseFloat(characterPercent) / 100) * 283}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-lg font-bold">
                    {characterPercent}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">40% of total score</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium flex items-center gap-1">
                <BarChart3 size={16} className="inline-block" />
                Overall Score:
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#006837]">{totalScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#006837] h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${totalScore}%` }}
              ></div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 mb-5 sm:mb-6 bg-white shadow-sm">
            <h4 className="text-base sm:text-lg font-bold mb-2">{title}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{recommendation}</p>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4 italic">
            This result is for personal consumption and is subjective based on the judgment of the assessor.
            To learn more, visit{' '}
            <a
              href="https://mandate4.org/3Csframework"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006837] hover:underline"
            >
              mandate4.org/3Csframework
            </a>
          </p>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl flex flex-wrap justify-between gap-2 sm:gap-3 border-t border-gray-100">
          <button
            onClick={handleDownload}
            className="px-4 sm:px-5 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] transition-colors duration-200 text-xs sm:text-sm font-medium flex items-center shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Result
          </button>
          <button
            onClick={() => closeModal()}
            className="px-4 sm:px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs sm:text-sm font-medium flex items-center"
            aria-label="Start evaluation over"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
