import { Users, MapPin, Target, Calendar, ExternalLink, Share2 } from "lucide-react";
import { VotingBloc } from "../../../types/votingBloc";

interface VotingBlocListProps {
  votingBlocs: VotingBloc[];
  onVotingBlocClick: (id: string) => void;
}

export default function VotingBlocList({ votingBlocs, onVotingBlocClick }: VotingBlocListProps) {
  const shareVotingBloc = (joinCode: string, name: string) => {
    const shareUrl = `${window.location.origin}/voting-bloc/${joinCode}`;
    const shareText = `Join my voting bloc: ${name}`;

    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You might want to show a toast notification here
    }
  };

  if (votingBlocs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users size={64} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No voting blocs yet</h3>
        <p className="text-gray-500">Create your first voting bloc to start building your coalition.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {votingBlocs.map((bloc) => (
        <div
          key={bloc._id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onVotingBlocClick(bloc._id)}
        >
          {/* Banner Image */}
          {bloc.bannerImageUrl && (
            <div className="h-32 bg-gray-200 overflow-hidden">
              <img
                src={bloc.bannerImageUrl}
                alt={bloc.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                  {bloc.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Target size={14} className="mr-1" />
                  <span className="truncate">{bloc.targetCandidate}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareVotingBloc(bloc.joinCode, bloc.name);
                }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                title="Share voting bloc"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {bloc.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-500">
                <Users size={14} className="mr-1" />
                <span>{bloc.metrics.totalMembers} members</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-1" />
                <span className="truncate">{bloc.scope}</span>
              </div>
            </div>

            {/* Location */}
            <div className="text-xs text-gray-500 mb-3">
              {bloc.location.state}
              {bloc.location.lga && ` • ${bloc.location.lga}`}
              {bloc.location.ward && ` • ${bloc.location.ward}`}
            </div>

            {/* Goals */}
            {bloc.goals.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {bloc.goals.slice(0, 2).map((goal, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {goal.length > 20 ? `${goal.substring(0, 20)}...` : goal}
                    </span>
                  ))}
                  {bloc.goals.length > 2 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{bloc.goals.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Toolkits */}
            {bloc.toolkits.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {bloc.toolkits.length} toolkit{bloc.toolkits.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar size={12} className="mr-1" />
                <span>
                  {new Date(bloc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Join Code: <span className="font-mono font-medium">{bloc.joinCode}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
