import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import './Marquee.css';

type MarqueeProps = {
  children: ReactNode;
  /** Copies of the content; enough to cover the widest viewport plus one. */
  repeat?: number;
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Copies stay clickable (most of what's on screen is a copy) but are hidden from
 * assistive tech and the tab order, so each item is announced and focused once.
 */
function visualCopy(children: ReactNode) {
  return Children.map(children, (child) =>
    isValidElement<{ tabIndex?: number }>(child) ? cloneElement(child, { tabIndex: -1 }) : child,
  );
}

/** Infinite horizontal marquee, ported from Magic UI's Marquee to plain CSS. */
export default function Marquee({
  children,
  repeat = 6,
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  return (
    <div className={`marquee${pauseOnHover ? ' marquee--pause' : ''} ${className}`}>
      {Array.from({ length: repeat }, (_, i) => (
        <div key={i} className="marquee__group" aria-hidden={i > 0 || undefined}>
          {i === 0 ? children : visualCopy(children)}
        </div>
      ))}
    </div>
  );
}
