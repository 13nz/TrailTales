// stores mock parks and lore entries for the initial lore experience
export const loreParks = [
    {
        id: 'yellowstone',
        name: 'Yellowstone',
        subtitle: 'National Park',
        region: 'Wyoming, Montana, and Idaho',
    },
    {
        id: 'yosemite',
        name: 'Yosemite',
        subtitle: 'National Park',
        region: 'California',
    },
    {
        id: 'great-smoky-mountains',
        name: 'Great Smoky Mountains',
        subtitle: 'National Park',
        region: 'Tennessee and North Carolina',
    },
]

// stores mock lore entries separately from the screens so real content can be added later
export const loreEntries = [
    {
        id: 'yellowstone-lake-monster',
        parkId: 'yellowstone',
        title: 'The Yellowstone Lake Monster',
        category: 'cryptid',

        summary:
            'A legendary creature associated with the waters of Yellowstone Lake.',

        description:
            'Stories describe a large, mysterious creature appearing beneath or near the surface of Yellowstone Lake. Accounts vary widely, with some describing a serpent-like shape and others imagining something more animal-like. The legend has become part of the broader collection of mysteries associated with the park.',

        location:
            'Yellowstone Lake',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Thing Beneath the Water',

            content:
                'The lake had been strangely quiet that evening. No wind crossed the water, and even the trees along the shore seemed to have stopped moving.\n\nThen something broke the surface far out in the darkness.\n\nAt first it looked like a log. Then it moved against the current.\n\nNobody around the fire said a word. They simply watched as the shape disappeared beneath the black water.',
        },
    },

    {
        id: 'yellowstone-ghost-rider',
        parkId: 'yellowstone',
        title: 'The Ghost Rider of the Valley',
        category: 'legend',

        summary:
            'A mysterious rider said to appear on lonely roads after sunset.',

        description:
            'This local legend tells of a rider who can supposedly be seen traveling through the valley after dark. Stories differ about who the rider was or why they continue to appear, but the figure is generally described as distant and silent.',

        location:
            'Yellowstone Valley',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Rider in the Distance',

            content:
                'The last light had disappeared behind the mountains when the ranger noticed the horse.\n\nIt stood far down the road, perfectly still.\n\nA rider sat in the saddle.\n\nHe watched for several seconds before looking down at his map. When he looked up again, the road was empty.',
        },
    },

    {
        id: 'yellowstone-whispering-pines',
        parkId: 'yellowstone',
        title: 'The Whispering Pines',
        category: 'folklore',

        summary:
            'A tale about trees that seem to whisper when the forest becomes completely still.',

        description:
            'The story describes a grove where visitors are said to hear quiet voices among the trees even when there is little or no wind. The tale is often interpreted as a poetic explanation for the unusual sounds produced by the forest and surrounding landscape.',

        location:
            'Yellowstone forest',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'When the Forest Whispers',

            content:
                'The wind stopped first.\n\nThen the birds went quiet.\n\nFor a moment, the entire forest seemed frozen.\n\nThat was when the whispering began.\n\nIt came from somewhere between the trees, too soft to understand and too close to ignore.',
        },
    },

    {
        id: 'yellowstone-lost-camp',
        parkId: 'yellowstone',
        title: 'The Lost Camp',
        category: 'legend',

        summary:
            'A mysterious campsite said to appear far from any marked trail.',

        description:
            'The legend describes travelers discovering an abandoned-looking campsite in an unexpected location. Stories claim that the fire appears recently tended despite there being no obvious sign of who might have built it.',

        location:
            'Yellowstone backcountry',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Fire That Was Already Burning',

            content:
                'They had been hiking for hours when they saw the smoke.\n\nThere was no campsite marked on their map.\n\nStill, someone had built a fire.\n\nThe flames were burning brightly, and beside them sat a single empty chair.\n\nThey never discovered who had left it there.',
        },
    },

    {
        id: 'yellowstone-night-caller',
        parkId: 'yellowstone',
        title: 'The Night Caller',
        category: 'folklore',

        summary:
            'A strange call said to echo through the forest after dark.',

        description:
            'The Night Caller is a fictional placeholder example of forest folklore. The story centers around an unexplained sound that seems to move through the trees and becomes difficult to locate when listeners attempt to follow it.',

        location:
            'Yellowstone forest',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'Follow the Sound',

            content:
                'The call came from somewhere beyond the trees.\n\nThey waited.\n\nIt came again, this time from behind them.\n\nThen from the ridge.\n\nThen directly beside the fire.\n\nNobody went looking for it after that.',
        },
    },

    {
        id: 'yosemite-moonlight-watcher',
        parkId: 'yosemite',
        title: 'The Moonlight Watcher',
        category: 'legend',

        summary:
            'A silent figure said to watch over Yosemite Valley from the cliffs.',

        description:
            'This fictional placeholder legend describes a mysterious figure appearing high above Yosemite Valley on particularly bright nights. The figure is said to disappear whenever someone attempts to approach its location.',

        location:
            'Yosemite Valley',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'Someone on the Cliff',

            content:
                'The moon was bright enough to turn the granite silver.\n\nThat was when she noticed the figure standing on the cliff.\n\nIt did not move.\n\nShe looked down for only a moment.\n\nWhen she looked back, there was nothing there.',
        },
    },

    {
        id: 'yosemite-granite-giant',
        parkId: 'yosemite',
        title: 'The Granite Giant',
        category: 'cryptid',

        summary:
            'A towering creature supposedly seen moving between Yosemite’s cliffs.',

        description:
            'This fictional placeholder cryptid is described as a massive figure that seems to blend into the granite landscape. Sightings are generally brief, with witnesses claiming they first noticed movement in an otherwise motionless cliff face.',

        location:
            'Yosemite cliffs',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Mountain Moved',

            content:
                'At first, he thought the shadow was caused by a cloud.\n\nThen the shadow stood up.\n\nThe enormous shape crossed the face of the cliff and disappeared behind the granite.\n\nHe never saw where it went.',
        },
    },

    {
        id: 'yosemite-whistling-waterfall',
        parkId: 'yosemite',
        title: 'The Whistling Falls',
        category: 'folklore',

        summary:
            'A waterfall said to produce a strange melody after sunset.',

        description:
            'The tale describes a waterfall whose rushing water can sound like a distant whistle under certain conditions. The story has been passed down as an atmospheric piece of local folklore.',

        location:
            'Yosemite waterfall country',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Whistle After Dark',

            content:
                'They heard the whistle just after sunset.\n\nThree notes.\n\nThen silence.\n\nA few minutes later, it came again from somewhere near the waterfall.\n\nNobody could agree whether it sounded like music or a warning.',
        },
    },

    {
        id: 'yosemite-hidden-trail',
        parkId: 'yosemite',
        title: 'The Hidden Trail',
        category: 'legend',

        summary:
            'A trail supposedly visible only for a brief moment in the early morning.',

        description:
            'This fictional placeholder legend describes a path that appears under unusual lighting conditions and seems to vanish before anyone can follow it very far.',

        location:
            'Yosemite Valley',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Trail That Wasnt There',

            content:
                'The trail appeared with the sunrise.\n\nIt led between two enormous rocks that she had passed the day before.\n\nShe followed it for perhaps a hundred steps.\n\nThen the sun rose higher.\n\nThe trail disappeared.',
        },
    },

    {
        id: 'yosemite-river-spirit',
        parkId: 'yosemite',
        title: 'The River Spirit',
        category: 'folklore',

        summary:
            'A mysterious presence said to appear in the river beside travelers at dusk.',

        description:
            'This fictional placeholder folklore story describes an unusual reflection that appears beside a traveler’s own reflection when walking along the river at dusk.',

        location:
            'Yosemite river',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Second Reflection',

            content:
                'She stopped beside the river and looked down.\n\nThere were two reflections.\n\nOne was hers.\n\nThe other stood beside her.\n\nShe turned around.\n\nThere was nobody there.',
        },
    },

    {
        id: 'smokies-night-hiker',
        parkId: 'great-smoky-mountains',
        title: 'The Night Hiker',
        category: 'legend',

        summary:
            'A mysterious traveler said to walk the mountain trails long after dark.',

        description:
            'This fictional placeholder legend describes a lone hiker whose lantern can sometimes be seen moving through the forest at night without following a recognizable trail.',

        location:
            'Great Smoky Mountains',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Lantern in the Trees',

            content:
                'The light appeared between the trees just after midnight.\n\nIt moved slowly uphill.\n\nHe watched it for several minutes before realizing something strange.\n\nThe light was moving toward him.\n\nBut there was no trail there.',
        },
    },

    {
        id: 'smokies-shadow-cat',
        parkId: 'great-smoky-mountains',
        title: 'The Shadow Cat',
        category: 'cryptid',

        summary:
            'A large, silent animal said to move through the forests without leaving tracks.',

        description:
            'This fictional placeholder cryptid is described as a large cat-like creature that appears briefly before disappearing into the forest. The unusual part of the legend is the claim that it leaves no tracks behind.',

        location:
            'Great Smoky Mountains',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'No Tracks',

            content:
                'The animal crossed the trail without making a sound.\n\nIt was enormous.\n\nHe waited for it to disappear before stepping forward.\n\nThere should have been tracks in the mud.\n\nThere were none.',
        },
    },

    {
        id: 'smokies-blue-ridge-lights',
        parkId: 'great-smoky-mountains',
        title: 'The Blue Ridge Lights',
        category: 'folklore',

        summary:
            'Strange lights said to appear between the mountain ridges after sunset.',

        description:
            'This fictional placeholder folklore story describes distant lights appearing between the ridges at night. Different explanations are offered for what causes them, giving the tale an intentionally mysterious quality.',

        location:
            'Blue Ridge Mountains',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'Lights Between the Ridges',

            content:
                'One light appeared first.\n\nThen another.\n\nThen a third, high on the opposite ridge.\n\nThey moved slowly through the darkness until every light disappeared at exactly the same moment.',
        },
    },

    {
        id: 'smokies-forgotten-cabin',
        parkId: 'great-smoky-mountains',
        title: 'The Forgotten Cabin',
        category: 'legend',

        summary:
            'An abandoned cabin said to contain signs that someone still lives there.',

        description:
            'This fictional placeholder legend describes a remote cabin that appears abandoned from the outside but seems strangely maintained whenever travelers discover it.',

        location:
            'Great Smoky Mountains backcountry',

        source: null,
        sourceUrl: null,

        campfireEligible: true,

        campfireStory: {
            title:
                'The Fire in the Cabin',

            content:
                'The cabin looked abandoned.\n\nThe windows were dark and the door hung crookedly from one hinge.\n\nThen they noticed the smoke.\n\nSomeone was inside.\n\nThey turned around and walked back down the trail without knocking.',
        },
    },
]