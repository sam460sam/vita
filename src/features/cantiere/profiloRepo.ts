export interface MioProfilo {
  nome: string;
  provincia: string;
  ruolo: 'posatore' | 'operaio';
  profiloPubblico: boolean;
  createdAt: string;
}

export function getMioProfilo(): MioProfilo | null {
  try {
    const s = localStorage.getItem('cantieri.profilo');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function saveMioProfilo(p: MioProfilo): void {
  localStorage.setItem('cantieri.profilo', JSON.stringify(p));
}
