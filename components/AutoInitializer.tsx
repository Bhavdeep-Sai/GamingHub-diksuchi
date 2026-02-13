/**
 * Auto-initializer component
 * Runs initialization check on app startup
 */

'use client';

import { useEffect } from 'react';

export function AutoInitializer() {
  useEffect(() => {
    // Trigger initialization on app startup
    fetch('/api/init')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('✅ App initialization complete');
        } else {
          console.warn('⚠️ App initialization failed:', data.error);
        }
      })
      .catch(error => {
        console.warn('⚠️ App initialization error:', error);
      });
  }, []);

  return null; // This component renders nothing
}