// tests the npspecies wildlife api service

const {
    getAnimalSpecies,
} = require('../api/npsSpeciesApi')

describe('npspecies api', () => {
    let originalFetch

    beforeAll(() => {
        originalFetch = global.fetch
    })

    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        global.fetch = originalFetch
    })

    test('returns an empty array when no park code is provided', async () => {
        await expect(
            getAnimalSpecies(),
        ).resolves.toEqual([])

        expect(global.fetch).not.toHaveBeenCalled()
    })

    test('returns an empty array for an empty park code', async () => {
        await expect(
            getAnimalSpecies(''),
        ).resolves.toEqual([])

        expect(global.fetch).not.toHaveBeenCalled()
    })

    test('fetches species using the correct park and categories', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [],
        })

        await getAnimalSpecies('yell')

        expect(global.fetch).toHaveBeenCalledTimes(1)

        const url = global.fetch.mock.calls[0][0]

        expect(url).toContain(
            '/checklist/YELL/',
        )
        expect(url).toContain(
            'Mammals%2CBirds%2CReptiles%2CAmphibians%2CFish',
        )
        expect(url).toContain('?format=json')
    })

    test('normalizes park code before making the request', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [],
        })

        await getAnimalSpecies('  yElL  ')

        const url = global.fetch.mock.calls[0][0]

        expect(url).toContain('/checklist/YELL/')
    })

    test('returns only species marked as present', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    TaxaCode: 'A1',
                    CommonName: 'gray wolf',
                    ScientificName: 'Canis lupus',
                    Occurrence: 'Present',
                },
                {
                    TaxaCode: 'A2',
                    CommonName: 'black bear',
                    ScientificName: 'Ursus americanus',
                    Occurrence: 'Not Present',
                },
                {
                    TaxaCode: 'A3',
                    CommonName: 'elk',
                    ScientificName: 'Cervus canadensis',
                    Occurrence: 'present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toHaveLength(2)

        expect(result[0]).toEqual({
            id: 'A1',
            name: 'Gray Wolf',
            scientificName: 'Canis lupus',
            description: '',
        })

        expect(result[1]).toEqual({
            id: 'A3',
            name: 'Elk',
            scientificName: 'Cervus canadensis',
            description: '',
        })
    })

    test('supports the SpeciesListItem response format', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                SpeciesListItem: [
                    {
                        TaxaCode: 'B1',
                        CommonNames: 'american bison',
                        ScientificName: 'Bison bison',
                        OccurrenceStatus: 'Present',
                    },
                ],
            }),
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toEqual([
            {
                id: 'B1',
                name: 'American Bison',
                scientificName: 'Bison bison',
                description: '',
            },
        ])
    })

    test('formats common names and removes text after a comma', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    TaxaCode: 'C1',
                    CommonName: 'red fox, eastern population',
                    ScientificName: 'Vulpes vulpes',
                    Occurrence: 'Present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result[0].name).toBe('Red Fox')
    })

    test('uses fallback fields when standard species fields are missing', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    TaxonCode: 'D1',
                    commonNames: 'mountain goat',
                    scientificName: 'Oreamnos americanus',
                    occurrence: 'PRESENT',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toEqual([
            {
                id: 'D1',
                name: 'Mountain Goat',
                scientificName: 'Oreamnos americanus',
                description: '',
            },
        ])
    })

    test('uses the species id as a fallback when taxon codes are missing', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    Id: 'species-123',
                    CommonName: 'bald eagle',
                    ScientificName: 'Haliaeetus leucocephalus',
                    Occurrence: 'Present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result[0].id).toBe('species-123')
    })

    test('creates a fallback species id when no id field is available', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    CommonName: 'moose',
                    ScientificName: 'Alces alces',
                    Occurrence: 'Present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result[0].id).toBe('TEST-0')
    })

    test('removes duplicate common species names', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    TaxaCode: 'E1',
                    CommonName: 'American Robin',
                    ScientificName: 'Turdus migratorius',
                    Occurrence: 'Present',
                },
                {
                    TaxaCode: 'E2',
                    CommonName: 'american robin',
                    ScientificName: 'Turdus migratorius',
                    Occurrence: 'Present',
                },
                {
                    TaxaCode: 'E3',
                    CommonName: 'Raven',
                    ScientificName: 'Corvus corax',
                    Occurrence: 'Present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('American Robin')
        expect(result[1].name).toBe('Raven')
    })

    test('removes species that have no usable common name', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
                {
                    TaxaCode: 'F1',
                    CommonName: '',
                    ScientificName: 'Species one',
                    Occurrence: 'Present',
                },
                {
                    TaxaCode: 'F2',
                    CommonName: 'fox',
                    ScientificName: 'Vulpes vulpes',
                    Occurrence: 'Present',
                },
            ],
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Fox')
    })

    test('returns an empty array for an unexpected response format', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                unexpected: 'response',
            }),
        })

        const result = await getAnimalSpecies('TEST')

        expect(result).toEqual([])
    })

    test('throws a useful error when the api request fails', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({}),
        })

        await expect(
            getAnimalSpecies('TEST'),
        ).rejects.toThrow(
            'NPSpecies request failed with status 500',
        )
    })

    test('propagates network errors', async () => {
        global.fetch.mockRejectedValue(
            new Error('Network request failed'),
        )

        await expect(
            getAnimalSpecies('TEST'),
        ).rejects.toThrow(
            'Network request failed',
        )
    })
})