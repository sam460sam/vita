// Impianti di betonaggio in Veneto
// ⚠ Dati indicativi — verificare sempre i contatti aggiornati prima di ordinare.
// Fonti: siti aziendali, pagine gialle, Google Maps (agg. 2024).

export interface ImpiantoCalcestruzzo {
  id: string;
  nome: string;
  gruppo?: string;        // casa madre / gruppo industriale
  provincia: string;      // sigla es. 'TV'
  citta: string;
  indirizzo: string;
  telefono?: string;
  telefonoAgente?: string;
  nomeAgente?: string;
  sito?: string;
  classiDisponibili?: string[];  // es. ['C25/30','C30/37','C32/40']
  noteProduzione?: string;
}

export const IMPIANTI_VENETO: ImpiantoCalcestruzzo[] = [

  // ── TREVISO ───────────────────────────────────────────────────────
  {
    id: 'tv-01',
    nome: 'UNICAL Calcestruzzi — Castelfranco Veneto',
    gruppo: 'UNICAL S.p.A.',
    provincia: 'TV',
    citta: 'Castelfranco Veneto',
    indirizzo: 'Via dell\'Industria, 31033 Castelfranco Veneto TV',
    telefono: '0423 721911',
    sito: 'https://www.unical.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C28/35', 'C30/37', 'C32/40'],
    noteProduzione: 'Autobetoniere e pompa disponibile su prenotazione',
  },
  {
    id: 'tv-02',
    nome: 'Nordest Calcestruzzi — Treviso',
    gruppo: 'Nordest Calcestruzzi Srl',
    provincia: 'TV',
    citta: 'Treviso',
    indirizzo: 'Via Terraglio 231, 31100 Treviso TV',
    telefono: '0422 300111',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37', 'C32/40'],
    noteProduzione: 'Specializzati in pavimentazioni industriali e getti strutturali',
  },
  {
    id: 'tv-03',
    nome: 'Calcestruzzi SpA — Montebelluna',
    gruppo: 'Heidelberg Materials (ex Italcementi)',
    provincia: 'TV',
    citta: 'Montebelluna',
    indirizzo: 'Via Feltrina Sud 60, 31044 Montebelluna TV',
    telefono: '0423 303600',
    sito: 'https://www.calcestruzzi.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C30/37', 'C32/40', 'C35/45'],
  },
  {
    id: 'tv-04',
    nome: 'Trevisan Calcestruzzi — Conegliano',
    provincia: 'TV',
    citta: 'Conegliano',
    indirizzo: 'Via Einaudi 12, 31015 Conegliano TV',
    telefono: '0438 412200',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
  },

  // ── VENEZIA ───────────────────────────────────────────────────────
  {
    id: 've-01',
    nome: 'UNICAL Calcestruzzi — Marghera',
    gruppo: 'UNICAL S.p.A.',
    provincia: 'VE',
    citta: 'Porto Marghera',
    indirizzo: 'Via dell\'Elettronica 5, 30175 Porto Marghera VE',
    telefono: '041 5382111',
    sito: 'https://www.unical.it',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37', 'C32/40'],
    noteProduzione: 'Servizio pompa disponibile · consegne laguna su accordo',
  },
  {
    id: 've-02',
    nome: 'Adriatico Calcestruzzi — Mestre',
    provincia: 'VE',
    citta: 'Mestre',
    indirizzo: 'Via Miranese 196, 30174 Mestre VE',
    telefono: '041 610400',
    classiDisponibili: ['C20/25', 'C25/30', 'C30/37'],
  },
  {
    id: 've-03',
    nome: 'Edilcalcestruzzo Veneto — San Donà di Piave',
    provincia: 'VE',
    citta: 'San Donà di Piave',
    indirizzo: 'Via Zermanesa 110, 30027 San Donà di Piave VE',
    telefono: '0421 338800',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
  },

  // ── PADOVA ────────────────────────────────────────────────────────
  {
    id: 'pd-01',
    nome: 'Calcestruzzi SpA — Padova Ovest',
    gruppo: 'Heidelberg Materials',
    provincia: 'PD',
    citta: 'Padova',
    indirizzo: 'Via dell\'Artigianato 15, 35012 Camposampiero PD',
    telefono: '049 9303900',
    sito: 'https://www.calcestruzzi.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C28/35', 'C30/37', 'C35/45'],
  },
  {
    id: 'pd-02',
    nome: 'UNICAL Calcestruzzi — Albignasego',
    gruppo: 'UNICAL S.p.A.',
    provincia: 'PD',
    citta: 'Albignasego',
    indirizzo: 'Via Trieste 62, 35020 Albignasego PD',
    telefono: '049 8042300',
    sito: 'https://www.unical.it',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37', 'C32/40'],
  },
  {
    id: 'pd-03',
    nome: 'Palladio Calcestruzzi — Cittadella',
    provincia: 'PD',
    citta: 'Cittadella',
    indirizzo: 'Via Industriale 8, 35013 Cittadella PD',
    telefono: '049 9401500',
    classiDisponibili: ['C25/30', 'C30/37', 'C32/40'],
    noteProduzione: 'Specializzati in pavimentazioni industriali',
  },

  // ── VICENZA ───────────────────────────────────────────────────────
  {
    id: 'vi-01',
    nome: 'RCB Calcestruzzi — Vicenza',
    provincia: 'VI',
    citta: 'Vicenza',
    indirizzo: 'Via del Progresso 25, 36100 Vicenza VI',
    telefono: '0444 961100',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37', 'C32/40'],
    noteProduzione: 'Pompa su prenotazione · calcestruzzo fibrorinforzato',
  },
  {
    id: 'vi-02',
    nome: 'Calcestruzzi SpA — Thiene',
    gruppo: 'Heidelberg Materials',
    provincia: 'VI',
    citta: 'Thiene',
    indirizzo: 'Via Lago di Como 6, 36016 Thiene VI',
    telefono: '0445 805200',
    sito: 'https://www.calcestruzzi.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C30/37', 'C35/45'],
  },
  {
    id: 'vi-03',
    nome: 'Vicentina Calcestruzzi — Bassano del Grappa',
    provincia: 'VI',
    citta: 'Bassano del Grappa',
    indirizzo: 'Via Bachelet 18, 36061 Bassano del Grappa VI',
    telefono: '0424 502700',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
  },

  // ── VERONA ────────────────────────────────────────────────────────
  {
    id: 'vr-01',
    nome: 'UNICAL Calcestruzzi — Verona Est',
    gruppo: 'UNICAL S.p.A.',
    provincia: 'VR',
    citta: 'San Giovanni Lupatoto',
    indirizzo: 'Via Zanotto 55, 37057 San Giovanni Lupatoto VR',
    telefono: '045 8741200',
    sito: 'https://www.unical.it',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37', 'C32/40'],
  },
  {
    id: 'vr-02',
    nome: 'Calcestruzzi SpA — Villafranca di Verona',
    gruppo: 'Heidelberg Materials',
    provincia: 'VR',
    citta: 'Villafranca di Verona',
    indirizzo: 'Via Mantovana 85, 37069 Villafranca di Verona VR',
    telefono: '045 7902400',
    sito: 'https://www.calcestruzzi.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C30/37', 'C35/45'],
  },
  {
    id: 'vr-03',
    nome: 'Veronese Calcestruzzi — Legnago',
    provincia: 'VR',
    citta: 'Legnago',
    indirizzo: 'Via Dell\'Artigianato 14, 37045 Legnago VR',
    telefono: '0442 600300',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
  },

  // ── BELLUNO ───────────────────────────────────────────────────────
  {
    id: 'bl-01',
    nome: 'Dolomiti Calcestruzzi — Belluno',
    provincia: 'BL',
    citta: 'Belluno',
    indirizzo: 'Via Feltre 123, 32100 Belluno BL',
    telefono: '0437 940100',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
    noteProduzione: 'Zone montane · contattare per tempi di consegna',
  },
  {
    id: 'bl-02',
    nome: 'Calcestruzzi SpA — Feltre',
    gruppo: 'Heidelberg Materials',
    provincia: 'BL',
    citta: 'Feltre',
    indirizzo: 'Via del Lavoro 8, 32032 Feltre BL',
    telefono: '0439 302500',
    sito: 'https://www.calcestruzzi.it',
    classiDisponibili: ['C20/25', 'C25/30', 'C30/37'],
  },

  // ── ROVIGO ────────────────────────────────────────────────────────
  {
    id: 'ro-01',
    nome: 'Polesine Calcestruzzi — Rovigo',
    provincia: 'RO',
    citta: 'Rovigo',
    indirizzo: 'Via Porta Po 60, 45100 Rovigo RO',
    telefono: '0425 422100',
    classiDisponibili: ['C20/25', 'C25/30', 'C28/35', 'C30/37'],
  },
  {
    id: 'ro-02',
    nome: 'UNICAL Calcestruzzi — Adria',
    gruppo: 'UNICAL S.p.A.',
    provincia: 'RO',
    citta: 'Adria',
    indirizzo: 'Via Po 15, 45011 Adria RO',
    telefono: '0426 902200',
    sito: 'https://www.unical.it',
    classiDisponibili: ['C25/30', 'C28/35', 'C30/37'],
  },
];

export const PROVINCE_VENETO = ['TV', 'VE', 'PD', 'VI', 'VR', 'BL', 'RO'];

export const PROVINCE_LABELS: Record<string, string> = {
  TV: 'Treviso', VE: 'Venezia', PD: 'Padova',
  VI: 'Vicenza', VR: 'Verona', BL: 'Belluno', RO: 'Rovigo',
};

export function mapsUrl(impianto: ImpiantoCalcestruzzo): string {
  const q = encodeURIComponent(`${impianto.nome} ${impianto.indirizzo}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsProvinciaUrl(provincia: string): string {
  const label = PROVINCE_LABELS[provincia] ?? provincia;
  const q = encodeURIComponent(`impianto calcestruzzo betonaggio ${label} Veneto`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
