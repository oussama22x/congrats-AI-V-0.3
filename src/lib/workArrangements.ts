/**
 * Work Arrangements - Single Source of Truth
 * 
 * This constant defines the canonical list of work arrangement options
 * used across the entire application (Wizard and Profile Editor).
 */

export interface WorkArrangementOption {
  value: string;
  label: string;
}

export const WORK_ARRANGEMENTS: WorkArrangementOption[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
