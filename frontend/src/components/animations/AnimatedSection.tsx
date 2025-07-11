import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Delay in seconds
  duration?: number; // Animation duration in seconds
  startY?: number; // Starting Y position offset (e.g., 50 for 50px up)
  stagger?: number; // Stagger effect for children
  triggerStart?: string; // ScrollTrigger start position (e.g., "top 80%")
  childrenSelector?: string; // Selector for children to animate
}

const AnimatedSection = ({
  children,
  className = '',
  delay = 0.2,
  duration = 0.8,
  startY = 30,
  stagger = 0.1,
  triggerStart = 'top 80%',
  childrenSelector
}: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // For individual children animation
    if (childrenSelector) {
      const children = section.querySelectorAll(childrenSelector);

      gsap.fromTo(
        children,
        {
          y: startY,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          scrollTrigger: {
            trigger: section,
            start: triggerStart,
            toggleActions: 'play none none none'
          }
        }
      );
    }
    // For the entire section animation
    else {
      gsap.fromTo(
        section,
        {
          y: startY,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          scrollTrigger: {
            trigger: section,
            start: triggerStart,
            toggleActions: 'play none none none'
          }
        }
      );
    }

    return () => {
      // Cleanup scroll triggers when component unmounts
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [delay, duration, startY, stagger, triggerStart, childrenSelector]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedSection;
