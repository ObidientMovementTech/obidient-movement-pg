import { useState, useRef, type FormEvent } from 'react';
import SEOHead from '../../components/public/SEOHead';
import FAQAccordion from '../../components/public/FAQAccordion';
import rallyImg from '../../assets/images/po5.jpeg';

interface FormState {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  _hp: string;
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  subject: '',
  message: '',
  _hp: '',
};

const channels = [
  {
    title: 'General Inquiries',
    desc: 'Questions about the movement, membership, or platform',
    email: 'info@obidients.com',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: 'Volunteer & Partnerships',
    desc: 'Join our team or explore collaboration opportunities',
    email: 'volunteer@obidients.com',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: 'Media & Press',
    desc: 'Press inquiries, interviews, and media coverage',
    email: 'press@obidients.com',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
];

const faqItems = [
  { question: 'How do I join the Obidient Movement?', answer: 'Visit our registration page at /auth/sign-up and create your account with a valid email and phone number. The process takes less than 5 minutes, and membership is completely free.' },
  { question: 'How can I volunteer with the movement?', answer: 'After registering, complete your profile with your state, LGA, and ward. You\'ll be connected with your local chapter coordinator who can assign volunteer roles including voter education, community outreach, and event support.' },
  { question: 'Is membership free?', answer: 'Yes, membership in the Obidient Movement is completely free. We believe democratic participation should be accessible to every Nigerian regardless of financial status.' },
  { question: 'How do I become a coordinator?', answer: 'Coordinators are selected based on merit, commitment, and demonstrated leadership within their local chapters. Start by registering, volunteering, and building trust within your community. Contact your state coordinator for specific pathways.' },
  { question: 'How do I report an issue or concern?', answer: 'You can report issues through this contact form, by emailing info@obidients.com, or through the reporting feature in your dashboard after logging in. All reports are reviewed by the national coordination team.' },
  { question: 'Can I get my digital membership card?', answer: 'Yes! Once your account is verified, you can access your digital membership card from your dashboard. It includes your unique member ID, state chapter, and verification status.' },
];

const ContactPage = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const loadTimeRef = useRef(Date.now());

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form._hp || Date.now() - loadTimeRef.current < 3000) return;
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 rounded-lg border bg-white dark:bg-secondary-light text-text-light dark:text-text-dark placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 transition ${
      errors[field] ? 'border-accent-red' : 'border-gray-200 dark:border-gray-700'
    }`;

  return (
    <>
      <SEOHead
        title="Contact Us — Obidient Movement"
        description="Get in touch with the Obidient Movement. Reach out for inquiries, partnerships, or support."
      />

      {/* ── 1. HERO ────────────────────────────────────────── */}
      <section className="relative py-28 lg:py-36 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Contact Us
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight">
            Let's <span className="text-accent-green">Talk</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Whether it's a partnership, media inquiry, or a question about joining — we're here for you.
          </p>
        </div>
      </section>

      {/* ── 2. CHANNEL CARDS ───────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {channels.map((ch) => (
              <div key={ch.title} className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 border-t-4 border-t-accent-green rounded-b-xl rounded-t-none p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                  {ch.icon}
                </div>
                <h3 className="mt-4 text-base font-medium text-text-light dark:text-text-dark">{ch.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{ch.desc}</p>
                <p className="mt-3 text-sm text-accent-green font-medium">{ch.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FORM + INFO ─────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-medium text-text-light dark:text-text-dark mb-6">Send us a message</h2>

              {submitted ? (
                <div className="bg-accent-green/5 border border-accent-green/20 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-text-light dark:text-text-dark">Thank you!</h3>
                  <p className="mt-2 text-text-muted">Your message has been received. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(initialForm); loadTimeRef.current = Date.now(); }}
                    className="mt-6 text-sm font-medium text-accent-green hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10" aria-hidden="true">
                    <label htmlFor="contact-hp">Leave blank</label>
                    <input id="contact-hp" type="text" tabIndex={-1} autoComplete="off" value={form._hp} onChange={(e) => handleChange('_hp', e.target.value)} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Full Name</label>
                      <input id="fullName" type="text" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={inputClass('fullName')} placeholder="Your full name" />
                      {errors.fullName && <p className="mt-1 text-xs text-accent-red">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Email</label>
                      <input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass('email')} placeholder="you@example.com" />
                      {errors.email && <p className="mt-1 text-xs text-accent-red">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Subject</label>
                    <input id="subject" type="text" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} className={inputClass('subject')} placeholder="What is this about?" />
                    {errors.subject && <p className="mt-1 text-xs text-accent-red">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">Message</label>
                    <textarea id="message" rows={5} value={form.message} onChange={(e) => handleChange('message', e.target.value)} className={`${inputClass('message')} resize-none`} placeholder="Tell us more..." />
                    {errors.message && <p className="mt-1 text-xs text-accent-red">{errors.message}</p>}
                  </div>

                  <button type="submit" className="inline-flex items-center gap-2 bg-accent-green text-white px-7 py-3.5 rounded-lg font-medium hover:bg-accent-green/90 transition-colors text-sm">
                    Send Message
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="relative bg-white dark:bg-background-dark rounded-xl p-8 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.03]" aria-hidden="true" />
                <div className="relative space-y-8">
                  <div>
                    <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Contact Information</h2>
                    <p className="mt-2 text-sm text-text-muted">Reach out through any channel.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-text-light dark:text-text-dark">Address</h3>
                        <p className="mt-1 text-sm text-text-muted">National HQ, Abuja, Nigeria</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-text-light dark:text-text-dark">Email</h3>
                        <p className="mt-1 text-sm text-text-muted">info@obidients.com</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Follow Us</h3>
                    <div className="flex items-center gap-3">
                      <a href="https://x.com/ObidientUpdate" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-accent-green hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-secondary-light rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-text-light dark:text-text-dark">Office Hours</h3>
                    <div className="mt-2 space-y-1 text-sm text-text-muted">
                      <p>Monday – Friday: 9:00 AM – 5:00 PM</p>
                      <p>Saturday: 10:00 AM – 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FAQ ─────────────────────────────────────────── */}
      <FAQAccordion
        items={faqItems}
        label="Common Questions"
        title="Frequently asked questions"
      />
    </>
  );
};

export default ContactPage;
