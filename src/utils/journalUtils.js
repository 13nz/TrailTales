// creates the initial journal structure for a trip
export function createEmptyJournal() {
    return {
        pages: [],
    }
}

// creates a new blank scrapbook page
export function createJournalPage(
    tripId,
    date
) {
    const timestamp =
        Date.now()

    return {
        id: `journal-page-${timestamp}`,
        tripId,
        title: 'Untitled page',
        date,
        elements: [],
    }
}

// creates a new scrapbook element
export function createJournalElement(
    pageId,
    type,
    data = {}
) {
    const timestamp =
        Date.now()

    return {
        id: `journal-element-${timestamp}`,
        pageId,
        type,
        x: data.x ?? 40,
        y: data.y ?? 40,
        width:
            data.width ?? 200,
        height:
            data.height ?? 100,
        rotation:
            data.rotation ?? 0,
        ...data,
    }
}