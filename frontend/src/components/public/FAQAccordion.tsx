import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQAccordion = ({ items, title, label }: { items: FAQItem[]; title?: string; label?: string }) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {(label || title) && (
          <div className="text-center mb-12">
            {label && (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                {label}
                <span className="w-8 h-px bg-accent-green" />
              </span>
            )}
            {title && (
              <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:border-accent-green/30 transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-medium text-text-light dark:text-text-dark pr-4">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-accent-green flex-shrink-0 transition-transform duration-300 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
