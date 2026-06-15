import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Mail, Copy, Check, MessageCircle, CreditCard, User, Activity } from 'lucide-react';
import type { PersonRow } from './types';

interface PersonProfileModalProps {
  person: PersonRow | null;
  onClose: () => void;
}

// Fields for the profile completion check (same as canonical 12)
const PROFILE_FIELDS: { key: keyof PersonRow; label: string }[] = [
  { key: 'profileImage', label: 'Profile Photo' },
  { key: 'name', label: 'Full Name' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'gender', label: 'Gender' },
  { key: 'ageRange', label: 'Age Range' },
  { key: 'stateOfOrigin', label: 'State of Origin' },
  { key: 'votingState', label: 'Voting State' },
  { key: 'votingLGA', label: 'Voting LGA' },
  { key: 'votingWard', label: 'Voting Ward' },
  { key: 'votingPU', label: 'Polling Unit' },
  { key: 'isVoter', label: 'PVC Status' },
  { key: 'willVote', label: 'Voting Intent' },
];

function formatWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  // Strip +, spaces, leading 0 — normalize to international format
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('0')) cleaned = '234' + cleaned.slice(1);
  return `https://wa.me/${cleaned}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} year(s) ago`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PersonProfileModal: React.FC<PersonProfileModalProps> = ({ person, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!person) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const missingFields = PROFILE_FIELDS.filter(f => {
    const val = person[f.key];
    return !val || (typeof val === 'string' && val.trim() === '');
  });

  const pct = person.profileCompletionPercentage;
  const pctColor = pct === 100 ? 'bg-green-500' : pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const waLink = formatWhatsAppLink(person.phone);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[9999] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold text-gray-900">Member Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* ─── Avatar + Identity ─── */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-3">
              {person.profileImage ? (
                <img src={person.profileImage} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {person.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              {person.designation && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  {person.designation}
                </span>
              )}
              {person.gender && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${person.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {person.gender}
                </span>
              )}
              {person.ageRange && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {person.ageRange.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          {/* ─── Profile Completion ─── */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Profile Completion</span>
              <span className={`text-xs font-bold ${pct === 100 ? 'text-green-600' : pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {pct}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all ${pctColor}`} style={{ width: `${pct}%` }} />
            </div>
            {missingFields.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Missing: {missingFields.map(f => f.label).join(', ')}
              </p>
            )}
          </div>

          {/* ─── Contact ─── */}
          <Section title="Contact" icon={Phone}>
            {person.phone && (
              <ContactRow
                icon={<Phone className="w-3.5 h-3.5 text-gray-400" />}
                value={person.phone}
                onCopy={() => copyToClipboard(person.phone, 'phone')}
                copied={copiedField === 'phone'}
                href={`tel:${person.phone}`}
              />
            )}
            {person.email && (
              <ContactRow
                icon={<Mail className="w-3.5 h-3.5 text-gray-400" />}
                value={person.email}
                onCopy={() => copyToClipboard(person.email!, 'email')}
                copied={copiedField === 'email'}
                href={`mailto:${person.email}`}
              />
            )}
            {!person.phone && !person.email && (
              <p className="text-xs text-gray-400 italic">No contact info available</p>
            )}
          </Section>

          {/* ─── Voting Info ─── */}
          <Section title="Voting Info" icon={CreditCard}>
            <InfoGrid rows={[
              { label: 'PVC Status', value: person.isVoter === 'Yes' ? '✅ Has PVC' : person.isVoter === 'No' ? '❌ No PVC' : '— Unknown' },
              { label: 'Will Vote', value: person.willVote === 'Yes' ? '✅ Yes' : person.willVote === 'No' ? '❌ No' : '— Unknown' },
              { label: 'State', value: person.votingState || '—' },
              { label: 'LGA', value: person.votingLGA || '—' },
              { label: 'Ward', value: person.votingWard || '—' },
              { label: 'Polling Unit', value: person.votingPU || '—' },
            ]} />
          </Section>

          {/* ─── Demographics ─── */}
          <Section title="Demographics" icon={User}>
            <InfoGrid rows={[
              { label: 'Gender', value: person.gender || '—' },
              { label: 'Age Range', value: person.ageRange || '—' },
              { label: 'State of Origin', value: person.stateOfOrigin || '—' },
              { label: 'Citizenship', value: person.citizenship || '—' },
            ]} />
          </Section>

          {/* ─── Activity ─── */}
          <Section title="Activity" icon={Activity}>
            <InfoGrid rows={[
              { label: 'Joined', value: formatDate(person.createdAt) },
              { label: 'Last Active', value: timeAgo(person.lastActive) },
              { label: 'Profile %', value: `${pct}%` },
            ]} />
          </Section>

          {/* ─── Action Buttons ─── */}
          <div className="flex gap-2 pt-2">
            {person.phone && (
              <a
                href={`tel:${person.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
            {person.phone && (
              <button
                onClick={() => copyToClipboard(person.phone, 'phone-btn')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {copiedField === 'phone-btn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'phone-btn' ? 'Copied!' : 'Copy Phone'}
              </button>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ─── Helper Components ───

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ContactRow({ icon, value, onCopy, copied, href }: {
  icon: React.ReactNode;
  value: string;
  onCopy: () => void;
  copied: boolean;
  href: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {icon}
      <a href={href} className="text-sm text-gray-800 hover:text-green-700 font-mono flex-1 truncate">
        {value}
      </a>
      <button
        onClick={onCopy}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        title="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
      </button>
    </div>
  );
}

function InfoGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {rows.map((row, i) => (
        <div key={i}>
          <p className="text-[11px] text-gray-400 font-medium">{row.label}</p>
          <p className="text-sm text-gray-800 font-medium truncate">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

export default PersonProfileModal;
