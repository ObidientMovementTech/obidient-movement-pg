import React from 'react';
import { Calendar, MapPin, Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { ElectionSummary } from '../services/electionResultsService';

interface ElectionCardProps {
  election: ElectionSummary;
  onClick?: () => void;
  className?: string;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election, onClick, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <TrendingUp className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'upcoming':
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {election.election_name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {election.election_type}
          </p>
        </div>

        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(election.status)}`}>
          {getStatusIcon(election.status)}
          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
        </div>
      </div>

      {/* Location and Date */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{election.state}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(election.election_date)}</span>
        </div>
      </div>

      {/* Results Summary */}
      {election.status !== 'upcoming' && (
        <div className="space-y-3">
          {/* Leading Candidate */}
          {election.leading_candidate && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Leading: {election.leading_candidate.name}
                  </p>
                  <p className="text-xs text-green-700">
                    {election.leading_candidate.party}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-900">
                    {election.leading_candidate.votes.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700">
                    {election.leading_candidate.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vote Statistics */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span>Total Votes</span>
            </div>
            <span className="font-semibold text-gray-900">
              {election.total_votes.toLocaleString()}
            </span>
          </div>

          {/* Voter Turnout */}
          {election.voter_turnout && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Voter Turnout</span>
              <span className="font-semibold text-gray-900">
                {election.voter_turnout.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Certification Status */}
          {election.is_certified && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Certified Results</span>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Election Info */}
      {election.status === 'upcoming' && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-sm text-orange-800">
            Election scheduled for {formatDate(election.election_date)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectionCard;
