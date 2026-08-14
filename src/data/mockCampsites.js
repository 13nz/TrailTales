// provides temporary campground data until campground information is loaded from the nps api
const mockCampsites = [
    {
        id: 'madison-campground',
        name: 'Madison Campground',
        parkId: 'yellowstone',
        price: '$25 / night',
        sites: 278,
        reservations: 'reservations recommended',
        petsAllowed: true,
        amenities: [
            'restrooms',
            'potable water',
            'dump station',
        ],
        description:
            'A popular campground near the Madison River with convenient access to many of Yellowstone’s major attractions.',
    },

    {
        id: 'grant-village',
        name: 'Grant Village Campground',
        parkId: 'yellowstone',
        price: '$39 / night',
        sites: 430,
        reservations: 'reservations required',
        petsAllowed: true,
        amenities: [
            'restrooms',
            'potable water',
            'showers',
        ],
        description:
            'A large campground on the western shore of Yellowstone Lake, close to Grant Village services.',
    },

    {
        id: 'elkmont',
        name: 'Elkmont Campground',
        parkId: 'great-smoky-mountains',
        price: '$30 / night',
        sites: 220,
        reservations: 'reservations required',
        petsAllowed: true,
        amenities: [
            'restrooms',
            'fire rings',
            'picnic tables',
        ],
        description:
            'A historic campground surrounded by forest and located near several popular hiking destinations.',
    },

    {
        id: 'cades-cove',
        name: 'Cades Cove Campground',
        parkId: 'great-smoky-mountains',
        price: '$30 / night',
        sites: 159,
        reservations: 'reservations required',
        petsAllowed: true,
        amenities: [
            'restrooms',
            'fire rings',
            'picnic tables',
        ],
        description:
            'A scenic campground in the Cades Cove valley surrounded by mountains and abundant wildlife.',
    },
]

export default mockCampsites