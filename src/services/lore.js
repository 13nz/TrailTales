import { supabase } from "./supabase";

/*
 * loads every lore entry together with its categories.
 * park information is intentionally not duplicated here because
 * park names come from the nps api.
 */
export async function getLoreEntries() {
	const { data, error } = await supabase
		.from("lore_entries")
		.select(
			`
                *,
                lore_entry_categories (
                    category_id,
                    lore_categories (
                        id,
                        name
                    )
                )
            `,
		)
		.order("title", {
			ascending: true,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeLoreEntry);
}

/*
 * loads all lore entries belonging to one nps park code.
 */
export async function getLoreEntriesByPark(parkCode) {
	const { data, error } = await supabase
		.from("lore_entries")
		.select(
			`
                *,
                lore_entry_categories (
                    category_id,
                    lore_categories (
                        id,
                        name
                    )
                )
            `,
		)
		.eq("park_code", parkCode)
		.order("title", {
			ascending: true,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeLoreEntry);
}

/*
 * loads only campfire-eligible stories for one national park.
 */
export async function getCampfireLoreEntries(parkCode) {
	const { data, error } = await supabase
		.from("lore_entries")
		.select(
			`
                *,
                lore_entry_categories (
                    category_id,
                    lore_categories (
                        id,
                        name
                    )
                )
            `,
		)
		.eq("park_code", parkCode)
		.eq("campfire_eligible", true)
		.order("title", {
			ascending: true,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeLoreEntry);
}

/*
 * loads one lore entry by its database uuid.
 */
export async function getLoreEntryById(loreId) {
	const { data, error } = await supabase
		.from("lore_entries")
		.select(
			`
                *,
                lore_entry_categories (
                    category_id,
                    lore_categories (
                        id,
                        name
                    )
                )
            `,
		)
		.eq("id", loreId)
		.single();

	if (error) {
		throw error;
	}

	return normalizeLoreEntry(data);
}

/*
 * converts the database category records into the simple
 * category array used by the screens.
 */
function normalizeLoreEntry(entry) {
	const categories = (entry.lore_entry_categories || []).map(
		(item) => item.category_id,
	);

	const categoryNames = (entry.lore_entry_categories || [])
		.map((item) => item.lore_categories?.name)
		.filter(Boolean);

	return {
		...entry,

		categories,

		categoryNames,

		campfireStory:
			entry.campfire_eligible &&
			entry.campfire_title &&
			entry.campfire_content
				? {
						title: entry.campfire_title,
						content: entry.campfire_content,
					}
				: null,

		sourceUrl: entry.source_url || null,
	};
}

/*
 * loads only lore entries that are actual stories
 * and are explicitly enabled for campfire mode.
 */
export async function getAllCampfireLoreEntries() {
	const { data, error } = await supabase
		.from("lore_entries")
		.select(
			`
                *,
                lore_entry_categories (
                    category_id,
                    lore_categories (
                        id,
                        name
                    )
                )
            `,
		)
		.eq("campfire_eligible", true)
		.order("title", {
			ascending: true,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeLoreEntry);
}