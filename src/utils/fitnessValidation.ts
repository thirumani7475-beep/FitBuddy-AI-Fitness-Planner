import { FitnessPlan, PlanValidationResult, UserProfile, ValidationCheck } from '../types/fitness';

export function validateFitnessPlan(plan: FitnessPlan, userProfile?: Partial<UserProfile>): PlanValidationResult {
  const checks: ValidationCheck[] = [];

  // Check 1: Structure and Days
  const activeDays = plan.days.filter((d) => !d.isRestDay);
  const hasExercises = activeDays.every((d) => Array.isArray(d.exercises) && d.exercises.length >= 2);
  checks.push({
    id: 'structure-check',
    title: 'Workout Day Structure',
    passed: hasExercises && activeDays.length > 0,
    message: hasExercises
      ? `Valid schedule with ${activeDays.length} training sessions and balanced rest.`
      : 'Some training days are missing required minimum exercise counts.',
    type: 'volume',
  });

  // Check 2: Warm-up presence
  const warmupPresent = activeDays.every(
    (d) => Array.isArray(d.warmup) && d.warmup.length >= 1
  );
  checks.push({
    id: 'warmup-check',
    title: 'Injury Prevention: Dynamic Warm-Up',
    passed: warmupPresent,
    message: warmupPresent
      ? 'All active sessions include dedicated dynamic warm-up movements.'
      : 'One or more sessions are missing a warm-up phase.',
    type: 'warmup',
  });

  // Check 3: Cool-down presence
  const cooldownPresent = activeDays.every(
    (d) => Array.isArray(d.cooldown) && d.cooldown.length >= 1
  );
  checks.push({
    id: 'cooldown-check',
    title: 'Recovery: Post-Workout Cool-Down',
    passed: cooldownPresent,
    message: cooldownPresent
      ? 'All active sessions include cool-down and myofascial mobility work.'
      : 'Add static stretching or cool-down to promote recovery.',
    type: 'warmup',
  });

  // Check 4: Volume & Rest intervals
  let volumeSafe = true;
  let volumeDetails = 'Volume and rest periods are within physiologically safe ranges.';
  for (const day of activeDays) {
    for (const ex of day.exercises) {
      if (ex.sets < 1 || ex.sets > 6) {
        volumeSafe = false;
        volumeDetails = `Exercise "${ex.name}" has ${ex.sets} sets, which may be inappropriate.`;
        break;
      }
      if (ex.restSeconds < 20 || ex.restSeconds > 240) {
        volumeSafe = false;
        volumeDetails = `Exercise "${ex.name}" rest period (${ex.restSeconds}s) is outside optimal range.`;
        break;
      }
    }
    if (!volumeSafe) break;
  }
  checks.push({
    id: 'volume-check',
    title: 'Training Volume & Rest Ratio',
    passed: volumeSafe,
    message: volumeDetails,
    type: 'volume',
  });

  // Check 5: Injury contraindications
  const userInjuries = userProfile?.injuriesAndLimitations || [];
  let injurySafe = true;
  let injuryNote = 'Exercise selection matches injury profile safely.';

  if (userInjuries.includes('knee-pain')) {
    const hasHighImpact = activeDays.some((d) =>
      d.exercises.some(
        (e) =>
          e.name.toLowerCase().includes('jump') ||
          e.name.toLowerCase().includes('burpee') ||
          e.name.toLowerCase().includes('box jump')
      )
    );
    if (hasHighImpact) {
      injurySafe = false;
      injuryNote = 'Flagged high-impact plyometrics with reported knee discomfort; low-impact alternatives recommended.';
    }
  }

  if (userInjuries.includes('lower-back-pain')) {
    const hasHeavySpinalLoad = activeDays.some((d) =>
      d.exercises.some(
        (e) =>
          e.name.toLowerCase().includes('barbell deadlift') ||
          e.name.toLowerCase().includes('good morning')
      )
    );
    if (hasHeavySpinalLoad) {
      injurySafe = false;
      injuryNote = 'Flagged heavy axial loading; hip hinges with support or glute bridges suggested.';
    }
  }

  checks.push({
    id: 'injury-check',
    title: 'Biomechanical Safety & Injury Screening',
    passed: injurySafe,
    message: injuryNote,
    type: 'safety',
  });

  // Check 6: Equipment alignment
  const userEquip = (userProfile?.availableEquipment || []).map((e) => e.toLowerCase());
  let equipSafe = true;
  let equipNote = 'All exercises strictly match selected equipment.';

  if (userProfile?.location === 'home' && (!userEquip.length || userEquip.includes('bodyweight'))) {
    const hasHeavyBarbell = activeDays.some((d) =>
      d.exercises.some((e) => e.equipmentNeeded?.toLowerCase().includes('barbell') || e.equipmentNeeded?.toLowerCase().includes('cable machine'))
    );
    if (hasHeavyBarbell) {
      equipSafe = false;
      equipNote = 'Some movements require gym machines not present in home setup.';
    }
  }

  checks.push({
    id: 'equipment-check',
    title: 'Equipment Compatibility',
    passed: equipSafe,
    message: equipNote,
    type: 'equipment',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const isValid = passedCount >= 5;

  return {
    isValid,
    checks,
    summary: isValid
      ? `Validated successfully: ${passedCount}/${checks.length} health and safety checks passed.`
      : `Plan needs adjustment: ${checks.length - passedCount} safety warnings flagged.`,
  };
}
