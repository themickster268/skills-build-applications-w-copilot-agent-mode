import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    responseKey="teams"
    emptyMessage="No teams yet."
    renderItem={(team) => {
      const members = Array.isArray(team.members) ? team.members.map(String).join(', ') : '';
      return members ? `${String(team.name)} - ${members}` : String(team.name);
    }}
  />;
}
