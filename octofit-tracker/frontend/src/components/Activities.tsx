import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const loadActivities = useCallback(
    async () => (await getJson<ActivityResponse>('/api/activities')).activities,
    [],
  );
  const { data: activities, error, loading } = useApiData(loadActivities);

  return <CapabilityCard
    title="Activities"
    description="Track student activity minutes and points."
    items={activities}
    error={error}
    loading={loading}
    emptyMessage="No activities yet."
    renderItem={(activity) => `${String(activity.type)} - ${String(activity.minutes)} minutes - ${String(activity.points)} points`}
  />;
}
