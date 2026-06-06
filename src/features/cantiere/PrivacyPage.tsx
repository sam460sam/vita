import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '@/app/Screen';

export function PrivacyPage() {
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
          <h1 className="text-[18px] font-semibold text-ink">Informativa Privacy</h1>
        </div>
      </header>

      <Screen>
        <div className="prose prose-sm max-w-none text-ink space-y-6 pb-8">
          <div className="text-[13px] text-ink-3 mb-2">
            Ai sensi degli artt. 13–14 Regolamento UE 2016/679 (GDPR) e D.Lgs. 196/2003 s.m.i.
          </div>

          <section>
            <h2 className="text-[16px] font-bold mb-2">1. Titolare del trattamento</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Il titolare del trattamento è l'operatore (imprenditore edile, artigiano o professionista) che
              installa e utilizza l'applicazione <strong>Cantieri</strong> sul proprio dispositivo. Il
              titolare è responsabile del trattamento dei dati personali dei propri clienti raccolti
              tramite l'applicazione.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">2. Dati personali trattati</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed mb-2">L'applicazione tratta i seguenti dati:</p>
            <ul className="text-[14px] text-ink-2 space-y-1 list-disc list-inside">
              <li>Nome e cognome / ragione sociale del cliente</li>
              <li>Numero di telefono</li>
              <li>Indirizzo del cantiere</li>
              <li>Fotografie del lavoro eseguito</li>
              <li>Firma elettronica del cliente</li>
              <li>Importi e condizioni economiche concordate</li>
              <li>Note e informazioni relative al cantiere</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">3. Finalità e base giuridica</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              I dati sono trattati esclusivamente per la gestione dei rapporti contrattuali con i clienti
              (art. 6(1)(b) GDPR — esecuzione del contratto) e per l'adempimento di obblighi legali e
              fiscali (art. 6(1)(c) GDPR). Non vengono effettuati trattamenti per finalità di marketing,
              profilazione o cessione a terzi.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">4. Conservazione e sicurezza dei dati</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              <strong>Tutti i dati sono conservati esclusivamente sul dispositivo dell'utente</strong>{' '}
              (memoria locale / IndexedDB). Nessun dato viene trasmesso a server esterni, servizi cloud o
              terze parti. La cancellazione avviene ad esclusiva discrezione del titolare. Si raccomanda
              di proteggere il dispositivo con PIN, Face ID o impronta digitale e di eseguire backup
              periodici tramite la funzione di esportazione dell'app.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">5. Diritti degli interessati (clienti)</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed mb-2">
              I clienti i cui dati sono trattati hanno il diritto di:
            </p>
            <ul className="text-[14px] text-ink-2 space-y-1 list-disc list-inside">
              <li>Accesso ai propri dati (art. 15 GDPR)</li>
              <li>Rettifica di dati inesatti (art. 16 GDPR)</li>
              <li>Cancellazione ("diritto all'oblio", art. 17 GDPR)</li>
              <li>Limitazione del trattamento (art. 18 GDPR)</li>
              <li>Portabilità dei dati (art. 20 GDPR)</li>
              <li>Opposizione al trattamento (art. 21 GDPR)</li>
            </ul>
            <p className="text-[14px] text-ink-2 leading-relaxed mt-2">
              Per esercitare tali diritti, i clienti devono rivolgersi direttamente al titolare del
              trattamento (l'operatore che utilizza l'app).
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">6. Firma elettronica e verbale di consegna</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              La firma raccolta tramite l'applicazione costituisce{' '}
              <strong>Firma Elettronica Semplice (FES)</strong> ai sensi del Regolamento UE 910/2014
              (eIDAS) e del D.Lgs. 82/2005 (CAD — Codice dell'Amministrazione Digitale). Il verbale
              firmato include data e ora della firma, nome del firmatario dichiarato e descrizione del
              lavoro, e ha valore probatorio in caso di contestazione. Il titolare è responsabile di
              identificare correttamente il cliente prima della firma.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">7. Nessuna trasmissione a terzi</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              L'applicazione non trasmette dati personali a terzi, non utilizza cookie di tracciamento,
              non integra SDK di analytics e non effettua trasferimenti di dati al di fuori del
              dispositivo dell'utente. Non avviene alcun trasferimento verso Paesi extra-UE.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">8. Reclamo al Garante</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              Gli interessati hanno il diritto di proporre reclamo al{' '}
              <strong>Garante per la Protezione dei Dati Personali</strong> (
              <a href="https://www.garanteprivacy.it" className="text-slate-600 underline">
                www.garanteprivacy.it
              </a>
              , Piazza Venezia 11, Roma).
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold mb-2">9. Sviluppatore dell'applicazione</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              L'applicazione <strong>Cantieri</strong> è sviluppata e distribuita da{' '}
              <strong>Samuele Gubert</strong>, Castelfranco Veneto (TV). Per informazioni:{' '}
              <strong>gubertsamuele31@gmail.com</strong>. Lo sviluppatore agisce come responsabile del
              trattamento limitatamente ai dati tecnici necessari per il funzionamento dell'app sul
              dispositivo.
            </p>
          </section>

          <div className="text-[12px] text-ink-3 border-t border-line pt-4">
            Versione 1.0 — Aggiornata il {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      </Screen>
    </>
  );
}
