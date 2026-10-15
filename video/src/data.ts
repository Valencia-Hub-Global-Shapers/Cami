// Real entries from supabase/seed/0001_programmes.sql, shown as the app shows them.
export type Status = 'open' | 'expected' | 'renewal_only' | 'monitor';

export type Programme = {
  id: string;
  university: string;
  name: string;
  place: string;
  status: Status;
  levels: string[];
  covers: string;
  opens: string;
  deadline: string;
  year: string;
  lon: number;
  lat: number;
};

export const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  expected: 'Expected next call',
  renewal_only: 'Renewal only',
  monitor: 'Monitor',
};

export const PROGRAMMES: Programme[] = [
  {
    id: 'uab',
    university: 'Universitat Autònoma de Barcelona',
    name: '#UABRefugi Palestine Scholarship',
    place: 'Barcelona, Spain',
    status: 'expected',
    levels: ['Bachelor', "Master's", 'PhD'],
    covers:
      '100% tuition, visa, travel, accommodation, EUR 1,100/month, insurance, language courses, mentoring',
    opens: 'July (estimated)',
    deadline: 'Aug-Sep (estimated)',
    year: '2027-2028',
    lon: 2.11,
    lat: 41.5,
  },
  {
    id: 'upf',
    university: 'Universitat Pompeu Fabra (UPF)',
    name: 'UPF Solidària, Refuge Fund for Palestinian Students',
    place: 'Barcelona, Spain',
    status: 'expected',
    levels: ['Bachelor', "Master's", 'PhD'],
    covers:
      'Full tuition waiver, up to EUR 600/month, university residence, laptop loan, Catalan courses, psychological support',
    opens: 'June-July (estimated)',
    deadline: 'July (estimated)',
    year: '2027-2028',
    lon: 2.18,
    lat: 41.39,
  },
  {
    id: 'ubu',
    university: 'University of Burgos',
    name: 'UBU-Refuge Programme',
    place: 'Burgos, Spain',
    status: 'expected',
    levels: ['Bachelor', "Master's", 'PhD'],
    covers:
      '100% tuition, Spanish courses, accommodation support, grants, legal & psychological support, mentor',
    opens: 'January (estimated)',
    deadline: '15 May (estimated)',
    year: '2028-2029',
    lon: -3.7,
    lat: 42.34,
  },
  {
    id: 'uv',
    university: 'Universitat de València',
    name: 'International Refuge Plan',
    place: 'Valencia, Spain',
    status: 'renewal_only',
    levels: ['Bachelor', "Master's"],
    covers: 'Tuition, accommodation, meals, insurance, EUR 2,000 allowance',
    opens: 'Monitor 2027',
    deadline: 'TBD',
    year: '2027-2028',
    lon: -0.38,
    lat: 39.47,
  },
];

export const SAID: Programme = {
  id: 'said',
  university: 'SAID Foundation',
  name: 'SAID Foundation Scholarship',
  place: 'UK',
  status: 'open',
  levels: ["Master's"],
  covers: '',
  opens: '1 September 2026',
  deadline: '30 October 2026',
  year: '2027-2028',
  lon: -1.5,
  lat: 52.5,
};

export const CHECKED = '15 Oct 2026';
