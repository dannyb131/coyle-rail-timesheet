import { useState, useCallback } from 'react';
import type { Timesheet } from './types/timesheet';
import { createEmptyTimesheet } from './types/timesheet';
import Home from './pages/Home';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import NewTimesheet from './pages/NewTimesheet';
import WizardPage from './pages/WizardPage';
import Review from './pages/Review';
import SignOff from './pages/SignOff';
import ExportPDF from './pages/ExportPDF';

export type Page =
  | { name: 'home' }
  | { name: 'new' }
  | { name: 'wizard'; timesheet: Timesheet }
  | { name: 'review'; timesheet: Timesheet }
  | { name: 'signoff'; timesheet: Timesheet }
  | { name: 'export'; timesheet: Timesheet };

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'home' });

  const navigate = useCallback((p: Page) => setPage(p), []);

  const headerTitle = (() => {
    switch (page.name) {
      case 'home': return 'Timesheets';
      case 'new': return 'New Timesheet';
      case 'wizard': return 'Enter Details';
      case 'review': return 'Review Timesheet';
      case 'signoff': return 'Sign-off';
      case 'export': return 'Export PDF';
    }
  })();

  const canGoBack = page.name !== 'home';

  const handleBack = () => {
    switch (page.name) {
      case 'new': navigate({ name: 'home' }); break;
      case 'wizard':
      case 'review':
      case 'signoff':
      case 'export':
        navigate({ name: 'home' }); break;
    }
  };

  const startWizard = (mode: 'single' | 'crew') => {
    navigate({ name: 'wizard', timesheet: createEmptyTimesheet(mode) });
  };

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {canGoBack && (
            <button className="back-btn" onClick={handleBack}>&larr; Back</button>
          )}
          <h1>{headerTitle}</h1>
        </div>
        {page.name !== 'home' && page.name !== 'new' && 'timesheet' in page && (
          <span className={`badge badge-${page.timesheet.status}`}>
            {page.timesheet.status}
          </span>
        )}
      </header>
      <div className="container">
        {page.name === 'home' && (
          <Home
            onNew={() => navigate({ name: 'new' })}
            onOpen={(ts) => navigate({ name: 'review', timesheet: ts })}
            onReview={(ts) => navigate({ name: 'review', timesheet: ts })}
          />
        )}
        {page.name === 'new' && (
          <NewTimesheet onSelectMode={startWizard} />
        )}
        {page.name === 'wizard' && (
          <WizardPage
            timesheet={page.timesheet}
            onComplete={(ts) => navigate({ name: 'review', timesheet: ts })}
            onCancel={() => navigate({ name: 'home' })}
          />
        )}
        {page.name === 'review' && (
          <Review
            timesheet={page.timesheet}
            onEdit={(ts) => navigate({
              name: 'wizard',
              timesheet: { ...ts, status: 'draft' as const },
            })}
            onSignOff={(ts) => navigate({ name: 'signoff', timesheet: ts })}
            onBack={() => navigate({ name: 'home' })}
          />
        )}
        {page.name === 'signoff' && (
          <SignOff
            timesheet={page.timesheet}
            onComplete={(ts) => navigate({ name: 'export', timesheet: ts })}
            onBack={() => navigate({ name: 'review', timesheet: page.timesheet })}
          />
        )}
        {page.name === 'export' && (
          <ExportPDF
            timesheet={page.timesheet}
            onBack={() => navigate({ name: 'home' })}
          />
        )}
      </div>
      <PwaInstallPrompt />
    </>
  );
}
