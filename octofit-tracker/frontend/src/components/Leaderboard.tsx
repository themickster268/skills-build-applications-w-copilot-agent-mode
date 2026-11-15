import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const loadLeaderboard = useCallback(
    async () => (await getJson<LeaderboardResponse>('/api/leaderboard')).leaderboard,
    [],
  );
  const { data: leaderboard, error, loading } = useApiData(loadLeaderboard);

  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    items={leaderboard}
    error={error}
    loading={loading}
    emptyMessage="No leaderboard entries yet."
    renderItem={(entry) => `#${String(entry.rank)} ${String(entry.teamName)}: ${String(entry.totalPoints)} points`}
  />;
}
