/**
 * MediCare+ Smart Audio Alarm Engine
 * Provides synthesized medical harmonic chime alerts using Web Audio API
 * plus voice announcement via Web Speech Synthesis API.
 */

class AudioAlarmEngine {
  private audioCtx: AudioContext | null = null;
  private isAlarmRunning = false;
  private alarmInterval: number | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a gentle, melodic 4-note medical chime (C5 - E5 - G5 - C6)
   */
  public playChime(volume: number = 0.35) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        // Soft bell envelope: quick attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(volume, now + idx * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.8);
      });
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  /**
   * Plays a single subtle confirmation click / success tone
   */
  public playSuccessTone() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  /**
   * Announces medication text aloud using browser SpeechSynthesis
   */
  public speakText(text: string, lang: 'ar' | 'en' = 'ar') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // cancel any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.92; // Slightly measured and clear for seniors
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Starts a continuous pulsing medical alarm for sleeping patients
   * Repeats the chime every 3.5 seconds and speaks the medication reminder.
   */
  public startSleepingPatientAlarm(
    medicationName: string,
    dosage: string,
    lang: 'ar' | 'en' = 'ar'
  ) {
    if (this.isAlarmRunning) return;
    this.isAlarmRunning = true;

    // Initial chime
    this.playChime(0.4);

    // Initial voice readout
    const voiceMsg =
      lang === 'ar'
        ? `تنبيه موعد الدواء. حان وقت تناول ${medicationName}. الجرعة: ${dosage}.`
        : `Medication alert. It is time to take ${medicationName}. Dose: ${dosage}.`;

    setTimeout(() => {
      this.speakText(voiceMsg, lang);
    }, 900);

    // Periodic repeating chime every 4 seconds until patient confirms
    this.alarmInterval = window.setInterval(() => {
      if (!this.isAlarmRunning) return;
      this.playChime(0.45);
    }, 4000);
  }

  /**
   * Stops the active alarm and cancels speech
   */
  public stopAlarm() {
    this.isAlarmRunning = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }

  public isRunning(): boolean {
    return this.isAlarmRunning;
  }
}

export const audioAlarm = new AudioAlarmEngine();
