export type Stage = 'Stage 1' | 'Stage 2' | 'Stage 3' | 'Stage 4'
export type CaseStatus = 'Active' | 'Completed' | 'On hold'
export type AlertStatus = 'Due soon' | 'Due' | 'Overdue' | 'Escalated' | 'Completed'

export type Client = { id: string; code: string; name: string; phone: string; email: string; city: string; cnic: string }
export type Agent = { id: string; name: string; city: string; active: boolean }
export type Payment = { id: string; caseId: string; date: string; amount: number; type: 'Client payment' | 'Agent fee'; stage: Stage; status: 'Received' | 'Pending'; reference: string }
export type Document = { id: string; caseId: string; type: string; name: string; status: 'Verified' | 'Pending' | 'Missing'; uploadedAt?: string }
export type LedgerEntry = { id: string; caseId: string; date: string; detail: string; due: number; received: number; stage: Stage }
export type CaseEvent = { id: string; caseId: string; type: string; description: string; at: string; actor: string }
export type CaseNote = { id: string; caseId: string; text: string; at: string; author: string }
export type CaseRecord = {
  id: string; clientId: string; caseNumber: string; businessId: string; tmNumber?: string; applicantName: string; cnic?: string
  mark: string; className: string; applicationType: string; city: string; stage: Stage; subStage: string; status: CaseStatus
  openedAt: string; filingDate?: string; acknowledgementDate?: string; acknowledgementDueAt: string; agentId?: string
  services: string[]; notes: CaseNote[]; events: CaseEvent[]; documents: Document[]; payments: Payment[]; ledger: LedgerEntry[]
}

export const STAGES: Record<Stage, string[]> = {
  'Stage 1': ['Application Filed', 'Acknowledgement', 'Examination'],
  'Stage 2': ['Assigned', 'Approved', 'Hearing'],
  'Stage 3': ['Published', 'Demand Note', 'Demand Note Paid', 'Opposition'],
  'Stage 4': ['Certificate', 'Certificate Posted', 'Complete'],
}
export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar']
export const CLASSES = ['09', '25', '35', '41', '42']
export const DOC_TYPES = ['Application', 'CNIC / Incorporation', 'Power of attorney', 'Acknowledgement', 'Certificate']

export const profileRequirements = [
  { key: 'applicant', label: 'Applicant name', check: (c: CaseRecord) => Boolean(c.applicantName) },
  { key: 'cnic', label: 'Applicant CNIC', check: (c: CaseRecord) => Boolean(c.cnic) },
  { key: 'filingDate', label: 'Filing date', check: (c: CaseRecord) => Boolean(c.filingDate) },
  { key: 'applicationDocument', label: 'Application document', check: (c: CaseRecord) => c.documents.some(d => d.type === 'Application' && d.status !== 'Missing') },
  { key: 'agent', label: 'Agent assignment', check: (c: CaseRecord) => Boolean(c.agentId) },
  { key: 'tmNumber', label: 'TM number', check: (c: CaseRecord) => Boolean(c.tmNumber) },
]

export function profileCompletion(c: CaseRecord) {
  const complete = profileRequirements.filter(rule => rule.check(c)).length
  return Math.round((complete / profileRequirements.length) * 100)
}
export function missingRequirements(c: CaseRecord) { return profileRequirements.filter(rule => !rule.check(c)).map(rule => rule.label) }
export function deadlineStatus(dueAt: string, now = new Date('2026-10-08T12:00:00Z')): AlertStatus {
  const due = new Date(dueAt).getTime(); const current = now.getTime(); const day = 86400000
  if (current < due - 3 * day) return 'Due soon'
  if (current < due) return 'Due'
  if (current < due + 3 * day) return 'Overdue'
  return 'Escalated'
}
export function canTransition(from: Stage, to: Stage) { return to === from || ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'].indexOf(to) === ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'].indexOf(from) + 1 }
export function caseAlert(c: CaseRecord): { status: AlertStatus; message: string } | null {
  if (c.acknowledgementDate) return null
  const status = deadlineStatus(c.acknowledgementDueAt)
  return { status, message: `Acknowledgement ${status.toLowerCase()} — internal 20-day demo rule` }
}

const date = (daysAgo: number) => new Date(Date.UTC(2026, 9, 8 - daysAgo, 9)).toISOString()
const event = (caseId: string, id: string, type: string, description: string, daysAgo: number): CaseEvent => ({ id, caseId, type, description, at: date(daysAgo), actor: 'Demo operator' })
const base = (id: string, clientId: string, caseNumber: string, values: Partial<CaseRecord>): CaseRecord => ({
  id, clientId, caseNumber, businessId: `${clientId.replace('-', '')}-${caseNumber}`, applicantName: '', mark: '', className: '35', applicationType: 'Trademark', city: 'Karachi', stage: 'Stage 1', subStage: 'Application Filed', status: 'Active', openedAt: date(4), acknowledgementDueAt: date(-16), services: ['Trademark filing'], notes: [], events: [], documents: [], payments: [], ledger: [], ...values,
})

export const agents: Agent[] = [
  { id: 'agent-uzma', name: 'Uzma', city: 'Karachi', active: true }, { id: 'agent-faisal', name: 'Faisal', city: 'Lahore', active: true },
  { id: 'agent-rashid', name: 'Rashid', city: 'Islamabad', active: true }, { id: 'agent-sulman', name: 'Sulman', city: 'Peshawar', active: true },
]
export const clients: Client[] = [
  { id: 'X-545', code: 'X-545', name: 'Northstar Foods (Demo)', phone: '+92 300 000 1001', email: 'northstar@example.test', city: 'Karachi', cnic: '00000-0000000-0' },
  { id: 'X-546', code: 'X-546', name: 'Canvas Works (Demo)', phone: '+92 300 000 1002', email: 'canvas@example.test', city: 'Lahore', cnic: '00000-0000000-1' },
  { id: 'X-547', code: 'X-547', name: 'Pioneer Labs (Demo)', phone: '+92 300 000 1003', email: 'pioneer@example.test', city: 'Islamabad', cnic: '00000-0000000-2' },
  { id: 'X-548', code: 'X-548', name: 'Summit Textiles (Demo)', phone: '+92 300 000 1004', email: 'summit@example.test', city: 'Peshawar', cnic: '00000-0000000-3' },
  { id: 'X-549', code: 'X-549', name: 'Mosaic Studio (Demo)', phone: '+92 300 000 1005', email: 'mosaic@example.test', city: 'Karachi', cnic: '00000-0000000-4' },
]
export const cases: CaseRecord[] = [
  base('case-1', 'X-545', '001', { applicantName: 'Northstar Foods (Demo)', cnic: '00000-0000000-0', mark: 'NORTHSTAR', className: '35', city: 'Karachi', stage: 'Stage 1', subStage: 'Application Filed', filingDate: date(3), documents: [{ id: 'doc-1', caseId: 'case-1', type: 'Application', name: 'northstar-application.pdf', status: 'Verified', uploadedAt: date(2) }], events: [event('case-1', 'event-1', 'Case created', 'Central case identity created', 3)] }),
  base('case-2', 'X-545', '002', { applicantName: 'Northstar Foods (Demo)', cnic: '00000-0000000-0', mark: 'NORTHSTAR KITCHEN', className: '43', city: 'Karachi', stage: 'Stage 4', subStage: 'Complete', status: 'Completed', tmNumber: 'TM-88421', filingDate: date(120), acknowledgementDate: date(110), agentId: 'agent-uzma', documents: [{ id: 'doc-2', caseId: 'case-2', type: 'Application', name: 'application.pdf', status: 'Verified', uploadedAt: date(119) }, { id: 'doc-3', caseId: 'case-2', type: 'Certificate', name: 'certificate.pdf', status: 'Verified', uploadedAt: date(5) }], payments: [{ id: 'pay-1', caseId: 'case-2', date: date(18), amount: 25000, type: 'Client payment', stage: 'Stage 4', status: 'Received', reference: 'DEMO-REC-001' }], events: [event('case-2', 'event-2', 'Certificate posted', 'Certificate verified and posted', 5)] }),
  base('case-3', 'X-546', '001', { applicantName: 'Canvas Works (Demo)', mark: 'CANVASLY', className: '25', city: 'Lahore', stage: 'Stage 1', subStage: 'Acknowledgement', acknowledgementDate: date(2), filingDate: date(26), documents: [], events: [event('case-3', 'event-3', 'Acknowledgement received', 'Acknowledgement marked received', 2)] }),
  base('case-4', 'X-546', '002', { applicantName: 'Canvas Works (Demo)', cnic: '00000-0000000-1', mark: 'THREADHOUSE', className: '25', city: 'Lahore', stage: 'Stage 2', subStage: 'Assigned', tmNumber: 'TM-90114', filingDate: date(70), acknowledgementDate: date(60), agentId: 'agent-faisal', documents: [{ id: 'doc-4', caseId: 'case-4', type: 'Application', name: 'threadhouse-application.pdf', status: 'Verified', uploadedAt: date(69) }], payments: [{ id: 'pay-2', caseId: 'case-4', date: date(20), amount: 18000, type: 'Client payment', stage: 'Stage 2', status: 'Received', reference: 'DEMO-REC-002' }], events: [event('case-4', 'event-4', 'Agent assigned', 'Faisal assigned for Stage 2 work', 18)] }),
  base('case-5', 'X-547', '001', { applicantName: 'Pioneer Labs (Demo)', cnic: '00000-0000000-2', mark: 'PIONEER AI', className: '42', city: 'Islamabad', stage: 'Stage 3', subStage: 'Published', tmNumber: 'TM-77602', filingDate: date(160), acknowledgementDate: date(150), agentId: 'agent-rashid', documents: [{ id: 'doc-5', caseId: 'case-5', type: 'Application', name: 'pioneer-application.pdf', status: 'Verified', uploadedAt: date(159) }, { id: 'doc-6', caseId: 'case-5', type: 'Acknowledgement', name: 'acknowledgement.pdf', status: 'Verified', uploadedAt: date(148) }], ledger: [{ id: 'ledger-1', caseId: 'case-5', date: date(20), detail: 'Publication fee', due: 35000, received: 20000, stage: 'Stage 3' }], events: [event('case-5', 'event-5', 'Stage changed', 'Moved to Stage 3 / Published', 20)] }),
  base('case-6', 'X-547', '002', { applicantName: 'Pioneer Labs (Demo)', cnic: '00000-0000000-2', mark: 'PIONEER CLOUD', className: '09', city: 'Islamabad', stage: 'Stage 1', subStage: 'Application Filed', filingDate: date(29), acknowledgementDueAt: date(9), documents: [{ id: 'doc-7', caseId: 'case-6', type: 'Application', name: 'pioneer-cloud.pdf', status: 'Verified', uploadedAt: date(28) }], events: [event('case-6', 'event-6', 'Alert generated', 'Acknowledgement is overdue', 5)] }),
  base('case-7', 'X-548', '001', { applicantName: 'Summit Textiles (Demo)', cnic: '00000-0000000-3', mark: 'SUMMIT WEAVE', className: '25', city: 'Peshawar', stage: 'Stage 2', subStage: 'Hearing', tmNumber: 'TM-66231', filingDate: date(85), acknowledgementDate: date(74), agentId: 'agent-sulman', documents: [{ id: 'doc-8', caseId: 'case-7', type: 'Application', name: 'summit-weave.pdf', status: 'Verified', uploadedAt: date(84) }], payments: [{ id: 'pay-3', caseId: 'case-7', date: date(30), amount: 12000, type: 'Client payment', stage: 'Stage 2', status: 'Received', reference: 'DEMO-REC-003' }], events: [event('case-7', 'event-7', 'Payment recorded', 'Stage 2 client payment recorded; no agent fee created', 30)] }),
  base('case-8', 'X-549', '001', { applicantName: 'Mosaic Studio (Demo)', mark: 'MOSAIC', className: '41', city: 'Karachi', stage: 'Stage 1', subStage: 'Examination', filingDate: date(40), acknowledgementDate: date(31), documents: [{ id: 'doc-9', caseId: 'case-8', type: 'Application', name: 'mosaic.pdf', status: 'Verified', uploadedAt: date(39) }], notes: [{ id: 'note-1', caseId: 'case-8', text: 'Awaiting examiner update.', at: date(3), author: 'Demo operator' }], events: [event('case-8', 'event-8', 'Note added', 'Awaiting examiner update', 3)] }),
]
