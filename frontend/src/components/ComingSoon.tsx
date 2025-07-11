import { Clock } from "lucide-react";

export default function ComingSoon() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-poppins">
      <div className="bg-white max-w-xl w-full p-8 rounded-2xl border text-center">
        {/* Icon / Animation */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#e6f4ea] rounded-full">
          <Clock className="w-10 h-10 text-[#006837]" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-[#006837] mb-3">Coming Soon</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          This feature isn’t available yet — but we’re working on it! Check back soon for updates, or explore other parts of the platform.
        </p>


      </div>
    </section>
  );
}
