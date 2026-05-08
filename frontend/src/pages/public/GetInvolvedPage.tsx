import { useState } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import { useCountUp } from '../../hooks/useCountUp';
import useNigeriaLocations from '../../hooks/useNigeriaLocations';
import FormSelect from '../../components/select/FormSelect';
import { getRecaptchaToken } from '../../utils/recaptcha';
import rallyImg from '../../assets/images/po5.jpeg';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ─── Role Cards ─── */
const roles = [
  {
    num: '01',
    id: 'volunteer',
    title: 'Volunteer',
    desc: 'Lend your time, skills, and voice to build the movement from the ground up.',
    highlights: [
      'Field & door-to-door community engagement',
      'Digital advocacy and content creation',
      'Event hosting, rally support, and logistics',
      'Voter education and civic literacy programs',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    num: '02',
    id: 'vote_protection_officer',
    title: 'Vote Protection Officer',
    desc: 'Be the eyes, ears, and shield at your polling unit — defend every vote.',
    highlights: [
      'Election day monitoring and result reporting',
      'Voter mobilization in your polling unit',
      'Real-time incident documentation',
      'Coordination with ward and LGA teams',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    num: '03',
    id: 'donor',
    title: 'Supporter / Donor',
    desc: 'Fuel the movement with financial support, materials, or professional services.',
    highlights: [
      'Cash contributions of any size',
      'Campaign materials — banners, branded items, rally kits',
      'In-kind services — venues, transport, pro-bono work',
      'Equipment, devices, and software',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

/* ─── Steps ─── */
const steps = [
  { num: '01', title: 'Register', desc: 'Create your account with your details — takes less than 2 minutes.' },
  { num: '02', title: 'Get Verified', desc: 'Complete KYC identity verification — within 48 hours.' },
  { num: '03', title: 'Get Your Starter Pack', desc: 'Digital membership card, briefing materials, and group access.' },
  { num: '04', title: 'Start Participating', desc: 'Join local activities, chat rooms, and campaigns in your area.' },
];

/* ─── Donation Types ─── */
const donationTypes = [
  {
    title: 'Cash Contributions',
    desc: 'Direct financial support powering field operations, training, communications, and travel for coordinators.',
    items: ['Bank transfer to the official account', 'Mobile money / USSD to verified codes', 'One-off, monthly, or campaign-cycle pledges'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Campaign Materials',
    desc: 'Printed and branded items that put the movement\'s message in every market, ward, and senatorial district.',
    items: ['Banners, posters, and flyers', 'T-shirts, caps, and wristbands', 'Stickers, flags, and rally kits'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: 'In-Kind Services',
    desc: 'Goods, expertise, and infrastructure that reduce organizing costs and help us reach further, faster.',
    items: ['Venues, transport, and logistics', 'Pro-bono legal, design, or media work', 'Equipment, devices, and software licences'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.1-5.1a2.25 2.25 0 010-3.18l.71-.71a2.25 2.25 0 013.18 0l1.79 1.79 1.79-1.79a2.25 2.25 0 013.18 0l.71.71a2.25 2.25 0 010 3.18l-5.1 5.1a.75.75 0 01-1.06 0z" />
      </svg>
    ),
  },
];

/* ─── Stats ─── */
const stats = [
  { value: 36, suffix: '+', label: 'States Active' },
  { value: 25000, suffix: '+', label: 'Verified Members' },
  { value: 774, suffix: '', label: 'LGAs Organized' },
  { value: 176846, suffix: '', label: 'Polling Units Mapped' },
];

/* ─── Testimonials (hidden for now — keeping data for later) ─── */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testimonials = [
  {
    quote: "I joined the movement because I was tired of complaining. Now I'm organized, verified, and making a difference in my ward.",
    name: 'Amina B.',
    role: 'Volunteer',
    state: 'Kaduna State',
    img: '/landing/portraits/2.webp',
  },
  {
    quote: "For the first time, I feel like my vote and my voice actually count. The movement gave me a platform to participate meaningfully.",
    name: 'Chukwu E.',
    role: 'Vote Protection Officer',
    state: 'Enugu State',
    img: '/landing/portraits/3.webp',
  },
  {
    quote: "As a young Nigerian, I always wanted to get involved but didn't know how. This platform made it simple — register, verify, act.",
    name: 'Tunde O.',
    role: 'Ward Agent',
    state: 'Lagos State',
    img: '/landing/portraits/5.webp',
  },
  {
    quote: "I donate monthly because I believe in this movement. The transparency — knowing exactly where funds go — makes it easy to trust.",
    name: 'Ngozi A.',
    role: 'Donor',
    state: 'Anambra State',
    img: '/landing/portraits/4.webp',
  },
];

/* ─── FAQ ─── */
const faqs = [
  { q: 'Is joining free?', a: 'Yes. Registration, verification, and participation are completely free. The movement is citizen-funded — you are never required to pay.' },
  { q: 'Do I need to be a registered voter?', a: 'No. Anyone who cares about Nigeria\'s future can join. However, we encourage all eligible citizens to register to vote and obtain their PVC.' },
  { q: 'I\'m in the diaspora — how can I help?', a: 'Absolutely! Toggle the "I\'m in the diaspora" option when registering. You can volunteer for digital advocacy, donate, spread awareness, and connect with diaspora chapters.' },
  { q: 'What is a Vote Protection Officer?', a: 'A Vote Protection Officer monitors elections at their polling unit, reports results in real-time, documents irregularities, and helps ensure every vote is counted. Training is provided.' },
  { q: 'How are donations used?', a: 'All donations fund field operations, coordinator travel, technology infrastructure, campaign materials, and community programs. Every expenditure is tracked and reported.' },
  { q: 'Is my data safe?', a: 'Yes. Your personal information is encrypted, never sold, and never shared with third parties. We use KYC verification solely to confirm member identity.' },
  { q: 'Can my organization partner with the movement?', a: 'Yes! NGOs, community groups, professional associations, and faith organizations can partner with us. Reach out through the contact page or indicate this in the interest form.' },
  { q: 'What if there\'s no coordinator in my area yet?', a: 'You might be the first! Register your interest and we\'ll connect you with the nearest coordinator — or help you become one if the need exists.' },
];

/* ─── Volunteer Skills ─── */
const volunteerSkills = [
  'Digital / Social Media',
  'Field Outreach',
  'Event Planning',
  'Content Creation',
  'Legal',
  'Medical',
  'Transport / Logistics',
  'Education / Training',
];

/* ───────────────────────────────────────────── */
const GetInvolvedPage = () => {
  const s0 = useCountUp(stats[0].value);
  const s1 = useCountUp(stats[1].value);
  const s2 = useCountUp(stats[2].value);
  const s3 = useCountUp(stats[3].value);
  const counters = [s0, s1, s2, s3];

  /* FAQ state */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Form state */
  const [formRole, setFormRole] = useState('volunteer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isDiaspora, setIsDiaspora] = useState(false);
  const [country, setCountry] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [contributionType, setContributionType] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const locations = useNigeriaLocations({ levels: 3 });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot trap

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!isDiaspora && !locations.selectedState) {
      setFormError('Please select your state.');
      return;
    }

    setFormStatus('submitting');
    setFormError('');

    try {
      const recaptchaToken = await getRecaptchaToken('involvement_interest');

      await axios.post(`${API}/api/involvement/submit`, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: formRole,
        state: isDiaspora ? undefined : locations.selectedState?.name,
        lga: isDiaspora ? undefined : locations.selectedLGA?.name,
        ward: isDiaspora ? undefined : locations.selectedWard?.name,
        isDiaspora,
        country: isDiaspora ? country.trim() : undefined,
        skills: formRole === 'volunteer' ? selectedSkills : undefined,
        experienceLevel: formRole === 'vote_protection_officer' ? experienceLevel : undefined,
        contributionType: formRole === 'donor' ? contributionType : undefined,
        message: message.trim() || undefined,
        recaptchaToken,
      });

      setFormStatus('success');
    } catch (err: any) {
      setFormStatus('error');
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <SEOHead
        title="Get Involved — Join the Obidient Movement"
        description="Discover how you can participate in the Obidient Movement — volunteer, protect votes, donate, and help build a new Nigeria."
      />

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-40 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #0B6739, #D42B27, transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Get Involved
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight">
            The Movement<br className="hidden lg:block" /> <span className="text-accent-green">Needs You</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Whether you have an hour, a network, or a cheque book — there is a place for you. Find the role that fits and step in.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <GradientCTA to="/auth/sign-up" size="lg">
              Register Now
            </GradientCTA>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              I'm Already a Member
            </Link>
          </div>
          {/* Trust markers */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Free to join
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Privacy protected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Diaspora friendly
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Citizen funded
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. ROLE SELECTOR — "Pick Your Path"
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              How You Can Help
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Pick the role that fits you
            </h2>
            <p className="mt-3 text-base text-text-muted max-w-lg mx-auto">
              Every contribution matters — from boots on the ground to behind-the-scenes support. Choose how you want to serve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 border-t-4 border-t-accent-red rounded-2xl p-7 lg:p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-accent-green/40">{role.num}</span>
                    <div className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                      {role.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-text-light dark:text-text-dark">{role.title}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{role.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {role.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-text-muted">
                        <svg className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#interest-form"
                  onClick={() => setFormRole(role.id)}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-green/10 text-accent-green text-sm font-semibold hover:bg-accent-green hover:text-white transition-colors"
                >
                  I'm Interested
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. WHAT HAPPENS NEXT — 4-Step Process
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              What Happens Next
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              From sign-up to action in 4 steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-2xl p-6 h-full hover:border-accent-green/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent-green text-white flex items-center justify-center mb-4 font-bold text-sm">
                    {step.num}
                  </div>
                  <h3 className="text-base font-medium text-text-light dark:text-text-dark">{step.title}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{step.desc}</p>
                </div>
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 z-10">
                    <svg className="w-6 h-6 text-accent-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-text-muted">
            <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Your details are used solely to coordinate your involvement and are never sold or shared with third parties.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. INTEREST FORM
      ══════════════════════════════════════════════════════════ */}
      <section id="interest-form" className="py-24 lg:py-32 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Registration
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Register your interest
            </h2>
            <p className="mt-3 text-base text-text-muted max-w-lg mx-auto">
              Tell us how you'd like to get involved. A coordinator from your area will reach out within 48 hours.
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-2xl p-8 lg:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-text-light dark:text-text-dark">Thank you for stepping in!</h3>
              <p className="mt-3 text-sm text-text-muted max-w-md mx-auto">
                Your interest has been recorded. A coordinator will reach out to you within 48 hours. In the meantime, create your account to get started right away.
              </p>
              <div className="mt-6">
                <GradientCTA to="/auth/sign-up">
                  Create Your Account
                </GradientCTA>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-2xl p-6 lg:p-8 space-y-6">
              {/* Honeypot — hidden from humans */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute opacity-0 h-0 w-0 -z-10"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  I want to *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormRole(role.id)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        formRole === role.id
                          ? 'border-accent-green bg-accent-green/10 text-accent-green'
                          : 'border-gray-200 dark:border-gray-600 text-text-muted hover:border-accent-green/40'
                      }`}
                    >
                      {role.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name / Email / Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              {/* Diaspora toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDiaspora(!isDiaspora);
                    locations.setSelectedState(null);
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isDiaspora ? 'bg-accent-green' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDiaspora ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-text-muted">I'm in the diaspora</span>
              </div>

              {/* Location fields */}
              {isDiaspora ? (
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Country of Residence *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors"
                    placeholder="e.g. United Kingdom"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FormSelect
                      label="State *"
                      options={locations.states.options}
                      defaultSelected={locations.selectedState?.name || ''}
                      onChange={(opt) => {
                        if (opt) {
                          const loc = locations.states.data.find((s) => s.name === opt.value);
                          locations.setSelectedState(loc || null);
                        } else {
                          locations.setSelectedState(null);
                        }
                      }}
                    />
                    {locations.states.isLoading && <p className="text-xs text-gray-400 mt-1">Loading states…</p>}
                  </div>
                  <div>
                    <FormSelect
                      label="LGA"
                      options={locations.lgas.options}
                      defaultSelected={locations.selectedLGA?.name || ''}
                      onChange={(opt) => {
                        if (opt) {
                          const loc = locations.lgas.data.find((l) => l.name === opt.value);
                          locations.setSelectedLGA(loc || null);
                        } else {
                          locations.setSelectedLGA(null);
                        }
                      }}
                      disabled={!locations.selectedState || locations.lgas.isLoading}
                    />
                    {locations.lgas.isLoading && <p className="text-xs text-gray-400 mt-1">Loading LGAs…</p>}
                  </div>
                  <div>
                    <FormSelect
                      label="Ward"
                      options={locations.wards.options}
                      defaultSelected={locations.selectedWard?.name || ''}
                      onChange={(opt) => {
                        if (opt) {
                          const loc = locations.wards.data.find((w) => w.name === opt.value);
                          locations.setSelectedWard(loc || null);
                        } else {
                          locations.setSelectedWard(null);
                        }
                      }}
                      disabled={!locations.selectedLGA || locations.wards.isLoading}
                    />
                    {locations.wards.isLoading && <p className="text-xs text-gray-400 mt-1">Loading wards…</p>}
                  </div>
                </div>
              )}

              {/* Role-specific fields */}
              {formRole === 'volunteer' && (
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">What skills do you bring?</label>
                  <div className="flex flex-wrap gap-2">
                    {volunteerSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'border-accent-green bg-accent-green/10 text-accent-green'
                            : 'border-gray-200 dark:border-gray-600 text-text-muted hover:border-accent-green/40'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formRole === 'vote_protection_officer' && (
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Experience Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['New', 'Some Experience', 'Experienced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          experienceLevel === level
                            ? 'border-accent-green bg-accent-green/10 text-accent-green'
                            : 'border-gray-200 dark:border-gray-600 text-text-muted hover:border-accent-green/40'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formRole === 'donor' && (
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">How would you like to contribute?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Cash', 'Materials', 'In-Kind Services'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContributionType(type)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          contributionType === type
                            ? 'border-accent-green bg-accent-green/10 text-accent-green'
                            : 'border-gray-200 dark:border-gray-600 text-text-muted hover:border-accent-green/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional message */}
              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Anything else? (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors resize-none"
                  placeholder="Tell us anything relevant — availability, organization you represent, etc."
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full py-3.5 rounded-xl bg-accent-green text-white font-semibold text-sm hover:bg-accent-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === 'submitting' ? 'Submitting…' : 'Join the Movement'}
              </button>

              <p className="text-xs text-text-muted text-center">
                Your information is private and never shared. By submitting, you agree to our{' '}
                <Link to="/privacy" className="text-accent-green hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. DONATIONS — "Three Ways to Power the Movement"
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-accent-green relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />
        <img src={rallyImg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-[0.08]" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(11,103,57,0.25) 0%, transparent 70%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(212,43,39,0.18) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-white/80">
              <span className="w-8 h-px bg-white/60" />
              Support & Donations
              <span className="w-8 h-px bg-white/60" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-white tracking-tight">
              Three ways to power the movement
            </h2>
            <p className="mt-3 text-base text-white/70 max-w-lg mx-auto">
              Every contribution — financial, material, or in-kind — helps us reach more communities and organize impactful programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {donationTypes.map((d) => (
              <div key={d.title} className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 border-t-4 border-t-accent-red rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
                <div className="w-11 h-11 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center mb-5">
                  {d.icon}
                </div>
                <h3 className="text-lg font-medium text-text-light dark:text-text-dark">{d.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{d.desc}</p>
                <ul className="mt-4 space-y-2">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className="w-1 h-1 rounded-full bg-accent-green mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. IMPACT STATS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05]" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight">
              This is what organized citizens achieve
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} ref={counters[i].ref} className="text-center">
                <div className="text-3xl lg:text-5xl font-medium text-white tabular-nums">
                  {counters[i].count.toLocaleString()}<span className="text-accent-green">{stat.suffix}</span>
                </div>
                <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. TESTIMONIALS — hidden for now, may bring back later
      ══════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════
          8. FAQ
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Common Questions
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Quick answers about getting involved
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-text-light dark:text-text-dark pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. WHAT MAKES US DIFFERENT
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              What makes us different
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Verified Members',
                desc: 'Every member is KYC-verified with a digital membership card — no ghost members.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
              {
                title: 'Real-Time Coordination',
                desc: 'Mobile app with live chat, push notifications, and leadership messaging — not just a website.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                ),
              },
              {
                title: 'Transparent Operations',
                desc: 'Public dashboards, tracked funds, and accountable leadership at every level.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Polling Unit Precision',
                desc: 'Organized down to every one of Nigeria\'s 176,846 polling units — not just state-level.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-medium text-text-light dark:text-text-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 via-gray-950/80 to-gray-950" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium text-white tracking-tight">
            Nigeria Needs You
          </h2>
          <p className="mt-4 text-base text-gray-300 max-w-lg mx-auto">
            The movement grows stronger with every new member. Register today and become part of the solution.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <GradientCTA to="/auth/sign-up" size="lg">
              Register Now — It's Free
            </GradientCTA>
            <Link
              to="/mobile-app"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Download the App
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Free to join · Verified membership · Immediate access
          </p>
        </div>
      </section>
    </>
  );
};

export default GetInvolvedPage;
