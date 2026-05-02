'use client';

import { useEffect } from 'react';

export function BackendWakeUp() {
  useEffect(() => {
    fetch('/api/health').catch(() => {});
  }, []);

  return null;
}
