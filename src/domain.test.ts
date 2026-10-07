import { describe, expect, it } from 'vitest'
import { cases, canTransition, caseAlert, deadlineStatus, missingRequirements, profileCompletion } from './domain'

describe('central case business rules', () => {
  it('keeps case identity stable and TM number optional', () => { expect(cases[0].businessId).toBe('X545-001'); expect(cases[0].tmNumber).toBeUndefined() })
  it('calculates deterministic completion requirements', () => { expect(profileCompletion(cases[1])).toBe(100); expect(profileCompletion(cases[0])).toBe(67); expect(missingRequirements(cases[0])).toContain('TM number') })
  it('allows only forward stage transitions', () => { expect(canTransition('Stage 1', 'Stage 2')).toBe(true); expect(canTransition('Stage 1', 'Stage 3')).toBe(false); expect(canTransition('Stage 2', 'Stage 1')).toBe(false) })
  it('calculates due, overdue, and escalated internal deadlines', () => { expect(deadlineStatus('2026-10-10T00:00:00Z')).toBe('Due'); expect(deadlineStatus('2026-10-01T00:00:00Z')).toBe('Escalated') })
  it('flags missing acknowledgement without claiming statutory advice', () => { expect(caseAlert(cases[5])?.status).toBe('Escalated'); expect(caseAlert(cases[1])).toBeNull() })
  it('keeps a Stage 2 client payment independent from agent fees', () => { const stage2 = cases.find(c => c.id === 'case-7')!; expect(stage2.payments.every(p => p.type === 'Client payment')).toBe(true); expect(stage2.payments.some(p => p.type === 'Agent fee')).toBe(false) })
})
