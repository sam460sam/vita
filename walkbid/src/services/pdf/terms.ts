// Minimal, neutral contract terms template (build spec §10). Not legal advice —
// Settings warns the contractor to have it reviewed by a construction attorney.
import { BRAND } from '@/config/brand';

export interface TermsContext {
  companyName: string;
  clientName: string;
  siteAddress: string;
  totalText: string;
}

export function contractTerms(ctx: TermsContext): Array<{ heading: string; body: string }> {
  const company = ctx.companyName || BRAND;
  return [
    {
      heading: '1. Parties',
      body: `This agreement is between ${company} ("Contractor") and ${ctx.clientName} ("Client") for work at ${ctx.siteAddress || 'the project site'}.`,
    },
    {
      heading: '2. Scope of work',
      body: 'The scope of work is defined by the itemized estimate attached above. Work not listed is excluded unless added by a signed change order.',
    },
    {
      heading: '3. Contract price & payment schedule',
      body: `The total contract price is ${ctx.totalText}, payable per the payment schedule shown above. Past-due balances may pause work.`,
    },
    {
      heading: '4. Change orders',
      body: 'Additional or modified work is performed only upon a signed change order describing the work and its price. Verbal authorizations are not binding.',
    },
    {
      heading: '5. Site access',
      body: 'Client shall provide clear and safe access to the work area, including utilities and a staging location, during normal working hours.',
    },
    {
      heading: '6. Exclusions',
      body: 'Unless stated in the estimate, the price excludes permits, engineering, unforeseen subsurface conditions, utility relocation, and restoration of pre-existing damage.',
    },
  ];
}
