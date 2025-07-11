import TopLogo from './TopLogo';

export default function Loading() {
  return (
    <div className='flex flex-col items-center justify-center min-h-full py-8'>
      {/* Animated Logo Container */}
      <div className='relative mb-8 logo-container'>
        {/* Main Logo with Fade In Animation */}
        <div className='animate-fade-in-up '>
          <TopLogo />
        </div>

        {/* Subtle Glow Effect */}
        <div className='absolute inset-0 -z-10 animate-pulse opacity-10'>
          <div className='w-full h-full bg-gradient-to-r from-[#006837]/30 to-[#008844]/30 blur-xl'></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className='mb-6 animate-fade-in-delayed'>
        <p className='text-[#006837] font-medium text-lg tracking-wide'>Loading...</p>
      </div>

      {/* Enhanced Loading Animation */}
      <div className='flex items-center gap-1'>
        <div className='w-2 h-2 bg-[#006837] rounded-full animate-bounce-delayed-1'></div>
        <div className='w-2 h-2 bg-[#008844] rounded-full animate-bounce-delayed-2'></div>
        <div className='w-2 h-2 bg-[#006837] rounded-full animate-bounce-delayed-3'></div>
        <div className='w-2 h-2 bg-[#008844] rounded-full animate-bounce-delayed-4'></div>
      </div>

      {/* Progress Bar */}
      <div className='w-48 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden'>
        <div className='h-full bg-gradient-to-r from-[#006837] to-[#008844] rounded-full animate-progress-bar'></div>
      </div>
    </div>
  )
}
