// provides realistic placeholder park data while the application ui is developed before connecting the nps api

const mockParks = [
    {
        id: 'great-smoky-mountains',
        name: 'Great Smoky Mountains',
        designation: 'National Park',
        states: ['Tennessee', 'North Carolina'],
        coordinates: {
            latitude: 35.6118,
            longitude: -83.4895,
        },
        description:
            'Explore mist-covered mountains, ancient forests, waterfalls, wildlife, and historic communities in the most visited national park in the United States.',
        longDescription:
            'Great Smoky Mountains National Park protects more than 500,000 acres of forests, mountains, streams, and historic communities along the Tennessee and North Carolina border. The park is known for its incredible biodiversity, misty mountain scenery, waterfalls, and historic Appalachian structures.',
        trailCount: 87,
        campgroundCount: 10,
        activities: [
            'Hiking',
            'Wildlife Watching',
            'Fishing',
            'Camping',
            'Scenic Driving',
        ],
        difficulty: 'All levels',
        dogsAllowed: false,
        favorite: false,
        trails: [
            {
                id: 'laurel-falls',
                name: 'Laurel Falls Trail',
                distance: '2.6 mi',
                difficulty: 'Moderate',
                elevation: '396 ft',
                description:
                    'A popular paved trail leading through the forest to a beautiful 80-foot waterfall.',
            },
            {
                id: 'chimney-tops',
                name: 'Chimney Tops Trail',
                distance: '3.8 mi',
                difficulty: 'Strenuous',
                elevation: '1,400 ft',
                description:
                    'A steep climb through the forest ending with dramatic views from the rocky Chimney Tops summit.',
            },
            {
                id: 'clingmans-dome',
                name: 'Clingmans Dome Trail',
                distance: '1.0 mi',
                difficulty: 'Moderate',
                elevation: '337 ft',
                description:
                    'A steep paved trail leading to the highest point in Great Smoky Mountains National Park.',
            },
        ],
        campgrounds: [
            {
                id: 'elkmont',
                name: 'Elkmont Campground',
                season: 'Open seasonally',
                sites: '200 sites',
                dogsAllowed: true,
                description:
                    'A wooded campground near the Little River with access to several popular trails.',
            },
            {
                id: 'cades-cove',
                name: 'Cades Cove Campground',
                season: 'Open year-round',
                sites: '159 sites',
                dogsAllowed: true,
                description:
                    'A scenic campground surrounded by mountains and historic Appalachian structures.',
            },
        ],
        wildlife: [
            {
                species: 'Black Bear',
                location: 'Cades Cove',
                time: '2 hours ago',
            },
            {
                species: 'Elk',
                location: 'Cataloochee Valley',
                time: 'Yesterday',
            },
        ],
    },

    {
        id: 'yellowstone',
        name: 'Yellowstone',
        designation: 'National Park',
        states: ['Wyoming', 'Montana', 'Idaho'],
        coordinates: {
            latitude: 44.4280,
            longitude: -110.5885,
        },
        description:
            'Discover geysers, hot springs, alpine lakes, deep canyons, and some of North America’s most remarkable wildlife.',
        longDescription:
            'Yellowstone National Park is home to an extraordinary collection of geothermal features, dramatic landscapes, and abundant wildlife. The park includes vast forests, alpine lakes, waterfalls, and the famous Yellowstone Caldera.',
        trailCount: 158,
        campgroundCount: 12,
        activities: [
            'Hiking',
            'Wildlife Watching',
            'Camping',
            'Fishing',
            'Boating',
        ],
        difficulty: 'All levels',
        dogsAllowed: false,
        favorite: false,
        trails: [
            {
                id: 'fairy-falls',
                name: 'Fairy Falls Trail',
                distance: '5.4 mi',
                difficulty: 'Moderate',
                elevation: '220 ft',
                description:
                    'A scenic trail through lodgepole pine forest leading to a tall waterfall.',
            },
            {
                id: 'uncle-toms',
                name: "Uncle Tom's Trail",
                distance: '0.7 mi',
                difficulty: 'Strenuous',
                elevation: '350 ft',
                description:
                    'A steep stairway descending toward the dramatic Lower Falls of the Yellowstone River.',
            },
        ],
        campgrounds: [
            {
                id: 'madison',
                name: 'Madison Campground',
                season: 'Open seasonally',
                sites: '278 sites',
                dogsAllowed: true,
                description:
                    'A popular campground near the Madison River and several major park attractions.',
            },
        ],
        wildlife: [
            {
                species: 'Bison',
                location: 'Lamar Valley',
                time: '1 hour ago',
            },
            {
                species: 'Grizzly Bear',
                location: 'Hayden Valley',
                time: 'Yesterday',
            },
        ],
    },

    {
        id: 'olympic',
        name: 'Olympic',
        designation: 'National Park',
        states: ['Washington'],
        coordinates: {
            latitude: 47.8021,
            longitude: -123.6044,
        },
        description:
            'From rugged Pacific coastline to temperate rainforest and glacier-covered mountains, Olympic contains several distinct ecosystems.',
        longDescription:
            'Olympic National Park protects nearly one million acres of mountains, forests, rivers, lakes, and coastline. Its remarkable variety of ecosystems makes it one of the most diverse national parks in the country.',
        trailCount: 95,
        campgroundCount: 15,
        activities: [
            'Hiking',
            'Camping',
            'Wildlife Watching',
            'Beachcombing',
            'Fishing',
        ],
        difficulty: 'All levels',
        dogsAllowed: false,
        favorite: false,
        trails: [
            {
                id: 'hall-of-mosses',
                name: 'Hall of Mosses',
                distance: '1.1 mi',
                difficulty: 'Easy',
                elevation: '100 ft',
                description:
                    'A short loop through the lush Hoh Rain Forest surrounded by moss-covered trees.',
            },
        ],
        campgrounds: [
            {
                id: 'kalaloch',
                name: 'Kalaloch Campground',
                season: 'Open year-round',
                sites: '175 sites',
                dogsAllowed: true,
                description:
                    'A coastal campground overlooking the Pacific Ocean.',
            },
        ],
        wildlife: [
            {
                species: 'Roosevelt Elk',
                location: 'Hoh Rain Forest',
                time: 'Today',
            },
        ],
    },

    {
        id: 'acadia',
        name: 'Acadia',
        designation: 'National Park',
        states: ['Maine'],
        coordinates: {
            latitude: 44.3386,
            longitude: -68.2733,
        },
        description:
            'Explore rocky coastlines, forested mountains, island landscapes, and spectacular sunrise views along the Atlantic.',
        longDescription:
            'Acadia National Park protects a spectacular section of Maine coastline, including rocky shores, granite peaks, forests, lakes, and islands.',
        trailCount: 72,
        campgroundCount: 4,
        activities: [
            'Hiking',
            'Scenic Driving',
            'Biking',
            'Camping',
            'Wildlife Watching',
        ],
        difficulty: 'All levels',
        dogsAllowed: true,
        favorite: false,
        trails: [
            {
                id: 'beehive',
                name: 'Beehive Trail',
                distance: '1.5 mi',
                difficulty: 'Strenuous',
                elevation: '450 ft',
                description:
                    'A steep and adventurous trail using iron rungs to climb the granite face of the Beehive.',
            },
        ],
        campgrounds: [
            {
                id: 'blackwoods',
                name: 'Blackwoods Campground',
                season: 'Open seasonally',
                sites: '281 sites',
                dogsAllowed: true,
                description:
                    'A forested campground within walking distance of the Atlantic coastline.',
            },
        ],
        wildlife: [
            {
                species: 'White-tailed Deer',
                location: 'Jordan Pond',
                time: 'Yesterday',
            },
        ],
    },

    {
        id: 'zion',
        name: 'Zion',
        designation: 'National Park',
        states: ['Utah'],
        coordinates: {
            latitude: 37.2982,
            longitude: -113.0263,
        },
        description:
            'Walk beneath towering sandstone cliffs and explore dramatic canyons, narrow river corridors, and desert landscapes.',
        longDescription:
            'Zion National Park protects dramatic sandstone cliffs, deep canyons, desert landscapes, and the Virgin River. The park is especially famous for Zion Canyon and its challenging hiking routes.',
        trailCount: 64,
        campgroundCount: 3,
        activities: [
            'Hiking',
            'Canyoneering',
            'Camping',
            'Wildlife Watching',
            'Scenic Driving',
        ],
        difficulty: 'All levels',
        dogsAllowed: false,
        favorite: false,
        trails: [
            {
                id: 'emerald-pools',
                name: 'Emerald Pools Trail',
                distance: '3.0 mi',
                difficulty: 'Moderate',
                elevation: '620 ft',
                description:
                    'A popular trail leading past waterfalls and natural pools beneath Zion Canyon walls.',
            },
        ],
        campgrounds: [
            {
                id: 'watchman',
                name: 'Watchman Campground',
                season: 'Open year-round',
                sites: '176 sites',
                dogsAllowed: true,
                description:
                    'A campground near the Zion Canyon Visitor Center with dramatic views of the surrounding cliffs.',
            },
        ],
        wildlife: [
            {
                species: 'Desert Bighorn Sheep',
                location: 'Zion Canyon',
                time: 'Today',
            },
        ],
    },

    {
        id: 'arches',
        name: 'Arches',
        designation: 'National Park',
        states: ['Utah'],
        coordinates: {
            latitude: 38.7331,
            longitude: -109.5925,
        },
        description:
            'Wander through a surreal landscape of more than 2,000 natural sandstone arches surrounded by red-rock desert.',
        longDescription:
            'Arches National Park contains thousands of natural sandstone arches, towering fins, balanced rocks, and other remarkable desert formations.',
        trailCount: 51,
        campgroundCount: 1,
        activities: [
            'Hiking',
            'Stargazing',
            'Scenic Driving',
            'Photography',
        ],
        difficulty: 'Easy to Hard',
        dogsAllowed: false,
        favorite: false,
        trails: [
            {
                id: 'delicate-arch',
                name: 'Delicate Arch Trail',
                distance: '3.2 mi',
                difficulty: 'Moderate',
                elevation: '629 ft',
                description:
                    'A famous desert hike leading to one of the most recognizable arches in the world.',
            },
        ],
        campgrounds: [
            {
                id: 'devils-garden',
                name: "Devils Garden Campground",
                season: 'Open year-round',
                sites: '51 sites',
                dogsAllowed: false,
                description:
                    'The only campground inside Arches National Park, surrounded by dramatic sandstone formations.',
            },
        ],
        wildlife: [
            {
                species: 'Desert Cottontail',
                location: 'Devils Garden',
                time: 'Today',
            },
        ],
    },
]

export default mockParks