// ─── STATE ────────────────────────────────────────────────────────────────────
export const S = {
  firm: {},
  scope: { services: [] },
  program: {},
  staff: [],
  training: [],
  enrolment: {},
  clients: [],
  incidents: [],
  report: { history: [], storageLocation: '' },
  currentScreen: 'dashboard'
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const DS_LIST = [
  { id:'ds1', name:'Assisting with real estate transactions', desc:'Planning or execution of a sale, purchase or transfer of real estate' },
  { id:'ds2', name:'Assisting with sale/transfer of a body corporate or legal arrangement', desc:'Selling, buying or transferring a company or legal arrangement (e.g. trust)' },
  { id:'ds3', name:'Receiving, holding, controlling or managing client funds or property', desc:'Includes trust accounts used as substitute banking' },
  { id:'ds4', name:'Assisting with equity or debt financing', desc:'Organising, planning or executing equity or debt financing transactions' },
  { id:'ds5', name:'Selling or transferring a shelf company', desc:'Transferring ownership of a pre-registered company to another person' },
  { id:'ds6', name:'Assisting with creation or restructuring of a body corporate or legal arrangement', desc:'Creating or restructuring a company, trust, partnership or similar' },
  { id:'ds7', name:'Acting as or arranging an officer (director, secretary, partner or trustee)', desc:'Acting as, or arranging for another person to act in these roles' },
  { id:'ds8', name:'Acting as or arranging a nominee shareholder', desc:'Acting as, or arranging a nominee shareholder on behalf of another person' },
  { id:'ds9', name:'Providing a registered office or principal place of business address', desc:'Providing a registered office address for a company or legal arrangement' },
];

export const PF_TEXT = {
  Low: 'The firm does not knowingly provide services to entities involved in weapons proliferation. All clients are screened against the DFAT consolidated sanctions list on onboarding. The firm does not accept clients from FATF high-risk jurisdictions. Proliferation financing risk is assessed as low.',
  Medium: 'The firm has some international client exposure that warrants monitoring for proliferation financing risk. Clients with connections to higher-risk jurisdictions are subject to enhanced screening.',
  High: 'The firm has identified direct exposure to high-risk jurisdictions or complex international structures that elevate proliferation financing risk. Enhanced controls and AMLCO oversight apply.'
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
// WARNING: the localStorage key 'saml_v2' must never be changed.
// Changing it will cause all existing user data to be lost on next load.

export function save() {
  try { localStorage.setItem('saml_v2', JSON.stringify(S)); } catch(e) {}
}

export function load() {
  try {
    const d = localStorage.getItem('saml_v2');
    if (d) {
      const p = JSON.parse(d);
      Object.keys(p).forEach(k => { if (k in S) S[k] = p[k]; });
    }
    // Migrate flat service → services[] for records created before the services[] schema
    (S.clients || []).forEach(c => {
      if (!c.services || c.services.length === 0) {
        c.services = c.service
          ? [{ serviceName: c.service, dateProvided: c.cddDate || '', newCddRequired: false }]
          : [];
      }
    });
  } catch(e) {}
}
