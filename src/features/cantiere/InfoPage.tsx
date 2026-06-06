import { useNavigate } from 'react-router-dom';
import { ChevronRight, HardHat, Shield, FileText, Mail } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Divider } from '@/ui';

const VERSION = '1.0.0';

export function InfoPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Info" hideStella />
      <Screen>
        {/* App identity */}
        <div className="flex flex-col items-center py-8 mb-2">
          <div className="w-20 h-20 rounded-[22px] bg-slate-600 flex items-center justify-center mb-4 shadow-card-hover">
            <HardHat size={40} className="text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-ink">Cantieri</h1>
          <p className="text-[13px] text-ink-2 mt-1">Versione {VERSION}</p>
          <p className="text-[12px] text-ink-3 mt-0.5">© 2025 Samuele Gubert</p>
        </div>

        <p className="text-[14px] text-ink-2 text-center mb-6 leading-relaxed px-4">
          Gestisci cantieri, calcola il cemento, firma i verbali di consegna e tieni i tuoi operai in
          un'unica app — tutto offline, sul tuo dispositivo.
        </p>

        {/* Legal links */}
        <Card inset={false} className="overflow-hidden mb-4">
          <button
            onClick={() => navigate('/privacy')}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <Shield size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Informativa Privacy</div>
              <div className="text-[12px] text-ink-3">GDPR · eIDAS · D.Lgs. 82/2005</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <Divider />
          <button
            onClick={() => navigate('/termini')}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <FileText size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Termini di Servizio</div>
              <div className="text-[12px] text-ink-3">Legge italiana · Foro competente</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <Divider />
          <a
            href="mailto:gubertsamuele31@gmail.com"
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <Mail size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Contattaci</div>
              <div className="text-[12px] text-ink-3">gubertsamuele31@gmail.com</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </a>
        </Card>

        {/* Legal note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
          <p className="text-[13px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium mb-1">
            Nota sulla firma elettronica
          </p>
          <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
            La firma raccolta tramite verbale è una <strong>Firma Elettronica Semplice (FES)</strong> ai
            sensi del Regolamento UE 910/2014 (eIDAS). Ha valore probatorio in caso di contestazione.
            Per lavori di importo significativo, valuta di affiancarla a una firma cartacea.
          </p>
        </div>

        <div className="text-center text-[11px] text-ink-3 pb-4">
          Tutti i dati sono salvati solo sul tuo dispositivo. Nessun cloud, nessun account.
        </div>
      </Screen>
    </>
  );
}
