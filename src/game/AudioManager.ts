export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private sounds: Map<string, AudioBuffer> = new Map();
  private backgroundMusic: AudioBufferSourceNode | null = null;

  constructor() {
    this.initAudioContext();
    this.createSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  private async createSounds() {
    if (!this.audioContext) return;

    // Create synthetic sounds
    this.createCatchSound();
    this.createLoseLifeSound();
    this.createBackgroundMusic();
  }

  private createCatchSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Happy ding sound
      data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 8) * 0.5 +
                Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 10) * 0.3;
    }

    this.sounds.set('catch', buffer);
  }

  private createLoseLifeSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Sad descending sound
      const freq = 400 - t * 200;
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3) * 0.4;
    }

    this.sounds.set('loseLife', buffer);
  }

  private createBackgroundMusic() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 8, this.audioContext.sampleRate);
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    // Create a simple, happy melody
    const melody = [523, 587, 659, 698, 784, 698, 659, 587]; // C, D, E, F, G, F, E, D
    const beatLength = this.audioContext.sampleRate;

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const beatIndex = Math.floor(t) % melody.length;
      const freq = melody[beatIndex];
      
      const envelope = Math.sin(t * Math.PI * 2) * 0.1 * Math.exp(-(t % 1) * 2);
      const wave = Math.sin(2 * Math.PI * freq * t) * envelope;
      
      leftData[i] = wave;
      rightData[i] = wave * 0.8; // Slight stereo effect
    }

    this.sounds.set('background', buffer);
  }

  playSound(soundName: string, volume = 1) {
    if (!this.audioContext || !this.sounds.has(soundName)) return;

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const buffer = this.sounds.get(soundName)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.masterVolume * volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  startBackgroundMusic() {
    if (!this.audioContext || !this.sounds.has('background') || this.backgroundMusic) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const buffer = this.sounds.get('background')!;
    this.backgroundMusic = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    this.backgroundMusic.buffer = buffer;
    this.backgroundMusic.loop = true;
    gainNode.gain.value = this.masterVolume * 0.3;
    
    this.backgroundMusic.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    this.backgroundMusic.start();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}