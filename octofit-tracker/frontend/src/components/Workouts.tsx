import { CapabilityCard } from './CapabilityCard.js';
const userEmail = 'mona@example.com';

export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`}
    responseKey="suggestions"
    emptyMessage="No workout suggestions yet."
    renderItem={(workout) => `${String(workout.title)} - ${String(workout.reason)}`}
  />;
}
