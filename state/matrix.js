// ─── AUSTRAC TASK MATRIX ─────────────────────────────────────────────────────
// Source: AUSTRAC Table 6, mapped to accounting firm services.
// 57 rows: 34 IN, 22 OUT, 1 GREY ZONE.
// This is the source of truth for the classification engine.
// DO NOT show this directly to users.
// Update only when AUSTRAC releases new rules.

export const MATRIX = [
  {
    "id": 0,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Company Incorporation",
    "table6": "Item 7 (Formation Agent)",
    "status": "IN",
    "synonyms": [
      "set up company",
      "register company",
      "incorporate pty ltd",
      "new company registration",
      "asic company setup",
      "company",
      "incorporation"
    ]
  },
  {
    "id": 1,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Trust Deed Establishment (Family, Unit, etc.)",
    "table6": "Item 7 (Formation Agent)",
    "status": "IN",
    "synonyms": [
      "set up trust",
      "create trust",
      "establish family trust",
      "unit trust setup",
      "draft trust deed",
      "trust",
      "deed",
      "establishment",
      "family,",
      "unit,",
      "etc."
    ]
  },
  {
    "id": 2,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Providing a Registered Office Address",
    "table6": "Item 9 (Registered Office)",
    "status": "IN",
    "synonyms": [
      "registered office",
      "use our address",
      "company registered address",
      "asic address",
      "providing",
      "registered",
      "office",
      "address"
    ]
  },
  {
    "id": 3,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Providing a Business Correspondence Address",
    "table6": "Item 9 (Registered Office)",
    "status": "IN",
    "synonyms": [
      "mailing address",
      "business address",
      "correspondence address",
      "virtual office address",
      "providing",
      "business",
      "correspondence",
      "address"
    ]
  },
  {
    "id": 4,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Acting as Company Secretary",
    "table6": "Item 8 (Nominee/Specified Roles)",
    "status": "IN",
    "synonyms": [
      "company secretarial role",
      "corporate secretary",
      "act as cosec",
      "secretarial services",
      "acting",
      "company",
      "secretary"
    ]
  },
  {
    "id": 5,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Appointing a Nominee Director/Shareholder",
    "table6": "Item 8 (Nominee/Specified Roles)",
    "status": "IN",
    "synonyms": [
      "nominee director",
      "nominee shareholder",
      "straw director",
      "third party director",
      "appointing",
      "nominee",
      "director",
      "shareholder"
    ]
  },
  {
    "id": 6,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Updating ASIC Records (Share transfers, director changes, etc.)",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "asic updates",
      "change director",
      "share transfer",
      "update company details",
      "form 484",
      "updating",
      "asic",
      "records",
      "share",
      "transfers,",
      "director",
      "changes,",
      "etc."
    ]
  },
  {
    "id": 7,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Drafting Shareholder Agreements",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "shareholder agreement",
      "sha drafting",
      "owners agreement",
      "equity agreement",
      "drafting",
      "shareholder",
      "agreements"
    ]
  },
  {
    "id": 8,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Drafting Director Resolutions",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "director resolution",
      "board resolution",
      "minutes drafting",
      "company minutes",
      "drafting",
      "director",
      "resolutions"
    ]
  },
  {
    "id": 9,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Changing Company Constitution",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "amend constitution",
      "update constitution",
      "replace constitution",
      "changing",
      "company",
      "constitution"
    ]
  },
  {
    "id": 10,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Filing ASIC Forms (officeholder updates, annual review)",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "filing asic forms (officeholder updates, annual review)",
      "filing",
      "asic",
      "forms",
      "officeholder",
      "updates,",
      "annual",
      "review"
    ]
  },
  {
    "id": 11,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Drafting Trust Amendments / Variations",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "drafting trust amendments / variations",
      "drafting",
      "trust",
      "amendments",
      "variations"
    ]
  },
  {
    "id": 12,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Signatory on Client Bank Account",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "bank signatory",
      "payment authority",
      "bank access",
      "operate bank account",
      "signatory",
      "client",
      "bank",
      "account"
    ]
  },
  {
    "id": 13,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Processing Payroll Payments (ABA upload / auth)",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "payroll aba",
      "upload aba",
      "pay wages",
      "process payroll payments",
      "processing",
      "payroll",
      "payments",
      "upload",
      "auth"
    ]
  },
  {
    "id": 14,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Paying Supplier Invoices (Authority to spend)",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "pay bills",
      "supplier payments",
      "accounts payable payments",
      "aba creditors",
      "paying",
      "supplier",
      "invoices",
      "authority",
      "spend"
    ]
  },
  {
    "id": 15,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Managing a Trust Account",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "trust account handling",
      "hold client funds",
      "operate trust account",
      "managing",
      "trust",
      "account"
    ]
  },
  {
    "id": 16,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Petty Cash Management (Cash on Hand)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "petty cash management (cash on hand)",
      "petty",
      "cash",
      "management",
      "hand"
    ]
  },
  {
    "id": 17,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Credit Card Payments on Client Behalf",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "credit card payments on client behalf",
      "credit",
      "card",
      "payments",
      "client",
      "behalf"
    ]
  },
  {
    "id": 18,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Reconciling Loan / Financing Accounts",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "reconciling loan / financing accounts",
      "reconciling",
      "loan",
      "financing",
      "accounts"
    ]
  },
  {
    "id": 19,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Authorising Payment Runs (Client Funds)",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "authorising payment runs (client funds)",
      "authorising",
      "payment",
      "runs",
      "client",
      "funds"
    ]
  },
  {
    "id": 20,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Processing Refunds / Rebates",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "processing refunds / rebates",
      "processing",
      "refunds",
      "rebates"
    ]
  },
  {
    "id": 21,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Bank Reconciliations (Read-only access)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "bank recs",
      "reconcile bank",
      "bank reconciliation work",
      "bank",
      "reconciliations",
      "read-only",
      "access"
    ]
  },
  {
    "id": 22,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Data Entry / Accounts Receivable (Invoicing only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "invoicing",
      "raise invoices",
      "accounts receivable entry",
      "debtor entry",
      "data",
      "entry",
      "accounts",
      "receivable",
      "only"
    ]
  },
  {
    "id": 23,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Generating Reports (Read-only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "generating reports (read-only)",
      "generating",
      "reports",
      "read-only"
    ]
  },
  {
    "id": 24,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Payroll Processing without fund movement",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "payroll processing without fund movement",
      "payroll",
      "processing",
      "without",
      "fund",
      "movement"
    ]
  },
  {
    "id": 25,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "BAS / GST Calculation (no payment authority)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "bas / gst calculation (no payment authority)",
      "calculation",
      "payment",
      "authority"
    ]
  },
  {
    "id": 26,
    "category": "3. Advisory & Business Transactions",
    "task": "Assisting in a Business Sale (M&A)",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "IN",
    "synonyms": [
      "sell business",
      "m&a support",
      "business disposal",
      "sale mandate",
      "assisting",
      "business",
      "sale"
    ]
  },
  {
    "id": 27,
    "category": "3. Advisory & Business Transactions",
    "task": "Helping a Client Buy a Business / Trust",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "IN",
    "synonyms": [
      "helping a client buy a business / trust",
      "helping",
      "client",
      "business",
      "trust"
    ]
  },
  {
    "id": 28,
    "category": "3. Advisory & Business Transactions",
    "task": "Organizing Debt / Equity Funding (Capital raising)",
    "table6": "Item 5 (Contributions / Financing)",
    "status": "IN",
    "synonyms": [
      "organizing debt / equity funding (capital raising)",
      "organizing",
      "debt",
      "equity",
      "funding",
      "capital",
      "raising"
    ]
  },
  {
    "id": 29,
    "category": "3. Advisory & Business Transactions",
    "task": "Assisting in Property Settlement / Transfer",
    "table6": "Item 1 (Real Estate Transactions)",
    "status": "IN",
    "synonyms": [
      "assisting in property settlement / transfer",
      "assisting",
      "property",
      "settlement",
      "transfer"
    ]
  },
  {
    "id": 30,
    "category": "3. Advisory & Business Transactions",
    "task": "Drafting Deeds / Legal Documents for Transactions",
    "table6": "Item 6 / 7 (Managing Entities / Formation Agent)",
    "status": "IN",
    "synonyms": [
      "drafting deeds / legal documents for transactions",
      "drafting",
      "deeds",
      "legal",
      "documents",
      "transactions"
    ]
  },
  {
    "id": 31,
    "category": "3. Advisory & Business Transactions",
    "task": "Facilitating Client Signatures / Execution of Documents",
    "table6": "Item 7 (Formation Agent)",
    "status": "IN",
    "synonyms": [
      "facilitating client signatures / execution of documents",
      "facilitating",
      "client",
      "signatures",
      "execution",
      "documents"
    ]
  },
  {
    "id": 32,
    "category": "3. Advisory & Business Transactions",
    "task": "Valuation Reports – Tax/Internal Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "valuation reports – tax/internal reporting only",
      "valuation",
      "reports",
      "internal",
      "reporting",
      "only"
    ]
  },
  {
    "id": 33,
    "category": "3. Advisory & Business Transactions",
    "task": "Valuation Reports – Transaction Execution (part of deal)",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "GREY ZONE / IN (context dependent)",
    "synonyms": [
      "valuation reports – transaction execution (part of deal)",
      "valuation",
      "reports",
      "transaction",
      "execution",
      "part",
      "deal"
    ]
  },
  {
    "id": 34,
    "category": "3. Advisory & Business Transactions",
    "task": "General Strategic Advice (No implementation)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "advisory only",
      "strategy advice",
      "consulting only",
      "no implementation",
      "general",
      "strategic",
      "advice",
      "implementation"
    ]
  },
  {
    "id": 35,
    "category": "3. Advisory & Business Transactions",
    "task": "Business Valuation (Stand-alone report)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "valuation report",
      "business appraisal",
      "company valuation",
      "valuation certificate",
      "business",
      "valuation",
      "stand-alone",
      "report"
    ]
  },
  {
    "id": 36,
    "category": "3. Advisory & Business Transactions",
    "task": "Advising on Structuring a New Company / Trust (No execution)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "advising on structuring a new company / trust (no execution)",
      "advising",
      "structuring",
      "company",
      "trust",
      "execution"
    ]
  },
  {
    "id": 37,
    "category": "3. Advisory & Business Transactions",
    "task": "Preparing Loan / Funding Agreements (Execution)",
    "table6": "Item 5 (Contributions / Financing)",
    "status": "IN",
    "synonyms": [
      "preparing loan / funding agreements (execution)",
      "preparing",
      "loan",
      "funding",
      "agreements",
      "execution"
    ]
  },
  {
    "id": 38,
    "category": "3. Advisory & Business Transactions",
    "task": "Negotiating Contracts on Client’s Behalf",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "IN",
    "synonyms": [
      "negotiating contracts on client’s behalf",
      "negotiating",
      "contracts",
      "client’s",
      "behalf"
    ]
  },
  {
    "id": 39,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Income Tax Return Preparation (ITR)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "tax return",
      "itr prep",
      "lodge tax return",
      "tax compliance",
      "income",
      "return",
      "preparation"
    ]
  },
  {
    "id": 40,
    "category": "4. General Compliance (Safe Zone)",
    "task": "BAS / IAS Preparation & Lodgement",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "bas prep",
      "ias prep",
      "bas lodge",
      "gst reporting",
      "preparation",
      "lodgement"
    ]
  },
  {
    "id": 41,
    "category": "4. General Compliance (Safe Zone)",
    "task": "FBT / Payroll Tax Compliance (Reporting only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "fbt return",
      "payroll tax return",
      "state tax compliance",
      "payroll",
      "compliance",
      "reporting",
      "only"
    ]
  },
  {
    "id": 42,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Financial Statement Preparation",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "prepare financials",
      "annual accounts",
      "financial reports",
      "financial",
      "statement",
      "preparation"
    ]
  },
  {
    "id": 43,
    "category": "4. General Compliance (Safe Zone)",
    "task": "External Audit / SMSF Audit",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "audit services",
      "smsf audit",
      "independent audit",
      "external",
      "audit",
      "smsf"
    ]
  },
  {
    "id": 44,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Bookkeeping / Accounting for Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "bookkeeping / accounting for reporting only",
      "bookkeeping",
      "accounting",
      "reporting",
      "only"
    ]
  },
  {
    "id": 45,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Advisory on Tax Planning / Structuring (no execution)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "advisory on tax planning / structuring (no execution)",
      "advisory",
      "planning",
      "structuring",
      "execution"
    ]
  },
  {
    "id": 46,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Preparing Compliance Checklists & Reports",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "preparing compliance checklists & reports",
      "preparing",
      "compliance",
      "checklists",
      "reports"
    ]
  },
  {
    "id": 47,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Payroll Calculations Only (no payments)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "payroll calculations only (no payments)",
      "payroll",
      "calculations",
      "only",
      "payments"
    ]
  },
  {
    "id": 48,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Superannuation Compliance (employer reporting only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "superannuation compliance (employer reporting only)",
      "superannuation",
      "compliance",
      "employer",
      "reporting",
      "only"
    ]
  },
  {
    "id": 49,
    "category": "4. General Compliance (Safe Zone)",
    "task": "FBT / Payroll Tax Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "fbt / payroll tax reporting only",
      "payroll",
      "reporting",
      "only"
    ]
  },
  {
    "id": 50,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Insolvency Advisory / Reporting (Non-Court)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "insolvency advisory / reporting (non-court)",
      "insolvency",
      "advisory",
      "reporting",
      "non-court"
    ]
  },
  {
    "id": 51,
    "category": "5. Entity / Trust Administration",
    "task": "Acting as Court-appointed Trustee / Receiver",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "acting as court-appointed trustee / receiver",
      "acting",
      "court-appointed",
      "trustee",
      "receiver"
    ]
  },
  {
    "id": 52,
    "category": "5. Entity / Trust Administration",
    "task": "Acting as Voluntary Liquidator / External Administrator (fund control)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "acting as voluntary liquidator / external administrator (fund control)",
      "acting",
      "voluntary",
      "liquidator",
      "external",
      "administrator",
      "fund",
      "control"
    ]
  },
  {
    "id": 53,
    "category": "5. Entity / Trust Administration",
    "task": "Administering Client Trust Funds (Execution authority)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "administering client trust funds (execution authority)",
      "administering",
      "client",
      "trust",
      "funds",
      "execution",
      "authority"
    ]
  },
  {
    "id": 54,
    "category": "5. Entity / Trust Administration",
    "task": "Signing Contracts or Authorizing Payments on Behalf of Clients",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "signing contracts or authorizing payments on behalf of clients",
      "signing",
      "contracts",
      "authorizing",
      "payments",
      "behalf",
      "clients"
    ]
  },
  {
    "id": 55,
    "category": "5. Entity / Trust Administration",
    "task": "Holding Securities or Assets for Clients",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "holding securities or assets for clients",
      "holding",
      "securities",
      "assets",
      "clients"
    ]
  },
  {
    "id": 56,
    "category": "5. Entity / Trust Administration",
    "task": "Preparing Reports Only (No fund control)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "preparing reports only (no fund control)",
      "preparing",
      "reports",
      "only",
      "fund",
      "control"
    ]
  }
];
