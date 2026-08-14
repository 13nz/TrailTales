// provides temporary trail data until trail information is loaded from the nps api
const mockTrails = [
    {
        id: 'fairy-falls',
        name: 'Fairy Falls Trail',
        parkId: 'yellowstone',
        distance: '5.4 mi',
        difficulty: 'Moderate',
        elevation: '170 ft',
        duration: '2–3 hours',
        description:
            'A scenic trail leading through lodgepole pine forest to the impressive Fairy Falls waterfall.',
        dogsAllowed: false,
    },

    {
        id: 'mystic-falls',
        name: 'Mystic Falls Trail',
        parkId: 'yellowstone',
        distance: '3.2 mi',
        difficulty: 'Moderate',
        elevation: '500 ft',
        duration: '2 hours',
        description:
            'A forested trail following the Little Firehole River toward Mystic Falls.',
        dogsAllowed: false,
    },

    {
        id: 'laurel-falls',
        name: 'Laurel Falls Trail',
        parkId: 'great-smoky-mountains',
        distance: '2.6 mi',
        difficulty: 'Easy',
        elevation: '396 ft',
        duration: '1–2 hours',
        description:
            'A popular paved trail leading through the forest to a beautiful cascading waterfall.',
        dogsAllowed: true,
    },

    {
        id: 'alum-cave',
        name: 'Alum Cave Trail',
        parkId: 'great-smoky-mountains',
        distance: '4.4 mi',
        difficulty: 'Moderate',
        elevation: '1,125 ft',
        duration: '3–4 hours',
        description:
            'A dramatic mountain trail passing beneath towering cliffs and through dense forest.',
        dogsAllowed: false,
    },
]

export default mockTrails