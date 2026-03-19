export interface ScenarioTask {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  isOptional: boolean;
  isEnabledByDefault: boolean;
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
