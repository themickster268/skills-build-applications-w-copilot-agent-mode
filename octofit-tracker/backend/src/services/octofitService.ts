import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const isObjectId = (value: unknown): value is string =>
    typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw Object.assign(new Error('Valid userId and teamId are required'), { status: 400 });
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw Object.assign(new Error('Activity type is required'), { status: 400 });
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Activity minutes must be a positive number'), { status: 400 });
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!(userExists && teamExists)) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team must be an object'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw Object.assign(new Error('Team mascot is required'), { status: 400 });
  }

  const memberIds: string[] = [];
  if (members !== undefined) {
    if (!Array.isArray(members)) {
      throw Object.assign(new Error('Team members must be an array'), { status: 400 });
    }
    for (const memberId of members) {
      if (typeof memberId !== 'string' || !/^[a-f\d]{24}$/i.test(memberId)) {
        throw Object.assign(new Error('Team member IDs must be valid object IDs'), { status: 400 });
      }
      memberIds.push(memberId);
    }
  }

  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== new Set(memberIds).size) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
    }
  }

  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, pointTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: { toString(): string }; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map<string, number>();
  for (const { _id, totalPoints } of pointTotals) {
    pointsByTeam.set(_id.toString(), totalPoints);
  }

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const activityFocus = (type: string) => {
    const normalized = type.trim().toLowerCase();
    if (['run', 'running', 'cycle', 'cycling', 'walk', 'walking', 'swim', 'swimming'].includes(normalized)) {
      return 'endurance';
    }
    return normalized;
  };

  return workouts
    .map((workout) => {
      const focus = workout.focus.trim().toLowerCase();
      const matchesGoal = focus === goalFocus;
      const matchingActivity = activities.find((activity) => activityFocus(activity.type) === focus);
      const priority = matchesGoal ? 0 : matchingActivity ? 1 : 2;
      const reason = matchesGoal
        ? matchingActivity
          ? `Matches your ${user.fitnessGoal} goal and recent ${matchingActivity.type} activity.`
          : `Matches your ${user.fitnessGoal} fitness goal.`
        : matchingActivity
          ? `Recommended based on your recent ${matchingActivity.type} activity.`
          : 'Suggested to support your training variety.';

      return { workout, priority, reason };
    })
    .sort((a, b) => a.priority - b.priority)
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
