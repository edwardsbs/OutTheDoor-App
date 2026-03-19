import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioAlertService {
  private audioContext: AudioContext | null = null;
  private triggeredMarks = new Set<number>();
  private finalTriggered = false;

  init(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  reset(): void {
    this.triggeredMarks.clear();
    this.finalTriggered = false;
  }

  checkAlerts(remainingSeconds: number, marksInMinutes: number[]): void {
    const roundedMinutes = Math.floor(remainingSeconds / 60);

    for (const mark of marksInMinutes) {
      if (roundedMinutes <= mark && !this.triggeredMarks.has(mark)) {
        this.triggeredMarks.add(mark);
        this.playBeep(mark <= 5 ? 880 : 660, mark <= 5 ? 240 : 160);
      }
    }

    if (remainingSeconds <= 0 && !this.finalTriggered) {
      this.finalTriggered = true;
      this.playFinalAlarm();
    }
  }

  private playBeep(frequency: number, durationMs: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0.0001;
    gainNode.gain.exponentialRampToValueAtTime(0.12, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + durationMs / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + durationMs / 1000);
  }

  private playFinalAlarm(): void {
    if (!this.audioContext) return;

    const notes = [880, 740, 988, 660];
    notes.forEach((freq, i) => {
      window.setTimeout(() => this.playBeep(freq, 250), i * 300);
    });
  }
}