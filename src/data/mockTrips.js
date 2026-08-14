// provides temporary trip data until trips are persisted through supabase
const mockTrips = [
    {
        id: 'yellowstone-adventure',
        name: 'Yellowstone Adventure',
        parkId: 'yellowstone',
        startDate: '2027-06-12',
        endDate: '2027-06-18',
        status: 'upcoming',

        // stores the locations the user has added to the trip
        trails: [
            'fairy-falls',
        ],

        campsites: [
            {
                id: 'madison-campground',
                checkIn: '2027-06-12',
                checkOut: '2027-06-18',
            },
        ],

        activities: [
            'wildlife watching',
            'geyser viewing',
        ],

        notes:
            'Look for bison around Lamar Valley and visit Old Faithful early in the morning.',
    },

    {
        id: 'smoky-mountains',
        name: 'Smoky Mountains Weekend',
        parkId: 'great-smoky-mountains',
        startDate: '2026-05-03',
        endDate: '2026-05-07',
        status: 'past',

        // stores the locations that were part of the completed trip
        trails: [
            'laurel-falls',
        ],

        campsites: [
            {
                id: 'elkmont',
                checkIn: '',
                checkOut: ''
            }
        ],

        activities: [
            'waterfall hunting',
            'wildlife watching',
        ],

        notes:
            'A short spring trip through the mountains.',
    },
]

export default mockTrips