import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '@/app/Screen';

export function TerminiPage() {
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl border-b border-line/70 pt-safe-top">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-ink">Termini di Servizio</h1>
        </div>
      </header>

      <Screen>
        <div className="space-y-6 pb-8">
          <div className="text-[13px] text-ink-3">
            Applicazione Cantieri — Legge applicabile: legge italiana
          </div>

          <section>
            <h2 className="text-[16px] font-bold mb-2">1. Accettazione</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Scaricando, installando o utilizzando l'applicazione <strong>Cantieri</strong>, l'utente
              dichiara di aver letto, compreso e accettato integralmente i presenti Termini di Servizio.
              L'utilizzo è consentito esclusivamente a soggetti maggiorenni che operano nell'ambito di
              attività professionali o imprenditoriali nel settore edile.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">2. Licenza d'uso</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Lo sviluppatore concede all'utente una licenza personale, non esclusiva, non trasferibile e
              revocabile per l'installazione e l'utilizzo dell'applicazione su dispositivi di proprietà
              o sotto il controllo dell'utente, per finalità strettamente professionali. È vietato
              sublicenziare, affittare, vendere o trasferire l'accesso all'applicazione a terzi.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">3. Utilizzo e obblighi dell'utente</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed mb-2">L'utente si impegna a:</p>
            <ul className="text-[14px] text-ink-2 space-y-1 list-disc list-inside">
              <li>Utilizzare l'applicazione in conformità alle leggi italiane ed europee vigenti</li>
              <li>Rispettare la normativa GDPR nel trattamento dei dati personali dei propri clienti</li>
              <li>
                Informare i propri clienti del trattamento dei loro dati prima di inserirli
                nell'applicazione
              </li>
              <li>Mantenere al sicuro il dispositivo su cui è installata l'applicazione</li>
              <li>Non tentare di decompilare, ingegnerizzare a ritroso o modificare l'applicazione</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">4. Firma elettronica — avvertenze legali</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              La firma raccolta tramite l'applicazione è una{' '}
              <strong>Firma Elettronica Semplice (FES)</strong> ai sensi del Regolamento UE 910/2014
              (eIDAS) e del D.Lgs. 82/2005. La FES ha valore probatorio ma può essere contestata con
              maggiore facilità rispetto a una Firma Elettronica Avanzata (FEA) o Qualificata (FEQ).
            </p>
            <p className="text-[14px] text-ink-2 leading-relaxed mt-2">
              Per massimizzare il valore probatorio del verbale, l'utente è responsabile di:
            </p>
            <ul className="text-[14px] text-ink-2 space-y-1 list-disc list-inside mt-1">
              <li>Identificare il cliente prima della firma (documento d'identità consigliato)</li>
              <li>Far leggere al cliente il verbale prima di farlo firmare</li>
              <li>Conservare il dispositivo in modo sicuro e non alterare i dati dopo la firma</li>
              <li>Inviare copia del verbale firmato al cliente via email o WhatsApp</li>
            </ul>
            <p className="text-[14px] text-ink-2 leading-relaxed mt-2">
              Per controversie di importo significativo, si raccomanda di affiancare alla firma digitale
              una firma cartacea o una FEA/FEQ tramite servizi certificati (es. DocuSign, Yousign).
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">5. Limitazione di responsabilità</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Lo sviluppatore non è responsabile per: la validità giuridica dei contratti conclusi tramite
              l'app; la perdita di dati in caso di guasto, smarrimento o furto del dispositivo; danni
              diretti o indiretti derivanti dall'utilizzo o dall'impossibilità di utilizzo dell'app;
              l'uso improprio della firma elettronica da parte dell'utente. L'applicazione è fornita
              "così com'è" (<em>as is</em>) senza garanzie di alcun tipo.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">6. Proprietà intellettuale e copyright</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              L'applicazione <strong>Cantieri</strong>, il suo design, il codice sorgente, il logo e tutti
              i contenuti originali sono protetti dalle leggi sul diritto d'autore (L. 633/1941 e
              successive modifiche) e sono di proprietà esclusiva dello sviluppatore.{' '}
              <strong>© 2025 [NOME / RAGIONE SOCIALE SVILUPPATORE]. Tutti i diritti riservati.</strong>{' '}
              È vietata qualsiasi riproduzione, distribuzione, modifica o utilizzo commerciale senza
              autorizzazione scritta.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">7. Aggiornamenti e modifiche</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Lo sviluppatore si riserva il diritto di modificare in qualsiasi momento i presenti Termini
              e le funzionalità dell'applicazione. Le modifiche sostanziali saranno notificate tramite
              aggiornamento dell'applicazione. Il continuato utilizzo dell'app dopo la notifica costituisce
              accettazione delle modifiche.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">8. Legge applicabile e foro competente</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              I presenti Termini sono regolati dalla <strong>legge italiana</strong>. Per qualsiasi
              controversia relativa all'interpretazione, validità o esecuzione dei presenti Termini è
              competente in via esclusiva il{' '}
              <strong>Tribunale di [CITTÀ SEDE LEGALE SVILUPPATORE]</strong>. L'utente consumatore ha
              diritto di adire il tribunale del proprio luogo di residenza ai sensi del Codice del
              Consumo (D.Lgs. 206/2005).
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">9. Contatti</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Per qualsiasi richiesta relativa ai presenti Termini o all'applicazione:{' '}
              <strong>[EMAIL DI CONTATTO]</strong>
            </p>
          </section>

          <div className="text-[12px] text-ink-3 border-t border-line pt-4">
            Versione 1.0 — Vigente dal{' '}
            {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </Screen>
    </>
  );
}
