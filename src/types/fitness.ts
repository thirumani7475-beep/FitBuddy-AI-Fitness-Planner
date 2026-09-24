export type Language = 'en' | 'ta';

export type FitnessGoal = 
  | 'fat-loss'
  | 'weight-loss'
  | 'muscle-gain'
  | 'general-fitness'
  | 'general-wellness'
  | 'endurance'
  | 'flexibility'
  | 'strength';

export type WorkoutIntensity = 'low' | 'medium' | 'high';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active';

export type WorkoutLocation = 'home' | 'gym' | 'hybrid';

export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  fitnessGoal: FitnessGoal;
  workoutIntensity: WorkoutIntensity;
  experienceLevel: ExperienceLevel;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: number;
  sessionDurationMinutes: number;
  location: WorkoutLocation;
  availableEquipment: string[];
  injuriesAndLimitations: string[];
  additionalNotes: string;
  language: Language;
}

export interface Exercise {
  id: string;
  name: string;
  nameTamil?: string;
  targetMuscleGroup: string;
  secondaryMuscles?: string[];
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  difficulty: ExperienceLevel;
  instructions: string[];
  safetyCues: string[];
  modification: string;
  equipmentNeeded: string;
  isCompleted?: boolean;
}

export interface WorkoutDay {
  dayIndex: number;
  dayName: string;
  focus: string;
  isRestDay: boolean;
  estimatedMinutes: number;
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
  coachTip: string;
}

export interface FitnessPlan {
  id: string;
  title: string;
  overview: string;
  targetGoal: string;
  workoutIntensity?: WorkoutIntensity;
  experienceLevel: ExperienceLevel;
  days: WorkoutDay[];
  weeklyAdvice: string;
  safetyNotice: string;
  createdAt: string;
  isAdapted?: boolean;
  adaptationReason?: string;
  language: Language;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayTitle: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalExercises: number;
  rpeRating: number; // 1 - 10
  notes: string;
  mood: 'energized' | 'good' | 'tired' | 'exhausted';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface ValidationCheck {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  type: 'safety' | 'volume' | 'warmup' | 'equipment';
}

export interface PlanValidationResult {
  isValid: boolean;
  checks: ValidationCheck[];
  summary: string;
}

export interface BMIData {
  weightKg: number;
  heightCm: number;
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  healthyWeightRange: [number, number];
  recommendedWaterLiters: number;
}

export interface MealItem {
  name: string;
  timing: string;
  description: string;
  calories: number;
  protein: string;
}

export interface NutritionPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterLiters: number;
  overview: string;
  meals: MealItem[];
  preWorkoutFuel: string;
  postWorkoutRecovery: string;
  sleepAndRecoveryProtocol: string[];
}

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  age: number;
  weightKg: number;
  goal: FitnessGoal;
  intensity: WorkoutIntensity;
  originalPlan: FitnessPlan;
  updatedPlan?: FitnessPlan;
  feedbackHistory: string[];
  lastUpdated: string;
}

export interface SQLiteTableInfo {
  tableName: string;
  rowCount: number;
  columns: { name: string; type: string; pk: boolean }[];
  sampleRows: Record<string, any>[];
}

export interface DatabaseStats {
  engine: string;
  file: string;
  tables: SQLiteTableInfo[];
  totalUsers: number;
  totalPlans: number;
  totalFeedbacks: number;
}

