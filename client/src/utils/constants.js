// Cycle phase helpers for the frontend
export const PHASE_CONFIG = {
  menstrual: {
    key: 'menstrual',
    friendlyName: 'Flow phase',
    color: '#F9A8D4',
    textColor: '#BE185D',
    bgClass: 'phase-menstrual',
    icon: 'Droplets',
  },
  follicular: {
    key: 'follicular',
    friendlyName: 'Rising phase',
    color: '#BBF7D0',
    textColor: '#15803D',
    bgClass: 'phase-follicular',
    icon: 'Sprout',
  },
  ovulation: {
    key: 'ovulation',
    friendlyName: 'Glow phase',
    color: '#A78BFA',
    textColor: '#5B21B6',
    bgClass: 'phase-ovulation',
    icon: 'Sparkles',
  },
  luteal: {
    key: 'luteal',
    friendlyName: 'Wind-down phase',
    color: '#FDE68A',
    textColor: '#92400E',
    bgClass: 'phase-luteal',
    icon: 'Moon',
  },
};

export const MOODS = [
  { key: 'happy', label: 'Happy', icon: 'Smile' },
  { key: 'calm', label: 'Calm', icon: 'Cloud' },
  { key: 'anxious', label: 'Anxious', icon: 'Wind' },
  { key: 'irritable', label: 'Irritable', icon: 'Flame' },
  { key: 'sad', label: 'Sad', icon: 'Frown' },
  { key: 'energetic', label: 'Energetic', icon: 'Zap' },
];

export const SYMPTOMS = [
  { key: 'cramps', label: 'Cramps', icon: 'Activity' },
  { key: 'bloating', label: 'Bloating', icon: 'CircleDashed' },
  { key: 'headache', label: 'Headache', icon: 'Brain' },
  { key: 'fatigue', label: 'Fatigue', icon: 'BatteryLow' },
  { key: 'backache', label: 'Backache', icon: 'Bone' },
  { key: 'breast_tenderness', label: 'Tenderness', icon: 'Heart' },
  { key: 'acne', label: 'Acne', icon: 'Sparkles' },
];

export const FLOW_INTENSITIES = [
  { key: 'none', label: 'None', icon: 'Circle' },
  { key: 'spotting', label: 'Spotting', icon: 'Droplet' },
  { key: 'light', label: 'Light', icon: 'Droplets' },
  { key: 'medium', label: 'Medium', icon: 'Waves' },
  { key: 'heavy', label: 'Heavy', icon: 'CloudRain' },
];

export const SYMPTOM_LABELS = {
  cramps: 'Cramps',
  bloating: 'Bloating',
  headache: 'Headache',
  fatigue: 'Fatigue',
  backache: 'Backache',
  breast_tenderness: 'Breast Tenderness',
  acne: 'Acne',
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const toISODate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const todayISO = () => toISODate(new Date());

export const getMoodConfig = (mood) => MOODS.find((m) => m.key === mood);
export const getSymptomConfig = (symptom) => SYMPTOMS.find((s) => s.key === symptom);
