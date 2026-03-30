import { useState, useRef, type FormEvent } from 'react';
import SEOHead from '../../components/public/SEOHead';

interface FormState {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  _hp: string; // honeypot field
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  subject: '',
  message: '',
  _hp: '',
};

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

    // Anti-spam: reject if honeypot filled or form submitted too fast (< 3 seconds)
    if (form._hp || Date.now() - loadTimeRef.current < 3000) return;

    if (!validate()) return;
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <>
      <SEOHead
        title="Contact Us — Obidient Movement"
        description="Get in touch with the Obidient Movement. Reach out for inquiries, partnerships, or support."
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 lg:mb-16">
            <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
              Contact Us
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-medium tracking-tight text-text-light dark:text-text-dark">
              Get in touch
            </h1>
            <p className="mt-4 text-base text-text-muted leading-relaxed max-w-lg">
              Have questions, feedback, or want to partner with us? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-accent-green/5 border border-accent-green/20 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-text-light dark:text-text-dark">
                    Thank you!
                  </h2>
                  <p className="mt-2 text-text-muted">
                    Your message has been received. We'll get back to you soon.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(initialForm);
                      loadTimeRef.current = Date.now();
                    }}
                    className="mt-6 text-sm font-medium text-accent-green hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Honeypot — hidden from real users */}
                  <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10" aria-hidden="true">
                    <label htmlFor="contact-hp">Leave blank</label>
                    <input
                      id="contact-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form._hp}
                      onChange={(e) => handleChange('_hp', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-secondary-light text-text-light dark:text-text-dark placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 transition ${
                        errors.fullName ? 'border-accent-red' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-accent-red">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-secondary-light text-text-light dark:text-text-dark placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 transition ${
                        errors.email ? 'border-accent-red' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-accent-red">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-secondary-light text-text-light dark:text-text-dark placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 transition ${
                        errors.subject ? 'border-accent-red' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      placeholder="What is this about?"
                    />
                    {errors.subject && <p className="mt-1 text-xs text-accent-red">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-secondary-light text-text-light dark:text-text-dark placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 transition resize-none ${
                        errors.message ? 'border-accent-red' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      placeholder="Tell us more..."
                    />
                    {errors.message && <p className="mt-1 text-xs text-accent-red">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-accent-green text-white px-7 py-3.5 rounded-lg font-medium hover:bg-accent-green/90 transition-colors text-sm"
                  >
                    Send Message
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

            {/* Right: Contact Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-secondary-light/50 rounded-xl p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Contact Information</h2>
                  <p className="mt-2 text-sm text-text-muted">
                    Reach out through any of these channels and we'll respond promptly.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Address */}
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

                  {/* Email */}
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

                {/* Social */}
                <div>
                  <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Follow Us</h3>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://x.com/ObidientUpdate"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X (Twitter)"
                      className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-accent-green hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Office Hours Card */}
                <div className="bg-white dark:bg-background-dark rounded-lg p-5 border border-gray-100 dark:border-gray-700">
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
      </section>
    </>
  );
};

export default ContactPage;
