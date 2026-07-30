import { DesignationType, ApprovalPeriodType, PlaceStatus } from '../types';

export const DEFAULT_AREA = 'Pithampur';

export const DEFAULT_AREAS: string[] = [
  'Pithampur',
  'Indore',
  'Dhar',
  'Ujjain',
  'Dewas'
];

export const DESIGNATION_OPTIONS: DesignationType[] = [
  'Satsang Karta',
  'Reader',
  'Pathi'
];

export const APPROVAL_PERIOD_OPTIONS: ApprovalPeriodType[] = [
  '6 Months',
  '1 Year',
  '2 Years',
  '3 Years',
  '4 Years',
  '5 Years',
  '6 Years'
];

export const PLACE_STATUS_OPTIONS: PlaceStatus[] = [
  'POINT',
  'CENTRE',
  'SUB CENTRE',
];

export const INITIAL_SATSANG_PLACES = [
  { id: 'sp-1', name: 'ANJANIYA', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-2', name: 'RAJGARH', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-3', name: 'PIPLIYA', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-4', name: 'KANWAN', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-5', name: 'SAKAD', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-6', name: 'INDRAPUR', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-7', name: 'KHEDI (MP)', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-8', name: 'KHADKI', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-9', name: 'PIPRIDEB', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-10', name: 'UPARI', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-11', name: 'BANDERI', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-12', name: 'DHAMNOD', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-13', name: 'KATTHIWARA', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-14', name: 'BARJHAR', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-15', name: 'PITHAMPUR', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-16', name: 'NAGDA (MP)', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-17', name: 'KHERWAS', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-18', name: 'BIDWAL', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-19', name: 'BHULGAON', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-20', name: 'SENDHWA', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-21', name: 'BAGDI', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-22', name: 'DHAR', status: 'SUB CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-23', name: 'WADLIPADA', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-24', name: 'BAKHATPU', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-25', name: 'BHIMFALIYA', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-26', name: 'KARAVAD', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-27', name: 'MEGHNAGAR', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-28', name: 'SANDLA', status: 'CENTRE' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
  { id: 'sp-29', name: 'Ranapur', status: 'POINT' as PlaceStatus, area: 'Pithampur', created_at: new Date().toISOString() },
];
