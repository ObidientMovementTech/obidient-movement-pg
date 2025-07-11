// API Base URL
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Organization affiliations
export const ORGANIZATION_OPTIONS = [
  { label: 'Fixpolitics', value: 'Fixpolitics' },
  { label: 'EiE', value: 'EiE' },
  { label: 'BUDGit', value: 'BUDGit' },
  { label: 'YIAGA', value: 'YIAGA' },
  { label: 'WARDC', value: 'WARDC' },
  { label: 'WRAPA', value: 'WRAPA' },
  { label: 'CODE', value: 'CODE' },
  { label: 'CLEEN', value: 'CLEEN' },
  { label: 'PLAC', value: 'PLAC' },
  { label: 'CISLAC', value: 'CISLAC' },
];

// Political party options
export const POLITICAL_PARTY_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Accord (A)', value: 'Accord' },
  { label: 'Action Alliance (AA)', value: 'Action Alliance' },
  { label: 'African Action Congress (AAC)', value: 'African Action Congress' },
  { label: 'African Democratic Congress (ADC)', value: 'African Democratic Congress' },
  { label: 'Action Democratic Party (ADP)', value: 'Action Democratic Party' },
  { label: 'All Progressives Congress (APC)', value: 'All Progressives Congress' },
  { label: 'All Progressives Grand Alliance (APGA)', value: 'All Progressives Grand Alliance' },
  { label: 'Allied Peoples Movement (APM)', value: 'Allied Peoples Movement' },
  { label: 'Action Peoples Party (APP)', value: 'Action Peoples Party' },
  { label: 'Boot Party (BP)', value: 'Boot Party' },
  { label: 'Labour Party (LP)', value: 'Labour Party' },
  { label: 'National Rescue Movement (NRM)', value: 'National Rescue Movement' },
  { label: 'New Nigeria Peoples Party (NNPP)', value: 'New Nigeria Peoples Party' },
  { label: 'Peoples Democratic Party (PDP)', value: 'Peoples Democratic Party' },
  { label: 'Peoples Redemption Party (PRP)', value: 'Peoples Redemption Party' },
  { label: 'Social Democratic Party (SDP)', value: 'Social Democratic Party' },
  { label: 'Young Progressive Party (YPP)', value: 'Young Progressive Party' },
  { label: 'Youth Party (YP)', value: 'Youth Party' },
  { label: 'Zenith Labour Party (ZLP)', value: 'Zenith Labour Party' },
];
