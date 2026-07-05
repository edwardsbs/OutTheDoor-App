export interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean; // check state is only used at run time, not persisted on the scenario
}

export interface ScenarioTask {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  isOptional: boolean;
  isEnabledByDefault: boolean;
  checklist?: ChecklistItem[];
  instructions?: string;
  details?: string;
}

export interface Scenario {
  id: string;
  name: string;
  defaultLeaveTime: string; // "08:00"
  bufferMinutes: number;
  autoStart: boolean;
  alertMinutes: number[];
  tasks: ScenarioTask[];
  createdAt: string;
  updatedAt: string;
}
