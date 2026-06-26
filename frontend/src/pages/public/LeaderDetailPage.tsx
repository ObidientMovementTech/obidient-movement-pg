import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import { getPublicLeaderBySlug, type PublicLeaderProfile } from '../../services/publicLeadersService';

const DIRECTORATE_LABELS: Record<string, string> = {
  operations: 'Operations',
  political_engagement: 'Political Engagement',
  legal: 'Legal',
  technology: 'Technology',
  communications: 'Communications',
  mobilisation: 'Mobilisation',
  finance: 'Finance',
  research: 'Research',
  diaspora_engagement: 'Diaspora Engagement',
};

const getJurisdiction = (leader: PublicLeaderProfile): string | null => {
  if (leader.assignedDirectorate) {
    return `${DIRECTORATE_LABELS[leader.assignedDirectorate] ?? leader.assignedDirectorate} Directorate`;
  }
  if (leader.assignedCountry) return leader.assignedCountry;
  if (leader.assignedState) return leader.assignedState;
  return null;
};

const getRoleTitle = (leader: PublicLeaderProfile): string => {
  if (leader.designation === 'Directorate Head' && leader.assignedDirectorate) {
    return `Head of ${DIRECTORATE_LABELS[leader.assignedDirectorate] ?? leader.assignedDirectorate} Directorate`;
  }
  return leader.designation;
};

const LeaderDetailPage = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leader, setLeader] = useState<PublicLeaderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getPublicLeaderBySlug(slug)
      .then(setLeader)
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green" />
      </div>
    );
  }

  if (notFound || !leader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-medium text-text-light dark:text-text-dark">Leader not found</h1>
        <p className="text-text-muted">This profile may have been removed or the link is incorrect.</p>
        <Link to="/leaders" className="text-sm text-accent-green hover:underline">
          ← Back to Leaders
        </Link>
      </div>
    );
  }

  const jurisdiction = getJurisdiction(leader);
  const roleTitle = getRoleTitle(leader);

  return (
    <>
      <SEOHead
        title={`${leader.name} — Obidient Movement`}
        description={`${roleTitle} in the Obidient Movement.`}
      />

      {/* Back nav */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Leaders
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-10 items-start">
            {/* Photo */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 ring-4 ring-accent-green/20">
              {leader.profileImage ? (
                <img
                  src={leader.profileImage}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-7xl font-light">
                  {leader.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                <span className="w-8 h-px bg-accent-green" />
                {leader.designation}
              </span>

              <h1 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                {leader.name}
              </h1>

              <p className="mt-2 text-base text-accent-green/80 font-medium">{roleTitle}</p>

              {jurisdiction && (
                <p className="mt-1 text-sm text-text-muted">{jurisdiction}</p>
              )}

              {leader.movementEmail && (
                <a
                  href={`mailto:${leader.movementEmail}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-green transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {leader.movementEmail}
                </a>
              )}

            </div>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <Link to="/leaders" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-green transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              View all leaders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LeaderDetailPage;
