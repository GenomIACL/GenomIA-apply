import type { MouseEvent } from 'react';

export const ABOUT_ID = 'que-es-genomia';
export const TEAM_ID = 'quienes-somos';

/**
 * Desplaza la página hasta la sección con ese id usando scroll suave.
 * Si el id no existe, baja a la sección que sigue al hero para que el clic
 * nunca quede sin efecto. Respeta prefers-reduced-motion.
 */
export function scrollToSection(event: MouseEvent<HTMLElement>, id: string) {
  const target =
    document.getElementById(id) ??
    document.querySelector('.hero')?.nextElementSibling;

  if (!target) return;

  event.preventDefault();

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}