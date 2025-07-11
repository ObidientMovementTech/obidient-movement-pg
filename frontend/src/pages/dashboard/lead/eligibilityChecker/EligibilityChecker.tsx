import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Award, CircleUser, Target } from 'lucide-react';
import EvaluationForm from './EvaluationForm';

export default function EligibilityChecker() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading resources
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
    sessionStorage.setItem('dashboardPage', 'Run for Office Hub');
  }; return (
    <section className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 font-poppins">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[#006837] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading assessment...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Responsive Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-[#006837] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Award size={16} className="text-[#006837]" />
              <span className="hidden sm:inline">Obidient Movement</span>
            </div>
          </div>

          {/* Responsive Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              3Cs Eligibility Checker
            </h1>

            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              Evaluate leadership potential across Capacity, Competence, and Character
              with our comprehensive assessment framework.
            </p>

            {/* Responsive 3Cs Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#006837] rounded-lg flex items-center justify-center mb-3">
                  <Target size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Capacity</h3>
                <p className="text-xs sm:text-sm text-gray-600">Ability to handle responsibilities</p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <Award size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Competence</h3>
                <p className="text-xs sm:text-sm text-gray-600">Skills and expertise</p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <CircleUser size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Character</h3>
                <p className="text-xs sm:text-sm text-gray-600">Integrity and values</p>
              </div>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <EvaluationForm closeModal={() => navigate('/dashboard')} />
          </div>
        </div>
      )}
    </section>
  );
}