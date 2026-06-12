import type { TKey } from './en';

// Spanish — secondary locale. Crew-facing flows (daily log, voice) and core
// navigation are translated first; anything missing falls back to English.
export const es: Partial<Record<TKey, string>> = {
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.done': 'Listo',
  'common.add': 'Añadir',
  'common.next': 'Siguiente',
  'common.back': 'Atrás',
  'common.share': 'Compartir',
  'common.optional': 'opcional',
  'common.required': 'Obligatorio',
  'common.search': 'Buscar',
  'common.total': 'Total',
  'common.subtotal': 'Subtotal',
  'common.tax': 'Impuesto',
  'common.markup': 'Margen',
  'common.qty': 'Cant.',
  'common.unit': 'Unidad',
  'common.price': 'Precio',
  'common.confirm': 'Confirmar',
  'common.close': 'Cerrar',
  'common.none': 'Ninguno',

  'nav.jobs': 'Trabajos',
  'nav.clients': 'Clientes',
  'nav.add': 'Añadir',
  'nav.priceBook': 'Precios',
  'nav.settings': 'Ajustes',

  'quick.title': 'Acciones rápidas',
  'quick.newEstimate': 'Nuevo presupuesto',
  'quick.newChangeOrder': 'Nueva orden de cambio',
  'quick.sitePhoto': 'Foto de obra',

  'status.lead': 'Prospecto',
  'status.quoted': 'Presupuestado',
  'status.signed': 'Firmado',
  'status.in_progress': 'En curso',
  'status.done': 'Terminado',
  'status.disputed': 'En disputa',

  'tab.estimate': 'Presupuesto',
  'tab.contract': 'Contrato',
  'tab.changeOrders': 'Órdenes de cambio',
  'tab.log': 'Registro',
  'tab.payments': 'Pagos',
  'tab.proof': 'Pruebas',

  'project.depositWarning': 'Depósito no cobrado — no empieces a excavar',
};
