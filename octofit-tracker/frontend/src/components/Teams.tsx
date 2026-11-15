import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members?: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const loadTeams = useCallback(
    async () => (await getJson<TeamResponse>('/api/teams')).teams,
    [],
  );
  const { data: teams, error, loading } = useApiData(loadTeams);

  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    items={teams}
    error={error}
    loading={loading}
    emptyMessage="No teams yet."
    renderItem={(team) => {
      const members = Array.isArray(team.members) ? team.members.map(String).join(', ') : '';
      return members ? `${String(team.name)} - ${members}` : String(team.name);
    }}
  />;
}
