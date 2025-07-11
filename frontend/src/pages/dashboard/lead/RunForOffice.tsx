import { Link } from 'react-router';
import {
  FileText, MapPin, CheckCircle,
  ClipboardList, CalendarCheck, BrainCircuit,
  Wrench, Presentation, Clock, Check, ArrowRight, Users, Target, Zap
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
  link: string;
  status: 'ready' | 'coming-soon';
}

const features: Feature[] = [
  {
    title: 'Eligibility Checker',
    description: 'Find out if you or another candidate has what it takes to lead.',
    icon: <CheckCircle className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/eligibility',
    status: 'ready',
  },
  {
    title: 'New Class White Paper',
    description: 'A civic manifesto for aspiring leaders.',
    icon: <FileText className="w-6 h-6 text-[#006837]" />,
    link: 'https://drive.google.com/file/d/1_6qxnofDSeg8FPTbcpPdOq5On-g2PO0Q/view',
    status: 'ready',
  },
  {
    title: 'Office Explainers',
    description: 'Understand what each political role really does.',
    icon: <ClipboardList className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/explainers',
    status: 'coming-soon',
  },
  {
    title: 'Campaign Planner Toolkit',
    description: 'Resources to structure your campaign.',
    icon: <ClipboardList className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/planner',
    status: 'coming-soon',
  },
  {
    title: 'Voter Data + Ward Map',
    description: 'Insights for grassroots strategy.',
    icon: <MapPin className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/strategy-map',
    status: 'coming-soon',
  },
  {
    title: 'INEC Deadlines & Party Processes',
    description: 'Stay aligned with the timeline.',
    icon: <CalendarCheck className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/timeline',
    status: 'coming-soon',
  },
  {
    title: 'Manifesto Creation Support',
    description: 'Access Nigeria 2050 – Governance Agenda Blueprint.',
    icon: <Presentation className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/manifesto-support',
    status: 'coming-soon',
  },
  {
    title: 'Training & Capacity Building',
    description: 'Acquire the skills you need to govern effectively.',
    icon: <BrainCircuit className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/training',
    status: 'coming-soon',
  },
  {
    title: 'Get Technical Support',
    description: 'Fundraising, Mobilisation, Technology, Operations.',
    icon: <Wrench className="w-6 h-6 text-[#006837]" />,
    link: '/run-for-office/technical-support',
    status: 'coming-soon',
  },
];

const RunForOffice = () => {
  return (
    <section className="p-6 md:p-12 font-poppins bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Hero CTA Section */}
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-20 right-12 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-12 left-16 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full"></div>
          </div>

          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto text-center">
              {/* Main Heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Run for Office
              </h1>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-8">
                Ready to lead beyond your <span className="text-[#8cc63f]">Bloc</span>?
              </h2>

              {/* Key Points */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Target size={28} className="text-white" />
                  </div>
                  <p className="text-white text-sm md:text-base font-medium">
                    Submit your interest to run for local, state, or national office
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Zap size={28} className="text-white" />
                  </div>
                  <p className="text-white text-sm md:text-base font-medium">
                    Get access to training, tools, and campaign support
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Users size={28} className="text-white" />
                  </div>
                  <p className="text-white text-sm md:text-base font-medium">
                    Mobilise your Voting Bloc as your first campaign team
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://airtable.com/apppzNRujCOPHOs94/shrw5U5T2X5YuzkVo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#8cc63f] text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#7bb12f] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
                >
                  <span>🚀</span>
                  Submit Your Interest
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <p className="text-white/80 text-sm">
                  Join the next generation of Nigerian leaders
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-white/70">Aspiring Leaders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">36</div>
                  <div className="text-xs text-white/70">States Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-white/70">Support Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const isReady = feature.status === 'ready';

            const Card = () => (
              <div className="border rounded-lg p-6 bg-gray-50 hover:bg-white transition shadow relative overflow-hidden">
                {/* Status badge in top right */}
                {isReady ? (
                  <div className="absolute top-2 right-2 bg-[#006837]/10 text-[#006837] border-[#8cc63f]/20 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 border">
                    <Check className="w-3 h-3" /> Ready
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </div>
                )}


                {/* Card content */}
                <div className="flex items-center gap-3 mb-4 mt-2">
                  {feature.icon}
                  <h3 className={`text-lg font-semibold ${isReady ? 'text-[#006837] group-hover:underline' : 'text-[#006837]/80'}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${isReady ? 'text-gray-600' : 'text-gray-500'}`}>
                  {feature.description}
                </p>
              </div>
            );

            return isReady ? (
              <Link
                key={feature.title}
                to={feature.link}
                target={feature.link.startsWith('http') ? '_blank' : undefined}
                className="group"
              >
                <Card />
              </Link>
            ) : (
              <div key={feature.title} className="cursor-not-allowed opacity-90 group">
                <div className="filter grayscale-[15%]">
                  <Card />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RunForOffice;
