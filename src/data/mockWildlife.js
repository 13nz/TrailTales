// stores mock wildlife information that will eventually come from nps species data
// this data represents animals known to live in or around the selected park

const mockWildlife = {
    yellowstone: [
        {
            id: 'yellowstone-bison',
            parkId: 'yellowstone',
            name: 'American Bison',
            description:
                'Large grazing mammals commonly found throughout Yellowstone.',
        },
        {
            id: 'yellowstone-elk',
            parkId: 'yellowstone',
            name: 'Elk',
            description:
                'Elk are commonly seen in meadows, valleys, and forest edges throughout the park.',
        },
        {
            id: 'yellowstone-grizzly',
            parkId: 'yellowstone',
            name: 'Grizzly Bear',
            description:
                'Grizzly bears inhabit Yellowstone and may be encountered in remote areas of the park.',
        },
        {
            id: 'yellowstone-gray-wolf',
            parkId: 'yellowstone',
            name: 'Gray Wolf',
            description:
                'Gray wolves live in Yellowstone and can occasionally be observed from a safe distance.',
        },
        {
            id: 'yellowstone-bald-eagle',
            parkId: 'yellowstone',
            name: 'Bald Eagle',
            description:
                'Bald eagles can be found near Yellowstone lakes, rivers, and other waterways.',
        },
    ],

    'great-smoky-mountains': [
        {
            id: 'smokies-black-bear',
            parkId: 'great-smoky-mountains',
            name: 'Black Bear',
            description:
                'Black bears are widespread throughout the Great Smoky Mountains.',
        },
        {
            id: 'smokies-elk',
            parkId: 'great-smoky-mountains',
            name: 'Elk',
            description:
                'Elk can be observed in several open areas of the park.',
        },
        {
            id: 'smokies-white-tailed-deer',
            parkId: 'great-smoky-mountains',
            name: 'White-tailed Deer',
            description:
                'White-tailed deer are commonly encountered throughout the park.',
        },
    ],
}

export default mockWildlife