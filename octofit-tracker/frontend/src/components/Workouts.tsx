import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

const userEmail = 'mona@example.com';
type Workout = { title: string; reason: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const loadWorkouts = useCallback(
    async () => (await getJson<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)).suggestions,
    [],
  );
  const { data: suggestions, error, loading } = useApiData(loadWorkouts);

  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    items={suggestions}
    error={error}
    loading={loading}
    emptyMessage="No workout suggestions yet."
    renderItem={(workout) => `${String(workout.title)} - ${String(workout.reason)}`}
  />;
}
