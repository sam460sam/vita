export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export interface PQuestion {
  id: number;
  it: string;
  en: string;
  axis: Axis;
  dir: 1 | -1;
}

export interface PTypeText {
  name: string;
  tagline: string;
  summary: string;
  strengths: string[];
  growth: string[];
  work: string;
  relationships: string;
  famousTraits: string;
  stress: string;
  careers: string[];
}

export interface PType {
  code: string;
  accent: string;
  it: PTypeText;
  en: PTypeText;
}

// ---------------------------------------------------------------------------
// QUESTIONS
// 48 total, 12 per axis. Scoring: sum of (answer - 3) * dir per axis.
// Positive total selects the POSITIVE pole.
//   EI: + = E (Extraversion), - = I (Introversion)
//   SN: + = N (Intuition),     - = S (Sensing)
//   TF: + = F (Feeling),       - = T (Thinking)
//   JP: + = J (Judging),       - = P (Perceiving)
// ---------------------------------------------------------------------------

export const QUESTIONS: PQuestion[] = [
  // ---- EI (12) : 6 toward E (dir 1), 6 toward I (dir -1) ----
  {
    id: 1,
    it: 'Dopo una serata con tante persone mi sento ricaricato di energia.',
    en: 'After an evening with lots of people I feel recharged with energy.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 2,
    it: 'Mi viene naturale avviare una conversazione con uno sconosciuto.',
    en: 'It comes naturally to me to start a conversation with a stranger.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 3,
    it: 'Preferisco pensare ad alta voce piuttosto che riflettere in silenzio.',
    en: 'I prefer thinking out loud rather than reflecting in silence.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 4,
    it: 'In un gruppo numeroso prendo facilmente la parola.',
    en: 'In a large group I speak up easily.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 5,
    it: 'Cerco spesso compagnia quando ho del tempo libero.',
    en: 'I often seek out company when I have free time.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 6,
    it: 'Mi sento a mio agio nell’essere al centro dell’attenzione.',
    en: 'I feel comfortable being the center of attention.',
    axis: 'EI',
    dir: 1,
  },
  {
    id: 7,
    it: 'Dopo molte ore in mezzo alla gente ho bisogno di restare da solo per ricaricarmi.',
    en: 'After many hours among people I need time alone to recharge.',
    axis: 'EI',
    dir: -1,
  },
  {
    id: 8,
    it: 'Preferisco una conversazione profonda con una persona a una festa affollata.',
    en: 'I prefer a deep conversation with one person over a crowded party.',
    axis: 'EI',
    dir: -1,
  },
  {
    id: 9,
    it: 'Tendo a riflettere a lungo prima di esprimere un pensiero.',
    en: 'I tend to reflect for a while before voicing a thought.',
    axis: 'EI',
    dir: -1,
  },
  {
    id: 10,
    it: 'Trovo faticoso essere circondato da persone per molto tempo.',
    en: 'I find it draining to be surrounded by people for a long time.',
    axis: 'EI',
    dir: -1,
  },
  {
    id: 11,
    it: 'Preferisco lavorare in tranquillità, lontano dal trambusto.',
    en: 'I prefer to work quietly, away from the bustle.',
    axis: 'EI',
    dir: -1,
  },
  {
    id: 12,
    it: 'Custodisco una vita interiore ricca che condivido solo con pochi.',
    en: 'I keep a rich inner world that I share with only a few.',
    axis: 'EI',
    dir: -1,
  },

  // ---- SN (12) : 6 toward N (dir 1), 6 toward S (dir -1) ----
  {
    id: 13,
    it: 'Mi affascina immaginare possibilità future più che osservare il presente.',
    en: 'I am fascinated by imagining future possibilities more than observing the present.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 14,
    it: 'Quando ascolto un’idea cerco subito i significati nascosti.',
    en: 'When I hear an idea I immediately look for the hidden meanings.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 15,
    it: 'Mi attraggono i concetti astratti e le teorie.',
    en: 'I am drawn to abstract concepts and theories.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 16,
    it: 'Mi capita spesso di collegare idee lontane tra loro.',
    en: 'I often connect ideas that seem far apart.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 17,
    it: 'Mi annoio quando devo occuparmi troppo a lungo di dettagli pratici.',
    en: 'I get bored when I have to deal with practical details for too long.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 18,
    it: 'Mi piace fantasticare su come le cose potrebbero essere diverse.',
    en: 'I enjoy daydreaming about how things could be different.',
    axis: 'SN',
    dir: 1,
  },
  {
    id: 19,
    it: 'Mi concentro sui fatti concreti più che sulle possibilità astratte.',
    en: 'I focus on concrete facts more than abstract possibilities.',
    axis: 'SN',
    dir: -1,
  },
  {
    id: 20,
    it: 'Mi fido di ciò che posso osservare e verificare direttamente.',
    en: 'I trust what I can observe and verify directly.',
    axis: 'SN',
    dir: -1,
  },
  {
    id: 21,
    it: 'Preferisco istruzioni chiare e passaggi pratici alle idee generali.',
    en: 'I prefer clear instructions and practical steps over general ideas.',
    axis: 'SN',
    dir: -1,
  },
  {
    id: 22,
    it: 'Noto facilmente i particolari concreti dell’ambiente intorno a me.',
    en: 'I easily notice the concrete details of my surroundings.',
    axis: 'SN',
    dir: -1,
  },
  {
    id: 23,
    it: 'Mi sento più a mio agio con metodi collaudati che con sperimentazioni.',
    en: 'I feel more comfortable with proven methods than with experiments.',
    axis: 'SN',
    dir: -1,
  },
  {
    id: 24,
    it: 'Quando descrivo qualcosa resto ancorato ai fatti reali.',
    en: 'When I describe something I stay anchored to the real facts.',
    axis: 'SN',
    dir: -1,
  },

  // ---- TF (12) : 6 toward F (dir 1), 6 toward T (dir -1) ----
  {
    id: 25,
    it: 'Quando devo decidere do molto peso a come le persone si sentiranno.',
    en: 'When I make a decision I give a lot of weight to how people will feel.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 26,
    it: 'Percepisco con facilità lo stato d’animo di chi mi sta intorno.',
    en: 'I easily sense the mood of those around me.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 27,
    it: 'Preferisco mantenere l’armonia piuttosto che avere ragione in una discussione.',
    en: 'I prefer keeping harmony over being right in an argument.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 28,
    it: 'Mi commuovo facilmente per le storie altrui.',
    en: 'I am easily moved by other people’s stories.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 29,
    it: 'Quando un amico ha un problema, prima lo conforto e poi cerco soluzioni.',
    en: 'When a friend has a problem, I comfort them first and look for solutions later.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 30,
    it: 'Giudico una scelta soprattutto dall’impatto che ha sulle persone.',
    en: 'I judge a choice mainly by the impact it has on people.',
    axis: 'TF',
    dir: 1,
  },
  {
    id: 31,
    it: 'Nelle decisioni faccio prevalere la logica sulle emozioni.',
    en: 'In decisions I let logic prevail over emotions.',
    axis: 'TF',
    dir: -1,
  },
  {
    id: 32,
    it: 'Trovo più convincente un argomento coerente che un appello ai sentimenti.',
    en: 'I find a consistent argument more convincing than an appeal to feelings.',
    axis: 'TF',
    dir: -1,
  },
  {
    id: 33,
    it: 'Preferisco una critica sincera a un complimento di circostanza.',
    en: 'I prefer honest criticism to a polite compliment.',
    axis: 'TF',
    dir: -1,
  },
  {
    id: 34,
    it: 'Riesco a restare distaccato e obiettivo anche in situazioni cariche di emozioni.',
    en: 'I can stay detached and objective even in emotionally charged situations.',
    axis: 'TF',
    dir: -1,
  },
  {
    id: 35,
    it: 'Valuto le idee in base alla loro coerenza più che alla loro popolarità.',
    en: 'I evaluate ideas by their consistency more than their popularity.',
    axis: 'TF',
    dir: -1,
  },
  {
    id: 36,
    it: 'Tendo ad analizzare un problema con freddezza, mettendo da parte i sentimenti.',
    en: 'I tend to analyze a problem coolly, setting feelings aside.',
    axis: 'TF',
    dir: -1,
  },

  // ---- JP (12) : 6 toward J (dir 1), 6 toward P (dir -1) ----
  {
    id: 37,
    it: 'Preferisco pianificare le cose con largo anticipo.',
    en: 'I prefer to plan things well in advance.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 38,
    it: 'Mi sento più sereno quando ho una lista chiara di cose da fare.',
    en: 'I feel calmer when I have a clear to-do list.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 39,
    it: 'Mi piace concludere un compito prima di passare al successivo.',
    en: 'I like to finish a task before moving on to the next.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 40,
    it: 'Tengo in ordine i miei spazi e i miei impegni.',
    en: 'I keep my spaces and commitments tidy.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 41,
    it: 'Rispettare le scadenze è per me molto importante.',
    en: 'Meeting deadlines is very important to me.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 42,
    it: 'Preferisco prendere una decisione e chiudere la questione.',
    en: 'I prefer to make a decision and settle the matter.',
    axis: 'JP',
    dir: 1,
  },
  {
    id: 43,
    it: 'Mi piace lasciare le mie opzioni aperte il più a lungo possibile.',
    en: 'I like to keep my options open as long as possible.',
    axis: 'JP',
    dir: -1,
  },
  {
    id: 44,
    it: 'Lavoro meglio sotto la spinta dell’ultimo momento.',
    en: 'I work best under last-minute pressure.',
    axis: 'JP',
    dir: -1,
  },
  {
    id: 45,
    it: 'Preferisco adattarmi al momento piuttosto che seguire un programma rigido.',
    en: 'I prefer to adapt in the moment rather than follow a rigid schedule.',
    axis: 'JP',
    dir: -1,
  },
  {
    id: 46,
    it: 'Trovo soffocanti le routine troppo strutturate.',
    en: 'I find overly structured routines stifling.',
    axis: 'JP',
    dir: -1,
  },
  {
    id: 47,
    it: 'Mi piace improvvisare e cambiare i piani all’ultimo.',
    en: 'I enjoy improvising and changing plans at the last minute.',
    axis: 'JP',
    dir: -1,
  },
  {
    id: 48,
    it: 'Preferisco tenere aperte più possibilità anziché impegnarmi subito su una sola.',
    en: 'I prefer to keep several possibilities open rather than commit to one right away.',
    axis: 'JP',
    dir: -1,
  },
];

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export const TYPES: Record<string, PType> = {
  INTJ: {
    code: 'INTJ',
    accent: '#4338CA',
    it: {
      name: 'L’Architetto della Visione',
      tagline: 'Costruisce il futuro un sistema alla volta.',
      summary:
        'Vedi il mondo come un insieme di sistemi che possono essere capiti e migliorati. Pianifichi a lungo termine con una lucidità che pochi possiedono e raramente ti accontenti della prima risposta.',
      strengths: [
        'Pensiero strategico capace di anticipare gli ostacoli con anni di anticipo.',
        'Indipendenza intellettuale: arrivi alle tue conclusioni senza bisogno di approvazione.',
        'Determinazione silenziosa nel portare a termine progetti complessi.',
        'Capacità di distillare il caos in un piano chiaro e ordinato.',
      ],
      growth: [
        'Imparare a esprimere ciò che senti, non solo ciò che pensi.',
        'Concedere agli altri il tempo di arrivare alle tue stesse conclusioni.',
        'Accettare che non ogni dettaglio debba essere perfetto per agire.',
      ],
      work:
        'Dai il meglio in ruoli che premiano la strategia e l’autonomia. Hai bisogno di spazio per pensare e di obiettivi che valgano la tua intensità; la microgestione ti spegne.',
      relationships:
        'Sei leale e profondo, ma selettivo. Apri il tuo mondo interiore a poche persone fidate e apprezzi chi rispetta la tua indipendenza tanto quanto la tua mente.',
      famousTraits:
        'Agli altri appari calmo, riservato e sorprendentemente sicuro. Parli poco, ma quando lo fai le tue parole hanno peso.',
      stress:
        'Sotto pressione tendi a chiuderti, a iper-analizzare e a diventare critico verso te stesso e gli altri quando i tuoi piani vengono scompaginati. Ritagliati uno spazio di silenzio per riordinare le idee, poi scegli un solo passo concreto invece di voler controllare tutto.',
      careers: [
        'Stratega',
        'Architetto di sistemi',
        'Ricercatore',
        'Analista finanziario',
        'Consulente strategico',
      ],
    },
    en: {
      name: 'The Vision Architect',
      tagline: 'Builds the future one system at a time.',
      summary:
        'You see the world as a set of systems that can be understood and improved. You plan for the long term with a clarity few possess and rarely settle for the first answer.',
      strengths: [
        'Strategic thinking that anticipates obstacles years ahead.',
        'Intellectual independence: you reach your own conclusions without needing approval.',
        'Quiet determination in seeing complex projects through.',
        'An ability to distill chaos into a clear, ordered plan.',
      ],
      growth: [
        'Learning to voice what you feel, not only what you think.',
        'Giving others time to arrive at the conclusions you reach quickly.',
        'Accepting that not every detail must be perfect before you act.',
      ],
      work:
        'You thrive in roles that reward strategy and autonomy. You need room to think and goals worthy of your intensity; micromanagement drains you.',
      relationships:
        'You are loyal and deep, but selective. You open your inner world to a trusted few and value those who respect your independence as much as your mind.',
      famousTraits:
        'You come across as calm, reserved and surprisingly self-assured. You speak little, but when you do your words carry weight.',
      stress:
        'Under pressure you tend to withdraw, over-analyze and turn critical toward yourself and others when your plans are disrupted. Carve out a quiet space to reorder your thoughts, then choose a single concrete step instead of trying to control everything.',
      careers: [
        'Strategist',
        'Systems architect',
        'Researcher',
        'Financial analyst',
        'Strategy consultant',
      ],
    },
  },

  INTP: {
    code: 'INTP',
    accent: '#6366F1',
    it: {
      name: 'L’Esploratore delle Idee',
      tagline: 'Vive per il piacere di capire come funziona tutto.',
      summary:
        'La tua mente è un laboratorio sempre acceso, curioso di smontare ogni idea per vedere cosa la tiene insieme. Ti interessa la verità più della comodità e ami i problemi che gli altri trovano troppo difficili.',
      strengths: [
        'Analisi logica rigorosa che individua le incoerenze al volo.',
        'Curiosità inesauribile per come e perché le cose funzionano.',
        'Originalità nel proporre soluzioni che nessun altro ha considerato.',
        'Apertura mentale verso idee nuove e punti di vista insoliti.',
      ],
      growth: [
        'Trasformare le idee brillanti in azioni concrete e finite.',
        'Dare valore alle emozioni proprie e altrui, non solo alla logica.',
        'Evitare di perderti in infinite analisi rimandando le decisioni.',
      ],
      work:
        'Prosperi dove puoi esplorare problemi complessi senza vincoli rigidi. La libertà di seguire la tua curiosità conta più del prestigio o della routine.',
      relationships:
        'Ti leghi a chi sa stimolare la tua mente con conversazioni autentiche. Sei sincero e poco interessato alle convenzioni sociali, e apprezzi partner che rispettano il tuo bisogno di spazio mentale.',
      famousTraits:
        'Sembri distratto e assorto nei tuoi pensieri, ma ti illumini quando una conversazione tocca un’idea che ti incuriosisce davvero.',
      stress:
        'Quando la pressione cresce ti rifugi nella testa, rimugini all’infinito e rimandi le decisioni finché la tensione esplode in irritazione. Fissa una scadenza ragionevole e parla con qualcuno di fidato: dare voce ai pensieri li alleggerisce più di mille analisi solitarie.',
      careers: [
        'Sviluppatore software',
        'Data scientist',
        'Ricercatore',
        'Analista di sistemi',
        'Progettista UX',
      ],
    },
    en: {
      name: 'The Idea Explorer',
      tagline: 'Lives for the joy of understanding how everything works.',
      summary:
        'Your mind is a laboratory that never shuts off, eager to take apart any idea to see what holds it together. You care about truth more than comfort and love the problems others find too hard.',
      strengths: [
        'Rigorous logical analysis that spots inconsistencies instantly.',
        'Inexhaustible curiosity about how and why things work.',
        'Originality in proposing solutions no one else considered.',
        'An open mind toward new ideas and unusual perspectives.',
      ],
      growth: [
        'Turning brilliant ideas into concrete, finished action.',
        'Valuing your own and others’ emotions, not only logic.',
        'Avoiding endless analysis that delays your decisions.',
      ],
      work:
        'You thrive where you can explore complex problems without rigid constraints. The freedom to follow your curiosity matters more than prestige or routine.',
      relationships:
        'You bond with people who stimulate your mind through genuine conversation. You are candid and indifferent to social convention, and you value partners who respect your need for mental space.',
      famousTraits:
        'You seem distracted and lost in thought, yet you light up when a conversation touches an idea that truly intrigues you.',
      stress:
        'When pressure builds you retreat into your head, ruminate endlessly and delay decisions until the tension erupts as irritation. Set a reasonable deadline and talk to someone you trust: voicing your thoughts lightens them more than any amount of solitary analysis.',
      careers: [
        'Software developer',
        'Data scientist',
        'Researcher',
        'Systems analyst',
        'UX designer',
      ],
    },
  },

  ENTJ: {
    code: 'ENTJ',
    accent: '#B91C1C',
    it: {
      name: 'Il Comandante Strategico',
      tagline: 'Vede la meta e traccia subito la rotta.',
      summary:
        'Sei un leader naturale che trasforma le visioni in piani d’azione e gli ostacoli in passi successivi. Hai un istinto per l’efficienza e una fiducia che spinge interi gruppi a muoversi.',
      strengths: [
        'Leadership decisa che dà direzione e ritmo a chi ti circonda.',
        'Visione strategica unita a un’esecuzione concreta e rapida.',
        'Sicurezza nel prendere decisioni difficili sotto pressione.',
        'Capacità di organizzare persone e risorse verso un obiettivo chiaro.',
      ],
      growth: [
        'Ascoltare le idee altrui prima di imporre la tua direzione.',
        'Riconoscere e rispettare i ritmi emotivi delle persone.',
        'Imparare che la pazienza a volte ottiene più della forza.',
      ],
      work:
        'Sei nato per guidare progetti ambiziosi e team che cercano una direzione. Eccelli dove puoi definire la strategia, assegnare responsabilità e misurare i risultati.',
      relationships:
        'Porti energia e ambizione anche nei rapporti personali. Sei leale e protettivo, e cresci accanto a chi sa tenerti testa e ricordarti il valore della tenerezza.',
      famousTraits:
        'Trasmetti autorità e sicurezza appena entri in una stanza. Le persone tendono a guardare a te per sapere dove andare.',
      stress:
        'Sotto pressione diventi più rigido e impaziente, alzi i ritmi e rischi di travolgere chi ti sta intorno pur di tenere il controllo. Fermati a respirare e chiediti cosa serve davvero adesso: delegare e ascoltare ti restituisce più energia del comando forzato.',
      careers: [
        'Dirigente d’azienda',
        'Imprenditore',
        'Project manager',
        'Avvocato',
        'Consulente direzionale',
      ],
    },
    en: {
      name: 'The Strategic Commander',
      tagline: 'Sees the goal and charts the route at once.',
      summary:
        'You are a natural leader who turns visions into action plans and obstacles into next steps. You have an instinct for efficiency and a confidence that moves whole groups.',
      strengths: [
        'Decisive leadership that gives those around you direction and pace.',
        'Strategic vision paired with concrete, rapid execution.',
        'Confidence in making hard decisions under pressure.',
        'A talent for organizing people and resources toward a clear goal.',
      ],
      growth: [
        'Listening to others’ ideas before imposing your direction.',
        'Recognizing and respecting people’s emotional rhythms.',
        'Learning that patience sometimes achieves more than force.',
      ],
      work:
        'You are built to lead ambitious projects and teams that crave direction. You excel where you can set strategy, assign responsibility and measure results.',
      relationships:
        'You bring energy and ambition to personal bonds too. You are loyal and protective, and you grow beside someone who can stand up to you and remind you of the value of tenderness.',
      famousTraits:
        'You radiate authority and confidence the moment you enter a room. People tend to look to you to learn where to go.',
      stress:
        'Under pressure you grow more rigid and impatient, push the pace and risk steamrolling those around you in order to keep control. Pause to breathe and ask what is truly needed now: delegating and listening give you back more energy than forced command.',
      careers: [
        'Executive',
        'Entrepreneur',
        'Project manager',
        'Lawyer',
        'Management consultant',
      ],
    },
  },

  ENTP: {
    code: 'ENTP',
    accent: '#EA580C',
    it: {
      name: 'L’Inventore Provocatore',
      tagline: 'Sfida ogni regola per scoprire una via migliore.',
      summary:
        'Adori le idee, i dibattiti e le possibilità che nessuno ha ancora esplorato. La tua mente rapida salta da un’intuizione all’altra, sempre pronta a mettere in discussione ciò che gli altri danno per scontato.',
      strengths: [
        'Inventiva brillante nel generare idee e soluzioni inattese.',
        'Argomentazione agile che vede ogni questione da più angolazioni.',
        'Entusiasmo contagioso di fronte a nuove sfide.',
        'Capacità di adattarti e improvvisare quando i piani cambiano.',
      ],
      growth: [
        'Portare a termine ciò che inizi con tanto slancio.',
        'Scegliere le battaglie: non ogni dibattito merita di essere vinto.',
        'Dare attenzione ai dettagli pratici dell’esecuzione.',
      ],
      work:
        'Hai bisogno di varietà, autonomia e problemi nuovi da risolvere. Brilli nei ruoli che premiano la creatività e l’iniziativa, e ti spegni nelle mansioni ripetitive.',
      relationships:
        'Sei stimolante e divertente, attratto da chi sa giocare con le idee insieme a te. Cresci con partner che apprezzano la tua vivacità e non temono un confronto acceso ma affettuoso.',
      famousTraits:
        'Appari spigliato, arguto e un po’ provocatorio. Riesci a rendere interessante qualsiasi conversazione, anche solo per il gusto di vedere dove porta.',
      stress:
        'Quando ti senti bloccato o annoiato dalla pressione, ti disperdi tra mille spunti, diventi polemico e rimandi ciò che richiede costanza. Scegli una sola idea e portala a un piccolo risultato concreto: completare qualcosa calma la mente più di un nuovo dibattito.',
      careers: [
        'Imprenditore',
        'Consulente di innovazione',
        'Esperto di marketing',
        'Avvocato',
        'Product manager',
      ],
    },
    en: {
      name: 'The Provocative Inventor',
      tagline: 'Challenges every rule to find a better way.',
      summary:
        'You love ideas, debates and possibilities no one has explored yet. Your quick mind leaps from one insight to the next, always ready to question what others take for granted.',
      strengths: [
        'Brilliant inventiveness in generating unexpected ideas and solutions.',
        'Nimble reasoning that sees every issue from many angles.',
        'Contagious enthusiasm in the face of new challenges.',
        'An ability to adapt and improvise when plans change.',
      ],
      growth: [
        'Finishing what you start with so much momentum.',
        'Choosing your battles: not every debate is worth winning.',
        'Paying attention to the practical details of execution.',
      ],
      work:
        'You need variety, autonomy and fresh problems to solve. You shine in roles that reward creativity and initiative, and you wilt in repetitive tasks.',
      relationships:
        'You are stimulating and fun, drawn to people who can play with ideas alongside you. You grow with partners who enjoy your liveliness and do not fear a spirited but affectionate debate.',
      famousTraits:
        'You come across as quick-witted, sharp and a little provocative. You can make any conversation interesting, if only to see where it leads.',
      stress:
        'When you feel stuck or bored by pressure, you scatter across countless ideas, turn argumentative and put off anything that demands persistence. Pick one idea and carry it to a small concrete result: finishing something calms the mind more than a fresh debate.',
      careers: [
        'Entrepreneur',
        'Innovation consultant',
        'Marketing strategist',
        'Lawyer',
        'Product manager',
      ],
    },
  },

  INFJ: {
    code: 'INFJ',
    accent: '#0D9488',
    it: {
      name: 'Il Custode dei Significati',
      tagline: 'Cerca il senso profondo dietro ogni cosa.',
      summary:
        'Unisci una sensibilità rara a una visione idealista del mondo: percepisci le persone in profondità e desideri che la tua vita abbia uno scopo. Sotto la tua calma apparente lavora un’intuizione costante.',
      strengths: [
        'Intuizione profonda sulle motivazioni e i bisogni delle persone.',
        'Forte senso etico che guida le tue scelte con coerenza.',
        'Creatività e immaginazione al servizio di una visione.',
        'Capacità di ispirare e sostenere gli altri con calore discreto.',
      ],
      growth: [
        'Evitare di idealizzare situazioni e persone oltre la realtà.',
        'Imparare a chiedere aiuto invece di portare tutto da solo.',
        'Proteggere le tue energie senza sentirti in colpa.',
      ],
      work:
        'Hai bisogno di un lavoro che rispecchi i tuoi valori e tocchi qualcosa di più grande del profitto. Dai il meglio quando aiuti gli altri a crescere o quando dai forma a una visione.',
      relationships:
        'Cerchi legami autentici e profondi, non superficiali. Sei un partner attento e leale, e fiorisci con chi sa raggiungere il tuo mondo interiore e ricambiare la tua dedizione.',
      famousTraits:
        'Sembri tranquillo e gentile, ma chi ti conosce percepisce un’intensità sotto la superficie. Spesso capisci le persone prima che parlino.',
      stress:
        'Sotto stress assorbi le tensioni altrui finché ti senti svuotato, poi ti ritiri e rimugini su tutto ciò che non va. Prenditi una pausa di silenzio per separare le tue emozioni da quelle degli altri e confidati con una persona fidata invece di portare il peso da solo.',
      careers: [
        'Psicologo',
        'Counselor',
        'Scrittore',
        'Insegnante',
        'Responsabile di progetti sociali',
      ],
    },
    en: {
      name: 'The Keeper of Meaning',
      tagline: 'Searches for the deeper sense behind everything.',
      summary:
        'You combine rare sensitivity with an idealistic view of the world: you perceive people deeply and want your life to have purpose. Beneath your calm surface runs a constant intuition.',
      strengths: [
        'Deep insight into people’s motivations and needs.',
        'A strong ethical sense that guides your choices with consistency.',
        'Creativity and imagination in service of a vision.',
        'An ability to inspire and support others with quiet warmth.',
      ],
      growth: [
        'Avoiding idealizing situations and people beyond reality.',
        'Learning to ask for help instead of carrying everything alone.',
        'Protecting your energy without feeling guilty.',
      ],
      work:
        'You need work that reflects your values and touches something larger than profit. You do your best when helping others grow or giving shape to a vision.',
      relationships:
        'You seek authentic, deep bonds rather than shallow ones. You are an attentive and loyal partner, and you flourish with someone who can reach your inner world and return your devotion.',
      famousTraits:
        'You seem quiet and gentle, but those who know you sense an intensity beneath the surface. You often understand people before they speak.',
      stress:
        'Under stress you absorb others’ tension until you feel drained, then withdraw and brood over everything that is wrong. Take a quiet break to separate your emotions from other people’s, and confide in someone you trust instead of carrying the weight alone.',
      careers: [
        'Psychologist',
        'Counselor',
        'Writer',
        'Teacher',
        'Social-impact program lead',
      ],
    },
  },

  INFP: {
    code: 'INFP',
    accent: '#0E7490',
    it: {
      name: 'Il Sognatore Sincero',
      tagline: 'Custodisce un mondo interiore fatto di valori e ideali.',
      summary:
        'Vivi guidato da valori profondi e da un’immaginazione vivace. Cerchi autenticità in tutto ciò che fai e desideri che il mondo sia un posto più gentile, partendo da come tratti chi ti circonda.',
      strengths: [
        'Empatia sincera che ti fa comprendere il dolore e la gioia altrui.',
        'Forte integrità: i tuoi valori guidano ogni scelta importante.',
        'Immaginazione creativa che trova bellezza ovunque.',
        'Apertura e accoglienza verso le persone e le loro differenze.',
      ],
      growth: [
        'Tradurre i tuoi ideali in passi concreti e realizzabili.',
        'Non prendere ogni critica come un attacco personale.',
        'Stabilire confini chiari per non lasciarti sopraffare.',
      ],
      work:
        'Cerchi un lavoro che abbia un significato e rifletta chi sei. Prosperi negli ambienti che valorizzano la creatività, l’autenticità e la possibilità di aiutare gli altri.',
      relationships:
        'Ami in modo profondo e leale, cercando un’intesa che vada oltre le parole. Sei un partner premuroso e fioriscono con chi accoglie la tua sensibilità senza chiederti di nasconderla.',
      famousTraits:
        'Appari dolce, riservato e un po’ sognante. Dietro la tua calma c’è una vita interiore intensa che condividi solo con chi merita davvero fiducia.',
      stress:
        'Quando la realtà tradisce i tuoi ideali ti chiudi, ti senti incompreso e finisci per criticarti con durezza. Concediti di sentire l’emozione senza giudicarla, poi torna a un piccolo gesto creativo o a un valore concreto che puoi onorare oggi.',
      careers: [
        'Scrittore',
        'Counselor',
        'Designer grafico',
        'Operatore nel sociale',
        'Traduttore',
      ],
    },
    en: {
      name: 'The Earnest Dreamer',
      tagline: 'Guards an inner world of values and ideals.',
      summary:
        'You live guided by deep values and a vivid imagination. You seek authenticity in everything you do and wish the world were a kinder place, starting with how you treat those around you.',
      strengths: [
        'Sincere empathy that lets you understand others’ pain and joy.',
        'Strong integrity: your values guide every important choice.',
        'Creative imagination that finds beauty everywhere.',
        'Openness and acceptance toward people and their differences.',
      ],
      growth: [
        'Translating your ideals into concrete, achievable steps.',
        'Not taking every criticism as a personal attack.',
        'Setting clear boundaries so you are not overwhelmed.',
      ],
      work:
        'You seek work that has meaning and reflects who you are. You thrive in environments that value creativity, authenticity and the chance to help others.',
      relationships:
        'You love deeply and loyally, seeking a connection that goes beyond words. You are a caring partner and flourish with someone who welcomes your sensitivity without asking you to hide it.',
      famousTraits:
        'You appear gentle, reserved and a little dreamy. Behind your calm lies an intense inner life that you share only with those who truly earn your trust.',
      stress:
        'When reality betrays your ideals you shut down, feel misunderstood and end up criticizing yourself harshly. Allow yourself to feel the emotion without judging it, then return to a small creative act or a concrete value you can honor today.',
      careers: [
        'Writer',
        'Counselor',
        'Graphic designer',
        'Social worker',
        'Translator',
      ],
    },
  },

  ENFJ: {
    code: 'ENFJ',
    accent: '#059669',
    it: {
      name: 'Il Mentore Ispiratore',
      tagline: 'Fa fiorire il meglio in chi gli sta accanto.',
      summary:
        'Hai un dono naturale per capire le persone e tirar fuori il loro potenziale. Carismatico e caloroso, ti muovi cercando di unire gli altri attorno a uno scopo comune.',
      strengths: [
        'Carisma che ispira fiducia e mette le persone a proprio agio.',
        'Empatia attiva che ti spinge ad aiutare concretamente.',
        'Capacità di comunicare una visione e motivare un gruppo.',
        'Attenzione genuina alla crescita di chi ti circonda.',
      ],
      growth: [
        'Ricordare di occuparti dei tuoi bisogni, non solo di quelli altrui.',
        'Accettare che non puoi salvare o accontentare tutti.',
        'Tollerare i conflitti senza farti carico di risolverli da solo.',
      ],
      work:
        'Brilli nei ruoli che mettono le persone al centro: guidare, insegnare, coordinare. Hai bisogno di sentire che il tuo lavoro lascia un segno positivo nella vita di qualcuno.',
      relationships:
        'Sei un partner devoto e premuroso, attento ai bisogni dell’altro. Cresci accanto a chi ricambia la tua cura e ti aiuta a non dimenticarti di te stesso.',
      famousTraits:
        'Appari aperto, caloroso e profondamente coinvolto. Le persone si sentono viste e apprezzate quando parli con loro.',
      stress:
        'Sotto pressione ti carichi dei problemi di tutti, eviti i conflitti e ti senti ferito quando i tuoi sforzi non vengono riconosciuti. Ricorda che non sei responsabile delle emozioni altrui: chiedi esplicitamente ciò di cui hai bisogno e concediti di riposare senza sensi di colpa.',
      careers: [
        'Insegnante',
        'Responsabile risorse umane',
        'Coach',
        'Formatore',
        'Coordinatore di comunità',
      ],
    },
    en: {
      name: 'The Inspiring Mentor',
      tagline: 'Brings out the best in those beside them.',
      summary:
        'You have a natural gift for understanding people and drawing out their potential. Charismatic and warm, you move to bring others together around a shared purpose.',
      strengths: [
        'Charisma that inspires trust and puts people at ease.',
        'Active empathy that drives you to help in concrete ways.',
        'An ability to communicate a vision and motivate a group.',
        'Genuine care for the growth of those around you.',
      ],
      growth: [
        'Remembering to tend to your own needs, not only others’.',
        'Accepting that you cannot save or please everyone.',
        'Tolerating conflict without taking sole responsibility for solving it.',
      ],
      work:
        'You shine in roles that put people at the center: leading, teaching, coordinating. You need to feel your work leaves a positive mark on someone’s life.',
      relationships:
        'You are a devoted, caring partner, attentive to the other’s needs. You grow beside someone who returns your care and helps you not forget yourself.',
      famousTraits:
        'You come across as open, warm and deeply engaged. People feel seen and appreciated when you talk with them.',
      stress:
        'Under pressure you take on everyone’s problems, avoid conflict and feel hurt when your efforts go unrecognized. Remember you are not responsible for others’ emotions: ask plainly for what you need and let yourself rest without guilt.',
      careers: [
        'Teacher',
        'Human resources manager',
        'Coach',
        'Trainer',
        'Community coordinator',
      ],
    },
  },

  ENFP: {
    code: 'ENFP',
    accent: '#16A34A',
    it: {
      name: 'L’Anima Entusiasta',
      tagline: 'Trova possibilità e meraviglia ovunque guardi.',
      summary:
        'Sei una scintilla di energia e curiosità, sempre alla ricerca di nuove connessioni tra persone e idee. Vivi con passione e contagi gli altri con il tuo entusiasmo per ciò che potrebbe essere.',
      strengths: [
        'Entusiasmo travolgente che accende le idee e le persone.',
        'Calore e capacità di creare legami autentici in fretta.',
        'Creatività che vede possibilità dove altri vedono limiti.',
        'Flessibilità e curiosità verso esperienze e prospettive nuove.',
      ],
      growth: [
        'Mantenere la concentrazione e portare a termine i progetti.',
        'Gestire la routine quotidiana senza sentirti intrappolato.',
        'Non disperdere le energie inseguendo troppe idee insieme.',
      ],
      work:
        'Hai bisogno di varietà, persone e libertà di esprimerti. Eccelli dove puoi creare, connettere e ispirare, e ti spegni nelle mansioni rigide e ripetitive.',
      relationships:
        'Ami in modo aperto e appassionato, cercando connessioni profonde e autentiche. Cresci con chi condivide la tua voglia di esplorare e ti dà sicurezza senza limitare la tua libertà.',
      famousTraits:
        'Appari solare, espressivo e pieno di vita. La tua energia attira le persone e rende ogni incontro un po’ più luminoso.',
      stress:
        'Quando sei sopraffatto ti disperdi tra mille impegni, perdi la concentrazione e oscilli tra entusiasmo e scoraggiamento improvviso. Riduci le opzioni a una priorità per volta e ritagliati momenti di calma: la tua energia torna quando smetti di inseguire tutto insieme.',
      careers: [
        'Esperto di comunicazione',
        'Giornalista',
        'Imprenditore creativo',
        'Formatore',
        'Responsabile marketing',
      ],
    },
    en: {
      name: 'The Enthusiastic Spirit',
      tagline: 'Finds possibility and wonder everywhere it looks.',
      summary:
        'You are a spark of energy and curiosity, always seeking new connections between people and ideas. You live with passion and infect others with your enthusiasm for what could be.',
      strengths: [
        'Sweeping enthusiasm that ignites ideas and people.',
        'Warmth and a knack for forming authentic bonds quickly.',
        'Creativity that sees possibility where others see limits.',
        'Flexibility and curiosity toward new experiences and perspectives.',
      ],
      growth: [
        'Keeping focus and seeing projects through to the end.',
        'Handling daily routine without feeling trapped.',
        'Not scattering your energy chasing too many ideas at once.',
      ],
      work:
        'You need variety, people and the freedom to express yourself. You excel where you can create, connect and inspire, and you wilt in rigid, repetitive tasks.',
      relationships:
        'You love openly and passionately, seeking deep and authentic connection. You grow with someone who shares your urge to explore and gives you security without limiting your freedom.',
      famousTraits:
        'You come across as sunny, expressive and full of life. Your energy draws people in and makes every encounter a little brighter.',
      stress:
        'When overwhelmed you scatter across countless commitments, lose focus and swing between enthusiasm and sudden discouragement. Narrow your options to one priority at a time and carve out moments of calm: your energy returns when you stop chasing everything at once.',
      careers: [
        'Communications specialist',
        'Journalist',
        'Creative entrepreneur',
        'Trainer',
        'Marketing manager',
      ],
    },
  },

  ISTJ: {
    code: 'ISTJ',
    accent: '#1E3A8A',
    it: {
      name: 'Il Pilastro Affidabile',
      tagline: 'Mantiene la parola e regge ogni struttura.',
      summary:
        'Sei la persona su cui gli altri sanno di poter contare: metodico, responsabile e fedele agli impegni presi. Trovi sicurezza nell’ordine e porti a termine ciò che inizi con costanza.',
      strengths: [
        'Affidabilità incrollabile: mantieni sempre ciò che prometti.',
        'Attenzione ai dettagli e precisione nell’esecuzione.',
        'Forte senso del dovere e della responsabilità.',
        'Capacità di organizzare e mantenere ordine anche nel caos.',
      ],
      growth: [
        'Aprirti al cambiamento e a modi di fare diversi dai tuoi.',
        'Esprimere apprezzamento e calore verso le persone care.',
        'Concederti flessibilità quando i piani devono cambiare.',
      ],
      work:
        'Dai il meglio in ruoli chiari, strutturati e dove la precisione conta. Sei la spina dorsale di ogni organizzazione e gli altri si fidano del tuo lavoro accurato.',
      relationships:
        'Sei un partner leale e presente, che dimostra affetto con i gesti più che con le parole. Cresci con chi apprezza la tua stabilità e ti incoraggia a esprimere ciò che senti.',
      famousTraits:
        'Appari serio, composto e degno di fiducia. Le persone percepiscono in te una solidità che le fa sentire al sicuro.',
      stress:
        'Quando le cose sfuggono al tuo controllo ti irrigidisci, ti aggrappi alle regole e ti carichi di lavoro pur di mettere tutto in ordine. Accetta che non tutto dipende da te e condividi il carico: chiedere aiuto non intacca la tua affidabilità, la rende sostenibile.',
      careers: [
        'Contabile',
        'Revisore',
        'Responsabile operativo',
        'Amministratore',
        'Ufficiale o funzionario pubblico',
      ],
    },
    en: {
      name: 'The Dependable Pillar',
      tagline: 'Keeps their word and holds every structure up.',
      summary:
        'You are the person others know they can count on: methodical, responsible and faithful to your commitments. You find security in order and finish what you start with steadiness.',
      strengths: [
        'Unshakable reliability: you always keep your promises.',
        'Attention to detail and precision in execution.',
        'A strong sense of duty and responsibility.',
        'An ability to organize and keep order even amid chaos.',
      ],
      growth: [
        'Opening up to change and ways of doing things unlike your own.',
        'Expressing appreciation and warmth toward loved ones.',
        'Allowing yourself flexibility when plans must change.',
      ],
      work:
        'You do your best in clear, structured roles where precision matters. You are the backbone of any organization and others trust your careful work.',
      relationships:
        'You are a loyal, present partner who shows affection through deeds more than words. You grow with someone who values your stability and encourages you to express what you feel.',
      famousTraits:
        'You come across as serious, composed and trustworthy. People sense a solidity in you that makes them feel safe.',
      stress:
        'When things slip out of your control you stiffen, cling to the rules and pile on work to put everything back in order. Accept that not everything depends on you and share the load: asking for help does not dent your reliability, it makes it sustainable.',
      careers: [
        'Accountant',
        'Auditor',
        'Operations manager',
        'Administrator',
        'Civil servant',
      ],
    },
  },

  ISFJ: {
    code: 'ISFJ',
    accent: '#0369A1',
    it: {
      name: 'Il Guardiano Premuroso',
      tagline: 'Si prende cura, in silenzio e senza riserve.',
      summary:
        'Unisci un senso del dovere solido a una gentilezza profonda. Noti i bisogni degli altri prima che vengano espressi e ti dedichi con discrezione a rendere la loro vita più semplice.',
      strengths: [
        'Premura attenta verso il benessere concreto delle persone.',
        'Affidabilità e dedizione costante negli impegni.',
        'Memoria per i dettagli che contano nelle relazioni.',
        'Pazienza e calma anche nelle situazioni difficili.',
      ],
      growth: [
        'Imparare a dire di no e a chiedere ciò di cui hai bisogno.',
        'Non trascurare te stesso mentre ti prendi cura degli altri.',
        'Accogliere il cambiamento senza viverlo come una minaccia.',
      ],
      work:
        'Brilli nei ruoli che ti permettono di sostenere e aiutare concretamente. Sei prezioso negli ambienti che valorizzano dedizione, costanza e attenzione alle persone.',
      relationships:
        'Sei un partner devoto e protettivo, che esprime amore con cura quotidiana. Fiorisci accanto a chi riconosce i tuoi gesti e ti ricorda che meriti la stessa attenzione che doni.',
      famousTraits:
        'Appari mite, gentile e affidabile. Le persone si sentono accudite in tua presenza, anche quando non te ne accorgi.',
      stress:
        'Sotto pressione ti sovraccarichi per non deludere nessuno, trattieni il malumore e finisci per sentirti dato per scontato. Concediti il permesso di dire di no e di esprimere ciò che provi: prenderti cura di te non è egoismo, è ciò che ti permette di continuare a esserci.',
      careers: [
        'Infermiere',
        'Insegnante',
        'Assistente amministrativo',
        'Bibliotecario',
        'Operatore socio-sanitario',
      ],
    },
    en: {
      name: 'The Caring Guardian',
      tagline: 'Looks after others, quietly and without reserve.',
      summary:
        'You combine a solid sense of duty with deep kindness. You notice others’ needs before they are spoken and quietly devote yourself to making their lives easier.',
      strengths: [
        'Attentive care for people’s concrete well-being.',
        'Reliability and steady dedication to commitments.',
        'Memory for the details that matter in relationships.',
        'Patience and calm even in difficult situations.',
      ],
      growth: [
        'Learning to say no and to ask for what you need.',
        'Not neglecting yourself while caring for others.',
        'Welcoming change rather than experiencing it as a threat.',
      ],
      work:
        'You shine in roles that let you support and help in concrete ways. You are invaluable in environments that value dedication, consistency and attention to people.',
      relationships:
        'You are a devoted, protective partner who expresses love through daily care. You flourish beside someone who notices your gestures and reminds you that you deserve the attention you give.',
      famousTraits:
        'You come across as mild, kind and dependable. People feel looked after in your presence, even when you do not notice it.',
      stress:
        'Under pressure you overload yourself so as not to let anyone down, hold in your frustration and end up feeling taken for granted. Give yourself permission to say no and to voice what you feel: caring for yourself is not selfish, it is what lets you keep showing up.',
      careers: [
        'Nurse',
        'Teacher',
        'Administrative assistant',
        'Librarian',
        'Healthcare support worker',
      ],
    },
  },

  ESTJ: {
    code: 'ESTJ',
    accent: '#9A3412',
    it: {
      name: 'L’Organizzatore Risoluto',
      tagline: 'Mette ordine e fa funzionare le cose.',
      summary:
        'Sei pratico, deciso e bravissimo a trasformare il disordine in un sistema che funziona. Credi nella responsabilità, nelle regole condivise e nel portare a termine il lavoro come si deve.',
      strengths: [
        'Senso pratico che trasforma le idee in risultati concreti.',
        'Capacità organizzativa nel coordinare persone e processi.',
        'Decisione e fermezza nel prendere il comando quando serve.',
        'Affidabilità e rispetto degli impegni e delle scadenze.',
      ],
      growth: [
        'Considerare i sentimenti delle persone oltre ai fatti.',
        'Aprirti a metodi nuovi anche se quello collaudato funziona.',
        'Allentare il controllo e delegare con più fiducia.',
      ],
      work:
        'Eccelli nei ruoli di gestione e coordinamento, dove servono ordine e risultati. Sei il motore che tiene insieme team e progetti e fa rispettare gli standard.',
      relationships:
        'Sei un partner leale e affidabile, che mostra l’affetto costruendo stabilità. Cresci con chi apprezza la tua dedizione e ti aiuta ad ascoltare anche il lato emotivo.',
      famousTraits:
        'Appari sicuro, diretto e organizzato. Le persone sanno esattamente dove ti trovano e si affidano alla tua concretezza.',
      stress:
        'Sotto pressione diventi più autoritario e inflessibile, imponi le regole e ti spazientisci con chi non rispetta i tuoi standard. Concediti una pausa per distinguere ciò che puoi controllare da ciò che non dipende da te: ascoltare e delegare ti ridà più efficacia del comando rigido.',
      careers: [
        'Direttore operativo',
        'Responsabile di reparto',
        'Project manager',
        'Amministratore',
        'Responsabile logistica',
      ],
    },
    en: {
      name: 'The Resolute Organizer',
      tagline: 'Brings order and makes things work.',
      summary:
        'You are practical, decisive and excellent at turning disorder into a system that works. You believe in responsibility, in shared rules and in getting the job done properly.',
      strengths: [
        'A practical sense that turns ideas into concrete results.',
        'Organizational skill in coordinating people and processes.',
        'Decisiveness and firmness in taking charge when needed.',
        'Reliability and respect for commitments and deadlines.',
      ],
      growth: [
        'Considering people’s feelings alongside the facts.',
        'Opening up to new methods even when the tried one works.',
        'Loosening control and delegating with more trust.',
      ],
      work:
        'You excel in management and coordination roles where order and results are needed. You are the engine that holds teams and projects together and upholds standards.',
      relationships:
        'You are a loyal, dependable partner who shows affection by building stability. You grow with someone who values your dedication and helps you listen to the emotional side too.',
      famousTraits:
        'You come across as confident, direct and organized. People know exactly where they stand with you and rely on your practicality.',
      stress:
        'Under pressure you grow more authoritarian and inflexible, enforce the rules and lose patience with those who fall short of your standards. Take a break to separate what you can control from what does not depend on you: listening and delegating give you back more effectiveness than rigid command.',
      careers: [
        'Operations director',
        'Department manager',
        'Project manager',
        'Administrator',
        'Logistics manager',
      ],
    },
  },

  ESFJ: {
    code: 'ESFJ',
    accent: '#BE185D',
    it: {
      name: 'L’Anima della Comunità',
      tagline: 'Tiene unite le persone con calore e cura.',
      summary:
        'Sei caloroso, attento e profondamente legato alle persone che ami. Trovi gioia nel prenderti cura degli altri e nel creare ambienti accoglienti dove tutti si sentano benvenuti.',
      strengths: [
        'Calore e attenzione che mettono gli altri a proprio agio.',
        'Senso pratico nell’aiutare con gesti concreti e tempestivi.',
        'Capacità di creare armonia e coesione nei gruppi.',
        'Affidabilità e dedizione verso le persone care.',
      ],
      growth: [
        'Non legare troppo la tua serenità all’approvazione altrui.',
        'Affrontare i conflitti invece di evitarli per quieto vivere.',
        'Dedicare attenzione anche ai tuoi bisogni, non solo a quelli degli altri.',
      ],
      work:
        'Brilli dove puoi sostenere, coordinare e prenderti cura delle persone. Prosperi negli ambienti collaborativi che valorizzano l’affidabilità e il contributo concreto.',
      relationships:
        'Sei un partner affettuoso e presente, che ama nutrire i legami con gesti quotidiani. Cresci accanto a chi ricambia la tua cura e ti rassicura del tuo valore.',
      famousTraits:
        'Appari socievole, caloroso e attento. Le persone si sentono accolte e ascoltate quando sono con te.',
      stress:
        'Sotto pressione cerchi di accontentare tutti, eviti i conflitti e ti senti ferito quando manca un riconoscimento o un’armonia che davi per scontati. Ricorda che il valore non dipende dall’approvazione altrui: esprimi con chiarezza ciò che provi e affronta le tensioni invece di nasconderle.',
      careers: [
        'Infermiere',
        'Responsabile risorse umane',
        'Organizzatore di eventi',
        'Insegnante',
        'Responsabile relazioni con i clienti',
      ],
    },
    en: {
      name: 'The Heart of the Community',
      tagline: 'Holds people together with warmth and care.',
      summary:
        'You are warm, attentive and deeply attached to the people you love. You find joy in caring for others and in creating welcoming spaces where everyone feels included.',
      strengths: [
        'Warmth and attentiveness that put others at ease.',
        'A practical instinct to help with timely, concrete gestures.',
        'An ability to create harmony and cohesion in groups.',
        'Reliability and devotion toward loved ones.',
      ],
      growth: [
        'Not tying your peace of mind too tightly to others’ approval.',
        'Facing conflict instead of avoiding it for a quiet life.',
        'Giving attention to your own needs, not only others’.',
      ],
      work:
        'You shine where you can support, coordinate and care for people. You thrive in collaborative environments that value reliability and concrete contribution.',
      relationships:
        'You are an affectionate, present partner who loves to nurture bonds through daily gestures. You grow beside someone who returns your care and reassures you of your worth.',
      famousTraits:
        'You come across as sociable, warm and attentive. People feel welcomed and heard when they are with you.',
      stress:
        'Under pressure you try to please everyone, avoid conflict and feel hurt when the recognition or harmony you took for granted is missing. Remember your worth does not depend on others’ approval: state clearly what you feel and face tensions instead of hiding them.',
      careers: [
        'Nurse',
        'Human resources manager',
        'Event organizer',
        'Teacher',
        'Customer relations manager',
      ],
    },
  },

  ISTP: {
    code: 'ISTP',
    accent: '#475569',
    it: {
      name: 'Il Risolutore Pratico',
      tagline: 'Capisce le cose smontandole con le mani.',
      summary:
        'Sei calmo, indipendente e abilissimo a risolvere problemi concreti nel momento in cui si presentano. Impari facendo e ti fidi di ciò che puoi toccare, osservare e mettere alla prova.',
      strengths: [
        'Abilità pratica nel capire e riparare come funzionano le cose.',
        'Lucidità e sangue freddo nelle situazioni di crisi.',
        'Adattabilità e capacità di improvvisare soluzioni efficaci.',
        'Indipendenza e autonomia nell’affrontare le sfide.',
      ],
      growth: [
        'Comunicare di più ciò che provi alle persone vicine.',
        'Considerare le conseguenze a lungo termine, non solo l’immediato.',
        'Impegnarti anche quando un compito richiede pazienza e routine.',
      ],
      work:
        'Eccelli dove puoi risolvere problemi concreti con autonomia e mani libere. Hai bisogno di varietà e azione, e mal sopporti le regole rigide e la teoria fine a se stessa.',
      relationships:
        'Sei un partner leale ma riservato, che mostra affetto con i fatti più che con le parole. Cresci con chi rispetta il tuo bisogno di spazio e libertà.',
      famousTraits:
        'Appari calmo, pratico e un po’ misterioso. Parli poco, ma quando c’è un problema da risolvere sei la persona giusta accanto.',
      stress:
        'Sotto pressione ti chiudi, ti distacchi dalle emozioni e reagisci con impulsività o sarcasmo quando ti senti vincolato. Allontanati un momento per scaricare la tensione con un’attività pratica, poi torna e di’ a parole ciò che provi invece di lasciarlo esplodere.',
      careers: [
        'Tecnico specializzato',
        'Ingegnere',
        'Meccanico',
        'Pilota',
        'Analista di sicurezza informatica',
      ],
    },
    en: {
      name: 'The Practical Solver',
      tagline: 'Understands things by taking them apart.',
      summary:
        'You are calm, independent and highly skilled at solving concrete problems the moment they arise. You learn by doing and trust what you can touch, observe and put to the test.',
      strengths: [
        'Practical skill in understanding and fixing how things work.',
        'Composure and cool-headedness in a crisis.',
        'Adaptability and a knack for improvising effective solutions.',
        'Independence and self-reliance in facing challenges.',
      ],
      growth: [
        'Communicating more of what you feel to those close to you.',
        'Considering long-term consequences, not only the immediate.',
        'Committing even when a task demands patience and routine.',
      ],
      work:
        'You excel where you can solve concrete problems with autonomy and free hands. You need variety and action, and you bristle at rigid rules and theory for its own sake.',
      relationships:
        'You are a loyal but reserved partner who shows affection through deeds more than words. You grow with someone who respects your need for space and freedom.',
      famousTraits:
        'You come across as calm, practical and a little mysterious. You speak little, but when there is a problem to solve you are the right person to have nearby.',
      stress:
        'Under pressure you withdraw, detach from your emotions and react with impulsiveness or sarcasm when you feel constrained. Step away for a moment to release the tension through a hands-on activity, then come back and put what you feel into words instead of letting it erupt.',
      careers: [
        'Skilled technician',
        'Engineer',
        'Mechanic',
        'Pilot',
        'Cybersecurity analyst',
      ],
    },
  },

  ISFP: {
    code: 'ISFP',
    accent: '#C026D3',
    it: {
      name: 'L’Artista Gentile',
      tagline: 'Vive il presente con sensibilità e bellezza.',
      summary:
        'Sei sensibile, autentico e attento alla bellezza del momento presente. Vivi secondo i tuoi valori più che secondo le aspettative, e ti esprimi spesso attraverso ciò che crei più che con le parole.',
      strengths: [
        'Sensibilità estetica che coglie la bellezza dei dettagli.',
        'Autenticità e fedeltà ai tuoi valori personali.',
        'Empatia gentile e attenzione discreta verso gli altri.',
        'Spontaneità e capacità di godere appieno del presente.',
      ],
      growth: [
        'Pianificare con un occhio anche al futuro, non solo all’oggi.',
        'Esprimere a parole ciò che senti invece di tenerlo dentro.',
        'Affrontare i conflitti senza ritirarti in silenzio.',
      ],
      work:
        'Cerchi un lavoro che rispetti la tua libertà e ti permetta di esprimerti. Prosperi negli ambienti flessibili e creativi, lontano da gerarchie rigide e routine soffocanti.',
      relationships:
        'Ami in modo tenero e leale, dimostrando affetto con gesti premurosi. Fiorisci accanto a chi rispetta la tua sensibilità e ti dà spazio per essere te stesso.',
      famousTraits:
        'Appari riservato, dolce e tranquillo, ma chi ti conosce scopre una persona appassionata e profondamente fedele a ciò in cui crede.',
      stress:
        'Sotto pressione ti chiudi in silenzio, eviti il confronto e assorbi le tensioni finché ti senti sopraffatto e incompreso. Concediti spazio per ritrovare la calma attraverso ciò che ami creare, poi esprimi con dolcezza ciò che provi invece di tenerlo dentro.',
      careers: [
        'Artista',
        'Designer',
        'Fotografo',
        'Artigiano',
        'Operatore del benessere',
      ],
    },
    en: {
      name: 'The Gentle Artist',
      tagline: 'Lives the present moment with sensitivity and beauty.',
      summary:
        'You are sensitive, authentic and attuned to the beauty of the present moment. You live by your values rather than expectations, and you often express yourself through what you create more than through words.',
      strengths: [
        'Aesthetic sensitivity that catches the beauty in details.',
        'Authenticity and loyalty to your personal values.',
        'Gentle empathy and quiet attentiveness toward others.',
        'Spontaneity and the ability to fully enjoy the present.',
      ],
      growth: [
        'Planning with an eye on the future too, not only today.',
        'Putting into words what you feel instead of holding it in.',
        'Facing conflict without retreating into silence.',
      ],
      work:
        'You seek work that respects your freedom and lets you express yourself. You thrive in flexible, creative environments, away from rigid hierarchies and stifling routine.',
      relationships:
        'You love tenderly and loyally, showing affection through thoughtful gestures. You flourish beside someone who respects your sensitivity and gives you room to be yourself.',
      famousTraits:
        'You come across as reserved, gentle and calm, but those who know you discover a passionate person deeply faithful to what they believe in.',
      stress:
        'Under pressure you retreat into silence, avoid confrontation and absorb tension until you feel overwhelmed and misunderstood. Give yourself room to find calm through what you love to create, then gently express what you feel instead of holding it in.',
      careers: [
        'Artist',
        'Designer',
        'Photographer',
        'Craftsperson',
        'Wellness practitioner',
      ],
    },
  },

  ESTP: {
    code: 'ESTP',
    accent: '#D97706',
    it: {
      name: 'L’Audace del Momento',
      tagline: 'Agisce ora e risolve mentre va.',
      summary:
        'Sei energico, pragmatico e a tuo agio nel cuore dell’azione. Cogli al volo le opportunità, ti adatti in fretta e affronti i problemi con un’audacia che gli altri ammirano.',
      strengths: [
        'Prontezza nel reagire e cogliere le opportunità al volo.',
        'Pragmatismo che risolve i problemi sul campo.',
        'Coraggio e disinvoltura nelle situazioni di pressione.',
        'Capacità di coinvolgere e animare le persone intorno a te.',
      ],
      growth: [
        'Pensare alle conseguenze a lungo termine prima di agire.',
        'Coltivare la pazienza per i progetti che richiedono tempo.',
        'Dare attenzione ai sentimenti, tuoi e degli altri.',
      ],
      work:
        'Brilli dove servono rapidità, azione e capacità di adattarsi. Prosperi negli ambienti dinamici e mal sopporti la routine, la teoria astratta e le regole troppo rigide.',
      relationships:
        'Sei un partner vivace e generoso, che ama condividere esperienze ed emozioni intense. Cresci con chi sa stare al tuo passo e ti invita a fermarti ogni tanto a riflettere.',
      famousTraits:
        'Appari sicuro, spigliato e pieno di vita. Porti energia ovunque vai e sai trasformare un momento qualsiasi in qualcosa di memorabile.',
      stress:
        'Sotto pressione ti agiti, agisci d’impulso e cerchi distrazioni o rischi pur di sfuggire alla tensione e alla noia. Fermati a respirare e chiediti quali saranno le conseguenze: incanalare l’energia in un’azione utile ti calma più della fuga.',
      careers: [
        'Imprenditore',
        'Agente di vendita',
        'Operatore di emergenza',
        'Trader',
        'Organizzatore di eventi sportivi',
      ],
    },
    en: {
      name: 'The Bold of the Moment',
      tagline: 'Acts now and figures it out on the way.',
      summary:
        'You are energetic, pragmatic and at ease in the heart of the action. You seize opportunities on the fly, adapt quickly and face problems with a boldness others admire.',
      strengths: [
        'Quickness in reacting and seizing opportunities on the fly.',
        'Pragmatism that solves problems on the spot.',
        'Courage and ease in high-pressure situations.',
        'An ability to engage and energize the people around you.',
      ],
      growth: [
        'Thinking about long-term consequences before acting.',
        'Cultivating patience for projects that take time.',
        'Paying attention to feelings, your own and others’.',
      ],
      work:
        'You shine where speed, action and adaptability are needed. You thrive in dynamic environments and bristle at routine, abstract theory and overly rigid rules.',
      relationships:
        'You are a lively, generous partner who loves to share experiences and intense emotions. You grow with someone who can keep your pace and invites you to pause now and then to reflect.',
      famousTraits:
        'You come across as confident, easygoing and full of life. You bring energy everywhere you go and can turn an ordinary moment into something memorable.',
      stress:
        'Under pressure you grow restless, act on impulse and chase distractions or risks just to escape the tension and boredom. Pause to breathe and ask yourself what the consequences will be: channeling the energy into useful action calms you more than flight.',
      careers: [
        'Entrepreneur',
        'Sales representative',
        'Emergency responder',
        'Trader',
        'Sports event organizer',
      ],
    },
  },

  ESFP: {
    code: 'ESFP',
    accent: '#DB2777',
    it: {
      name: 'L’Animatore Spontaneo',
      tagline: 'Porta gioia e vita in ogni momento.',
      summary:
        'Sei caloroso, spontaneo e contagioso nella tua voglia di vivere. Ami stare con le persone, godere del presente e trasformare anche le giornate normali in qualcosa di divertente e luminoso.',
      strengths: [
        'Calore e spontaneità che mettono allegria a chi ti circonda.',
        'Capacità di vivere il presente con pienezza e gratitudine.',
        'Empatia pratica e attenzione concreta verso gli altri.',
        'Adattabilità e ottimismo di fronte agli imprevisti.',
      ],
      growth: [
        'Pensare al futuro e pianificare oltre il qui e ora.',
        'Affrontare le difficoltà invece di distrarti per evitarle.',
        'Non legare il tuo valore al giudizio degli altri.',
      ],
      work:
        'Brilli nei ruoli che mettono al centro le persone, l’energia e la spontaneità. Hai bisogno di varietà e contatto umano, e ti spegni nelle mansioni isolate e ripetitive.',
      relationships:
        'Sei un partner affettuoso e divertente, che ama esprimere amore in modo aperto e generoso. Cresci accanto a chi condivide la tua gioia di vivere e ti offre una base sicura.',
      famousTraits:
        'Appari solare, espansivo e travolgente. La tua presenza accende l’atmosfera e fa sentire le persone più leggere e felici.',
      stress:
        'Sotto pressione ti distrai per evitare le emozioni difficili, rimandi i problemi e cerchi continue conferme dagli altri. Concediti di fermarti e di sentire ciò che provi: affrontare una difficoltà alla volta ti restituisce più serenità di mille distrazioni.',
      careers: [
        'Organizzatore di eventi',
        'Animatore turistico',
        'Esperto di vendite',
        'Educatore dell’infanzia',
        'Promotore di pubbliche relazioni',
      ],
    },
    en: {
      name: 'The Spontaneous Entertainer',
      tagline: 'Brings joy and life to every moment.',
      summary:
        'You are warm, spontaneous and contagious in your love of life. You love being with people, savoring the present and turning even ordinary days into something fun and bright.',
      strengths: [
        'Warmth and spontaneity that bring cheer to those around you.',
        'An ability to live the present fully and with gratitude.',
        'Practical empathy and concrete attentiveness toward others.',
        'Adaptability and optimism in the face of the unexpected.',
      ],
      growth: [
        'Thinking ahead and planning beyond the here and now.',
        'Facing difficulties instead of distracting yourself to avoid them.',
        'Not tying your worth to other people’s judgment.',
      ],
      work:
        'You shine in roles that center people, energy and spontaneity. You need variety and human contact, and you wilt in isolated, repetitive tasks.',
      relationships:
        'You are an affectionate, fun partner who loves to express love openly and generously. You grow beside someone who shares your zest for life and offers you a secure base.',
      famousTraits:
        'You come across as sunny, outgoing and irresistible. Your presence lights up the room and makes people feel lighter and happier.',
      stress:
        'Under pressure you distract yourself to avoid difficult emotions, put off problems and seek constant reassurance from others. Allow yourself to pause and feel what you are feeling: facing one difficulty at a time gives you back more peace than any amount of distraction.',
      careers: [
        'Event organizer',
        'Hospitality host',
        'Sales specialist',
        'Early-childhood educator',
        'Public relations promoter',
      ],
    },
  },
};
