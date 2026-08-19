// stores mock official park alerts that will eventually come from the nps alerts endpoint
// alert records are kept separate from user reports because they represent official park information

const mockAlerts = {
    yellowstone: [
        {
            id: 'yellowstone-alert-001',
            parkId: 'yellowstone',
            category: 'Caution',
            title: 'Increased Wildlife Activity',
            description:
                'Visitors may encounter increased wildlife activity in several areas of the park. Maintain a safe distance from all wildlife.',
            updatedAt: '2026-08-19T08:00:00',
        },

        {
            id: 'yellowstone-alert-002',
            parkId: 'yellowstone',
            category: 'Closure',
            title: 'Temporary Trail Closure',
            description:
                'A section of trail is temporarily closed. Check current park conditions before beginning your hike.',
            updatedAt: '2026-08-18T15:30:00',
        },
    ],

    'great-smoky-mountains': [
        {
            id: 'smokies-alert-001',
            parkId: 'great-smoky-mountains',
            category: 'Information',
            title: 'Seasonal Road Information',
            description:
                'Some roads and facilities may operate on seasonal schedules.',
            updatedAt: '2026-08-19T09:00:00',
        },
    ],
}

export default mockAlerts