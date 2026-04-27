import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function fadeInUp(
  element: HTMLElement,
  delay = 0,
  duration = 1
) {
  return gsap.fromTo(
    element,
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

export function fadeInLeft(
  element: HTMLElement,
  delay = 0,
  duration = 1
) {
  return gsap.fromTo(
    element,
    { x: -80, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

export function fadeInRight(
  element: HTMLElement,
  delay = 0,
  duration = 1
) {
  return gsap.fromTo(
    element,
    { x: 80, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

export function charReveal(element: HTMLElement) {
  const text = element.textContent || '';
  element.innerHTML = text
    .split('')
    .map(
      (char) =>
        `<span class="char" style="display:inline-block;opacity:0;transform:translateY(40px)">${char === ' ' ? '&nbsp;' : char}</span>`
    )
    .join('');

  const chars = element.querySelectorAll('.char');
  return gsap.to(chars, {
    opacity: 1,
    y: 0,
    stagger: 0.03,
    duration: 0.6,
    ease: 'power2.out',
  });
}

export function numberCountUp(
  element: HTMLElement,
  target: number,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
    },
  });
}

export function tiltCard(element: HTMLElement) {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;

    gsap.to(element, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

export function horizontalScroll(
  section: HTMLElement,
  panels: HTMLElement[]
) {
  const totalWidth = panels.reduce((acc, panel) => acc + panel.offsetWidth, 0);
  
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 1,
      end: () => `+=${totalWidth}`,
      snap: 1 / (panels.length - 1),
    },
  });
}

export function staggerReveal(
  elements: HTMLElement[],
  stagger = 0.1,
  delay = 0
) {
  return gsap.fromTo(
    elements,
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger,
      delay,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

export { gsap, ScrollTrigger };
