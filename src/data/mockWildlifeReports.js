// stores mock wildlife sightings submitted by trailtales users
// these records are kept separate from official wildlife information for future supabase storage

const mockWildlifeReports = [
    {
        id: 'report-001',
        parkId: 'yellowstone',
        trailId: 'mystic-falls',
        campgroundId: null,
        species: 'Black Bear',
        location: 'Near the trailhead',
        reportedAt: '2026-08-18T18:30:00',
        description:
            'A black bear was spotted moving through the trees near the trailhead.',
        source: 'user',
    },

    {
        id: 'report-002',
        parkId: 'yellowstone',
        trailId: null,
        campgroundId: 'madison',
        species: 'Bison',
        location: 'Near the campground entrance',
        reportedAt: '2026-08-18T09:15:00',
        description:
            'A bison was seen near the campground entrance early in the morning.',
        source: 'user',
    },

    {
        id: 'report-003',
        parkId: 'yellowstone',
        trailId: 'grand-prismatic',
        campgroundId: null,
        species: 'Elk',
        location: 'Along the trail',
        reportedAt: '2026-08-17T07:45:00',
        description:
            'Several elk were visible in the meadow beside the trail.',
        source: 'user',
    },
]

export default mockWildlifeReports