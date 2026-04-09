// ─── AUSTRAC TASK MATRIX ─────────────────────────────────────────────────────
// Source: AUSTRAC Table 6 mapped to accounting firm services.
// 57 rows: 34 IN, 22 OUT, 1 GREY ZONE.
// explicit: true = synonyms from spreadsheet, false = derived from task name.
// Rows with explicit:false require a higher match threshold in the classifier.
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
      "asic company setup"
    ],
    "explicit": true
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
      "draft trust deed"
    ],
    "explicit": true
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
      "asic address"
    ],
    "explicit": true
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
      "virtual office address"
    ],
    "explicit": true
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
      "secretarial services"
    ],
    "explicit": true
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
      "third party director"
    ],
    "explicit": true
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
      "form 484"
    ],
    "explicit": true
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
      "equity agreement"
    ],
    "explicit": true
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
      "company minutes"
    ],
    "explicit": true
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
      "replace constitution"
    ],
    "explicit": true
  },
  {
    "id": 10,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Filing ASIC Forms (officeholder updates, annual review)",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "asic",
      "forms",
      "officeholder",
      "updates",
      "annual",
      "review"
    ],
    "explicit": false
  },
  {
    "id": 11,
    "category": "1. Corporate Secretarial & Entity Setup",
    "task": "Drafting Trust Amendments / Variations",
    "table6": "Item 6 (Managing Entities)",
    "status": "IN",
    "synonyms": [
      "amendments",
      "variations"
    ],
    "explicit": false
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
      "operate bank account"
    ],
    "explicit": true
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
      "process payroll payments"
    ],
    "explicit": true
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
      "aba creditors"
    ],
    "explicit": true
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
      "operate trust account"
    ],
    "explicit": true
  },
  {
    "id": 16,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Petty Cash Management (Cash on Hand)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "petty",
      "cash",
      "management",
      "cash",
      "hand"
    ],
    "explicit": false
  },
  {
    "id": 17,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Credit Card Payments on Client Behalf",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "credit",
      "card",
      "payments",
      "behalf"
    ],
    "explicit": false
  },
  {
    "id": 18,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Reconciling Loan / Financing Accounts",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "loan",
      "financing",
      "accounts"
    ],
    "explicit": false
  },
  {
    "id": 19,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Authorising Payment Runs (Client Funds)",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "payment",
      "runs"
    ],
    "explicit": false
  },
  {
    "id": 20,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Processing Refunds / Rebates",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "refunds",
      "rebates"
    ],
    "explicit": false
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
      "bank reconciliation work"
    ],
    "explicit": true
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
      "debtor entry"
    ],
    "explicit": true
  },
  {
    "id": 23,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Generating Reports (Read-only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "read"
    ],
    "explicit": false
  },
  {
    "id": 24,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "Payroll Processing without fund movement",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "payroll",
      "movement"
    ],
    "explicit": false
  },
  {
    "id": 25,
    "category": "2. Daily Bookkeeping & Treasury",
    "task": "BAS / GST Calculation (no payment authority)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "calculation",
      "payment",
      "authority"
    ],
    "explicit": false
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
      "sale mandate"
    ],
    "explicit": true
  },
  {
    "id": 27,
    "category": "3. Advisory & Business Transactions",
    "task": "Helping a Client Buy a Business / Trust",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "IN",
    "synonyms": [],
    "explicit": false
  },
  {
    "id": 28,
    "category": "3. Advisory & Business Transactions",
    "task": "Organizing Debt / Equity Funding (Capital raising)",
    "table6": "Item 5 (Contributions / Financing)",
    "status": "IN",
    "synonyms": [
      "debt",
      "equity",
      "funding",
      "capital",
      "raising"
    ],
    "explicit": false
  },
  {
    "id": 29,
    "category": "3. Advisory & Business Transactions",
    "task": "Assisting in Property Settlement / Transfer",
    "table6": "Item 1 (Real Estate Transactions)",
    "status": "IN",
    "synonyms": [
      "property",
      "settlement",
      "transfer"
    ],
    "explicit": false
  },
  {
    "id": 30,
    "category": "3. Advisory & Business Transactions",
    "task": "Drafting Deeds / Legal Documents for Transactions",
    "table6": "Item 6 / 7 (Managing Entities / Formation Agent)",
    "status": "IN",
    "synonyms": [
      "deeds",
      "legal",
      "documents",
      "transactions"
    ],
    "explicit": false
  },
  {
    "id": 31,
    "category": "3. Advisory & Business Transactions",
    "task": "Facilitating Client Signatures / Execution of Documents",
    "table6": "Item 7 (Formation Agent)",
    "status": "IN",
    "synonyms": [
      "signatures",
      "documents"
    ],
    "explicit": false
  },
  {
    "id": 32,
    "category": "3. Advisory & Business Transactions",
    "task": "Valuation Reports – Tax/Internal Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "valuation",
      "reporting"
    ],
    "explicit": false
  },
  {
    "id": 33,
    "category": "3. Advisory & Business Transactions",
    "task": "Valuation Reports – Transaction Execution (part of deal)",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "GREY ZONE / IN (context dependent)",
    "synonyms": [
      "valuation",
      "transaction"
    ],
    "explicit": false
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
      "no implementation"
    ],
    "explicit": true
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
      "valuation certificate"
    ],
    "explicit": true
  },
  {
    "id": 36,
    "category": "3. Advisory & Business Transactions",
    "task": "Advising on Structuring a New Company / Trust (No execution)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "structuring"
    ],
    "explicit": false
  },
  {
    "id": 37,
    "category": "3. Advisory & Business Transactions",
    "task": "Preparing Loan / Funding Agreements (Execution)",
    "table6": "Item 5 (Contributions / Financing)",
    "status": "IN",
    "synonyms": [
      "loan",
      "funding",
      "agreements"
    ],
    "explicit": false
  },
  {
    "id": 38,
    "category": "3. Advisory & Business Transactions",
    "task": "Negotiating Contracts on Client’s Behalf",
    "table6": "Item 2 (Buying/Selling Entities)",
    "status": "IN",
    "synonyms": [
      "contracts",
      "client’s",
      "behalf"
    ],
    "explicit": false
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
      "tax compliance"
    ],
    "explicit": true
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
      "gst reporting"
    ],
    "explicit": true
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
      "state tax compliance"
    ],
    "explicit": true
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
      "financial reports"
    ],
    "explicit": true
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
      "independent audit"
    ],
    "explicit": true
  },
  {
    "id": 44,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Bookkeeping / Accounting for Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "bookkeeping",
      "accounting",
      "reporting"
    ],
    "explicit": false
  },
  {
    "id": 45,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Advisory on Tax Planning / Structuring (no execution)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "advisory",
      "planning",
      "structuring"
    ],
    "explicit": false
  },
  {
    "id": 46,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Preparing Compliance Checklists & Reports",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "compliance",
      "checklists"
    ],
    "explicit": false
  },
  {
    "id": 47,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Payroll Calculations Only (no payments)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "payroll",
      "calculations",
      "payments"
    ],
    "explicit": false
  },
  {
    "id": 48,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Superannuation Compliance (employer reporting only)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "superannuation",
      "compliance",
      "employer",
      "reporting"
    ],
    "explicit": false
  },
  {
    "id": 49,
    "category": "4. General Compliance (Safe Zone)",
    "task": "FBT / Payroll Tax Reporting Only",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "payroll",
      "reporting"
    ],
    "explicit": false
  },
  {
    "id": 50,
    "category": "4. General Compliance (Safe Zone)",
    "task": "Insolvency Advisory / Reporting (Non-Court)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "insolvency",
      "advisory",
      "reporting",
      "court"
    ],
    "explicit": false
  },
  {
    "id": 51,
    "category": "5. Entity / Trust Administration",
    "task": "Acting as Court-appointed Trustee / Receiver",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "court",
      "appointed",
      "trustee",
      "receiver"
    ],
    "explicit": false
  },
  {
    "id": 52,
    "category": "5. Entity / Trust Administration",
    "task": "Acting as Voluntary Liquidator / External Administrator (fund control)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "voluntary",
      "liquidator",
      "administrator",
      "control"
    ],
    "explicit": false
  },
  {
    "id": 53,
    "category": "5. Entity / Trust Administration",
    "task": "Administering Client Trust Funds (Execution authority)",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "authority"
    ],
    "explicit": false
  },
  {
    "id": 54,
    "category": "5. Entity / Trust Administration",
    "task": "Signing Contracts or Authorizing Payments on Behalf of Clients",
    "table6": "Item 4 (Managing Accounts)",
    "status": "IN",
    "synonyms": [
      "contracts",
      "authorizing",
      "payments",
      "behalf"
    ],
    "explicit": false
  },
  {
    "id": 55,
    "category": "5. Entity / Trust Administration",
    "task": "Holding Securities or Assets for Clients",
    "table6": "Item 3 (Managing Assets)",
    "status": "IN",
    "synonyms": [
      "securities",
      "assets"
    ],
    "explicit": false
  },
  {
    "id": 56,
    "category": "5. Entity / Trust Administration",
    "task": "Preparing Reports Only (No fund control)",
    "table6": "",
    "status": "OUT",
    "synonyms": [
      "control"
    ],
    "explicit": false
  }
];
