// tests the nps api request handling and data normalization

const npsApi = require('../api/npsApi')

describe('nps api', () => {
    let originalFetch
    let originalApiKey

    beforeAll(() => {
        originalFetch = global.fetch
        originalApiKey = process.env.EXPO_PUBLIC_NPS_API_KEY
    })

    beforeEach(() => {
        global.fetch = jest.fn()
        process.env.EXPO_PUBLIC_NPS_API_KEY = 'test-api-key'
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        global.fetch = originalFetch

        if (originalApiKey === undefined) {
            delete process.env.EXPO_PUBLIC_NPS_API_KEY
        } else {
            process.env.EXPO_PUBLIC_NPS_API_KEY = originalApiKey
        }
    })

    test('gets and normalizes national parks', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    total: '2',
                    data: [
                        {
                            id: 'nps-1',
                            parkCode: 'test',
                            fullName: 'Test National Park',
                            name: 'Test',
                            designation: 'National Park',
                            description: 'A test park',
                            states: 'CA, NV',
                            latLong: 'lat:36.123 long:-115.456',
                            activities: [
                                { name: 'Hiking' },
                                { name: 'Hiking' },
                                { name: 'Camping' },
                                { name: '' },
                            ],
                            topics: [{ name: 'History' }],
                        },
                        {
                            id: 'state-1',
                            parkCode: 'state',
                            fullName: 'Test State Park',
                            name: 'Test State',
                            designation: 'State Park',
                            states: 'OH',
                        },
                        {
                            id: 'monument-1',
                            parkCode: 'monument',
                            fullName: 'Test Monument',
                            name: 'Test Monument',
                            designation: 'National Monument',
                        },
                    ],
                }),
        })

        const result = await npsApi.getParks({
            stateCode: 'CA',
            q: 'test',
            limit: 10,
            start: 0,
        })

        expect(result.data).toHaveLength(2)

        expect(result.data[0]).toEqual(
            expect.objectContaining({
                id: 'test',
                npsId: 'nps-1',
                name: 'Test National Park',
                shortName: 'Test',
                designation: 'National Park',
                description: 'A test park',
                states: ['CA', 'NV'],
                coordinates: {
                    latitude: 36.123,
                    longitude: -115.456,
                },
                activities: ['Hiking', 'Camping'],
            }),
        )

        expect(global.fetch).toHaveBeenCalledTimes(1)

        const url = global.fetch.mock.calls[0][0]

        expect(url).toContain('/parks?')
        expect(url).toContain('stateCode=CA')
        expect(url).toContain('q=test')
        expect(url).toContain('limit=10')
        expect(url).toContain('start=0')
        expect(url).toContain('api_key=test-api-key')
    })

    test('rejects a request when the api key is missing', async () => {
        delete process.env.EXPO_PUBLIC_NPS_API_KEY

        await expect(
            npsApi.getParks(),
        ).rejects.toThrow('NPS API key is missing')
    })

    test('handles an nps http error', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 403,
            text: async () =>
                JSON.stringify({
                    error: {
                        message: 'Invalid API key',
                    },
                }),
        })

        await expect(
            npsApi.getParks(),
        ).rejects.toThrow(
            'NPS API request failed: 403 Invalid API key',
        )
    })

    test('handles invalid json from the nps api', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'not valid json',
        })

        await expect(
            npsApi.getParks(),
        ).rejects.toThrow(
            'NPS API returned invalid JSON (500)',
        )
    })

    test('converts a network failure into a clear error', async () => {
        global.fetch.mockRejectedValue(
            new TypeError('Network request failed'),
        )

        await expect(
            npsApi.getParks(),
        ).rejects.toThrow(
            'Unable to connect to the NPS API',
        )
    })

    test('normalizes trails with useful trail details', () => {
        const trail = npsApi.normalizeNpsTrail({
            id: 'trail-1',
            title: 'Test Trail',
            shortDescription: 'A beautiful hiking trail',
            longDescription:
                'This moderate trail is 4.5 miles long and has an elevation gain of 800 feet',
            latitude: '40.123',
            longitude: '-110.456',
            duration: '2 hours',
            images: [
                {
                    url: 'https://example.com/trail.jpg',
                },
            ],
            activities: [
                {
                    name: 'Hiking',
                },
            ],
            arePetsPermitted: 'true',
            arePetsPermittedWithRestrictions: false,
            isReservationRequired: 'true',
            doFeesApply: true,
            season: ['Spring', 'Summer'],
            timeOfDay: ['Day'],
            location: 'North trailhead',
            url: 'https://example.com/trail',
        })

        expect(trail).toEqual(
            expect.objectContaining({
                id: 'trail-1',
                name: 'Test Trail',
                description: 'A beautiful hiking trail',
                longDescription:
                    'This moderate trail is 4.5 miles long and has an elevation gain of 800 feet',
                image: 'https://example.com/trail.jpg',
                latitude: 40.123,
                longitude: -110.456,
                duration: '2 hours',
                difficulty: 'Moderate',
                distance: '4.5 miles',
                elevation: '800 feet',
                trailType: 'Hiking',
                type: 'Hiking',
                dogsAllowed: true,
                petsAllowed: true,
                petsRestricted: false,
                petInformationAvailable: true,
                reservationRequired: true,
                feeRequired: true,
                seasons: ['Spring', 'Summer'],
                timeOfDay: ['Day'],
                activities: ['Hiking'],
                location: 'North trailhead',
                url: 'https://example.com/trail',
            }),
        )
    })

    test('uses trail fallback values when optional data is missing', () => {
        const trail = npsApi.normalizeNpsTrail({
            id: 'trail-2',
            name: 'Unnamed Data Trail',
            shortDescription: '',
            longDescription: '',
            latitude: '',
            longitude: '',
            activities: [],
        })

        expect(trail).toEqual(
            expect.objectContaining({
                id: 'trail-2',
                name: 'Unnamed Data Trail',
                description: '',
                longDescription: '',
                image: null,
                latitude: null,
                longitude: null,
                duration: '',
                difficulty: '',
                distance: '',
                elevation: '',
                trailType: 'Trail',
                type: 'Trail',
                dogsAllowed: false,
                petsAllowed: false,
                petsRestricted: false,
                petInformationAvailable: false,
                reservationRequired: false,
                feeRequired: false,
                activities: [],
                location: '',
                url: '',
            }),
        )
    })

    test('gets trails for a park and filters to trail records', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: [
                        {
                            id: 'trail-1',
                            title: 'Hiking Trail',
                            shortDescription: 'A trail',
                            topics: [{ name: 'Trails' }],
                            activities: [{ name: 'Hiking' }],
                        },
                        {
                            id: 'other-1',
                            title: 'Visitor Activity',
                            topics: [{ name: 'Visitor Centers' }],
                        },
                    ],
                }),
        })

        const result = await npsApi.getTrailsByPark(
            'TEST_TRAIL_PARK',
        )

        expect(result).toHaveLength(1)

        expect(result[0]).toEqual(
            expect.objectContaining({
                id: 'trail-1',
                name: 'Hiking Trail',
                trailType: 'Hiking',
            }),
        )

        expect(global.fetch).toHaveBeenCalledTimes(1)

        const url = global.fetch.mock.calls[0][0]

        expect(url).toContain('/thingstodo?')
        expect(url).toContain('parkCode=TEST_TRAIL_PARK')
        expect(url).toContain('limit=50')
        expect(url).toContain('fields=images')
    })

    test('returns an empty trail list when the api has no trail data', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: null,
                }),
        })

        const result = await npsApi.getTrailsByPark(
            'EMPTY_TRAIL_PARK',
        )

        expect(result).toEqual([])
    })

    test('gets and normalizes campgrounds for a park', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: [
                        {
                            id: 'camp-1',
                            name: 'Test Campground',
                            parkCode: 'TEST',
                            description: 'A campground',
                            latitude: '38.123',
                            longitude: '-119.456',
                            campsites: {
                                totalSites: 100,
                                tentOnly: 20,
                                rvOnly: 30,
                                group: 5,
                            },
                            accessibility: {
                                rvAllowed: 'Yes',
                                wheelchairAccess: 'Yes',
                            },
                            images: [
                                {
                                    url: 'https://example.com/camp.jpg',
                                },
                            ],
                            reservationInfo:
                                'Reservations required',
                            reservationUrl:
                                'https://example.com/reserve',
                        },
                    ],
                }),
        })

        const result =
            await npsApi.getCampgroundsByPark('TEST')

        expect(result).toHaveLength(1)

        expect(result[0]).toEqual(
            expect.objectContaining({
                id: 'camp-1',
                name: 'Test Campground',
                parkCode: 'TEST',
                description: 'A campground',
                image: 'https://example.com/camp.jpg',
                latitude: 38.123,
                longitude: -119.456,
                totalSites: 100,
                tentOnly: 20,
                rvOnly: 30,
                groupSites: 5,
                rvAllowed: 'Yes',
                wheelchairAccess: 'Yes',
                reservationDescription:
                    'Reservations required',
                reservationsUrl:
                    'https://example.com/reserve',
            }),
        )
    })

    test('gets and sorts visitor centers by name', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: [
                        {
                            id: 'center-2',
                            name: 'Zion Visitor Center',
                            parkCode: 'ZION',
                            latitude: '37.2',
                            longitude: '-112.9',
                        },
                        {
                            id: 'center-1',
                            name: 'Arches Visitor Center',
                            parkCode: 'ARCH',
                            latitude: '38.6',
                            longitude: '-109.6',
                        },
                    ],
                }),
        })

        const result = await npsApi.getVisitorCenters()

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe(
            'Arches Visitor Center',
        )
        expect(result[1].name).toBe(
            'Zion Visitor Center',
        )

        expect(result[0]).toEqual(
            expect.objectContaining({
                id: 'center-1',
                parkId: 'ARCH',
                parkCode: 'ARCH',
                latitude: 38.6,
                longitude: -109.6,
            }),
        )
    })

    test('gets visitor centers for a park and returns an empty list when needed', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: null,
                }),
        })

        const result =
            await npsApi.getVisitorCentersByPark(
                'EMPTY_CENTER_PARK',
            )

        expect(result).toEqual([])
    })

    test('gets things to do and flattens the api data', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    data: [
                        [
                            {
                                id: 'thing-1',
                                title: 'Thing One',
                            },
                        ],
                        [
                            {
                                id: 'thing-2',
                                title: 'Thing Two',
                            },
                        ],
                    ],
                }),
        })

        const result =
            await npsApi.getThingsToDoByPark('TEST_THINGS')

        expect(result).toEqual([
            {
                id: 'thing-1',
                title: 'Thing One',
            },
            {
                id: 'thing-2',
                title: 'Thing Two',
            },
        ])

        const url = global.fetch.mock.calls[0][0]

        expect(url).toContain('/thingstodo?')
        expect(url).toContain('parkCode=TEST_THINGS')
        expect(url).toContain('limit=50')
        expect(url).toContain('fields=images')
    })
})