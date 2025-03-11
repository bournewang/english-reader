'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

export function NavigationWrapper() {
  const pathname = usePathname();
  const showNav = pathname !== '/url-reader';

  return showNav ? <Navigation /> : null;
} 