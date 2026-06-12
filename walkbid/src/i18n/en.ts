// English dictionary — the master source of truth. `TKey` is derived from these
// keys; every other locale is a Partial that falls back to English.
export const en = {
  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.done': 'Done',
  'common.add': 'Add',
  'common.next': 'Next',
  'common.back': 'Back',
  'common.share': 'Share',
  'common.optional': 'optional',
  'common.required': 'Required',
  'common.search': 'Search',
  'common.total': 'Total',
  'common.subtotal': 'Subtotal',
  'common.tax': 'Tax',
  'common.markup': 'Markup',
  'common.qty': 'Qty',
  'common.unit': 'Unit',
  'common.price': 'Price',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.none': 'None',

  // Navigation (bottom tab bar — spec §8)
  'nav.jobs': 'Jobs',
  'nav.clients': 'Clients',
  'nav.add': 'Add',
  'nav.priceBook': 'Price book',
  'nav.settings': 'Settings',

  // Quick add sheet
  'quick.title': 'Quick actions',
  'quick.newEstimate': 'New estimate',
  'quick.newChangeOrder': 'New change order',
  'quick.sitePhoto': 'Site photo',

  // Project status
  'status.lead': 'Lead',
  'status.quoted': 'Quoted',
  'status.signed': 'Signed',
  'status.in_progress': 'In progress',
  'status.done': 'Done',
  'status.disputed': 'Disputed',

  // Jobs / pipeline
  'jobs.title': 'Jobs',
  'jobs.empty.title': 'No jobs yet',
  'jobs.empty.body': 'Add your first client and start a job.',
  'jobs.empty.cta': 'New job',
  'jobs.atRisk': 'At risk',
  'jobs.newJob': 'New job',

  // Clients
  'clients.title': 'Clients',
  'clients.empty.title': 'No clients yet',
  'clients.empty.body': 'Add the people you work for.',
  'clients.empty.cta': 'New client',
  'clients.new': 'New client',
  'clients.edit': 'Edit client',
  'clients.name': 'Name',
  'clients.company': 'Company',
  'clients.phone': 'Phone',
  'clients.email': 'Email',
  'clients.address': 'Address',
  'clients.notes': 'Notes',
  'clients.language': 'Language',

  // Project detail tabs
  'tab.estimate': 'Estimate',
  'tab.contract': 'Contract',
  'tab.changeOrders': 'Change orders',
  'tab.log': 'Log',
  'tab.payments': 'Payments',
  'tab.proof': 'Proof',

  // Project
  'project.new': 'New job',
  'project.edit': 'Edit job',
  'project.title': 'Job title',
  'project.client': 'Client',
  'project.siteAddress': 'Site address',
  'project.depositWarning': "Deposit not collected — don't break ground",

  // Generic empty
  'empty.estimate': 'No estimate yet',
  'empty.contract': 'No contract yet',
  'empty.changeOrders': 'No change orders yet',
  'empty.log': 'No log entries yet',
  'empty.payments': 'No payment plan yet',
} as const;

export type TKey = keyof typeof en;
