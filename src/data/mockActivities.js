// mock activities use the same general structure as the nps things to do endpoint
// this allows the mock data to be replaced by api data later without redesigning the screen

const mockActivities = [
    {
        id: 'yellowstone-wildlife-watching',
        parkCode: 'yell',
        parkName: 'Yellowstone National Park',
        title: 'Wildlife Watching',
        shortDescription:
            'Look for bison, elk, bears, wolves, and other wildlife throughout Yellowstone.',
        longDescription:
            'Explore Yellowstone with wildlife watching in mind. Early mornings and evenings can be especially rewarding, but visitors should always maintain a safe distance from wildlife and follow park regulations.',
        url: 'https://www.nps.gov/yell/planyourvisit/wildlife.htm',
        duration: '2-4 hours',
        location: 'Yellowstone National Park',
        season: 'Year-round',
    },

    {
        id: 'yellowstone-grand-prismatic',
        parkCode: 'yell',
        parkName: 'Yellowstone National Park',
        title: 'Visit Grand Prismatic Spring',
        shortDescription:
            'See one of Yellowstone’s most colorful geothermal features from the boardwalk and overlook.',
        longDescription:
            'Walk along the boardwalk through the Midway Geyser Basin and experience the vivid colors and geothermal activity surrounding Grand Prismatic Spring.',
        url: 'https://www.nps.gov/yell/planyourvisit/grandprismatic.htm',
        duration: '1-2 hours',
        location: 'Midway Geyser Basin',
        season: 'Year-round',
    },

    {
        id: 'yellowstone-stargazing',
        parkCode: 'yell',
        parkName: 'Yellowstone National Park',
        title: 'Stargazing',
        shortDescription:
            'Experience dark night skies away from the lights of cities and towns.',
        longDescription:
            'Find a safe location away from artificial light and experience Yellowstone after dark. Clear nights can reveal thousands of stars across the park’s expansive skies.',
        url: 'https://www.nps.gov/yell/planyourvisit/index.htm',
        duration: '1-3 hours',
        location: 'Throughout Yellowstone',
        season: 'Year-round',
    },

    {
        id: 'yellowstone-scenic-drive',
        parkCode: 'yell',
        parkName: 'Yellowstone National Park',
        title: 'Explore the Grand Loop',
        shortDescription:
            'Travel through Yellowstone’s diverse landscapes and geothermal areas along the park road system.',
        longDescription:
            'Explore Yellowstone by road and stop at viewpoints, geothermal areas, wildlife habitat, and other notable locations throughout the park.',
        url: 'https://www.nps.gov/yell/planyourvisit/roadtravel.htm',
        duration: 'Half day or longer',
        location: 'Yellowstone National Park',
        season: 'Seasonal',
    },

    {
        id: 'smokies-waterfall-walk',
        parkCode: 'grsm',
        parkName:
            'Great Smoky Mountains National Park',
        title: 'Waterfall Hiking',
        shortDescription:
            'Explore forest trails leading to waterfalls throughout the Smokies.',
        longDescription:
            'Hike through the forests of the Great Smoky Mountains to discover waterfalls, streams, and changing mountain scenery.',
        url: 'https://www.nps.gov/grsm/planyourvisit/hiking.htm',
        duration: '2-5 hours',
        location:
            'Great Smoky Mountains National Park',
        season: 'Year-round',
    },

    {
        id: 'smokies-wildlife',
        parkCode: 'grsm',
        parkName:
            'Great Smoky Mountains National Park',
        title: 'Wildlife Watching',
        shortDescription:
            'Look for black bears, deer, elk, birds, and other wildlife in the mountains.',
        longDescription:
            'Wildlife can be encountered throughout the Great Smoky Mountains. Explore responsibly and keep a safe distance from animals.',
        url: 'https://www.nps.gov/grsm/planyourvisit/wildlife.htm',
        duration: '1-3 hours',
        location:
            'Great Smoky Mountains National Park',
        season: 'Year-round',
    },

    {
        id: 'smokies-scenic-drive',
        parkCode: 'grsm',
        parkName:
            'Great Smoky Mountains National Park',
        title: 'Scenic Mountain Drive',
        shortDescription:
            'Travel through mountain valleys and ridges while exploring the park by road.',
        longDescription:
            'Take a scenic drive through the Great Smoky Mountains and stop at overlooks, historic areas, and trailheads along the way.',
        url: 'https://www.nps.gov/grsm/planyourvisit/roads.htm',
        duration: '2-4 hours',
        location:
            'Great Smoky Mountains National Park',
        season: 'Year-round',
    },
]

export default mockActivities