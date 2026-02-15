import { useEffect } from 'react';
import { initializeUIFixes } from '@/utils/ui-fixes';
import AuthStateFix from '@/components/AuthStateFix';
import LayoutFix from '@/components/LayoutFix';
import NavigationFix from '@/components/NavigationFix';

export default function LayoutFixes() {
  useEffect(() => {
    // Initialize all UI fixes
    initializeUIFixes();
  }, []);

  return (
    <>
      <AuthStateFix />
      <LayoutFix />
      <NavigationFix isAuthenticated={false} />
    </>
  );
}
