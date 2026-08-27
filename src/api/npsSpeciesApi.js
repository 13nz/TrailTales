/*
 * npspecies api service
 *
 * this service is separate from the main nps api because
 * npspecies is provided through the nps irma services api.
 */

const NPS_SPECIES_BASE_URL =
	"https://irmaservices.nps.gov/NPSpecies/v3/rest";

/*
 * capitalizes each word in a common wildlife name.
 */
function formatCommonName(name) {
	return String(name)
		.split(",")[0]
		.trim()
		.toLowerCase()
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/*
 * loads animal species associated with one nps park.
 *
 * only species marked as present are returned.
 */
export async function getAnimalSpecies(parkCode) {
	if (!parkCode) {
		return [];
	}

	const unitCode = String(parkCode).trim().toUpperCase();

	try {
		const categories =
			"Mammals,Birds,Reptiles,Amphibians,Fish";

		const url =
			`${NPS_SPECIES_BASE_URL}/checklist/` +
			`${encodeURIComponent(unitCode)}/` +
			`${encodeURIComponent(categories)}` +
			"?format=json";

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`NPSpecies request failed with status ${response.status}`,
			);
		}

		const data = await response.json();

		const speciesList = Array.isArray(data)
			? data
			: Array.isArray(data?.SpeciesListItem)
				? data.SpeciesListItem
				: [];

		/*
		 * only display species that are currently present
		 * in the selected park.
		 */
		const presentSpecies = speciesList.filter((species) => {
			const occurrence = String(
				species.Occurrence ||
					species.OccurrenceStatus ||
					species.occurrence ||
					"",
			)
				.trim()
				.toLowerCase();

			return occurrence === "present";
		});

		const normalizedSpecies = presentSpecies
			.map((species, index) => {
				const rawCommonName =
					species.CommonName ||
					species.CommonNames ||
					species.commonName ||
					species.commonNames ||
					"";

				const scientificName =
					species.ScientificName ||
					species.scientificName ||
					"";

				const commonName = formatCommonName(rawCommonName);

				return {
					id:
						species.TaxaCode ||
						species.TaxonCode ||
						species.Id ||
						`${unitCode}-${index}`,
					name: commonName,
					scientificName: String(scientificName).trim(),
					description: "",
				};
			})
			.filter((species) => species.name);

		/*
		 * removes duplicate common names.
		 */
		const uniqueSpecies = normalizedSpecies.filter(
			(species, index, array) =>
				index ===
				array.findIndex(
					(item) =>
						item.name.toLowerCase() ===
						species.name.toLowerCase(),
				),
		);

		return uniqueSpecies;
	} catch (error) {
		console.error(
			`NPSpecies wildlife error for ${unitCode}:`,
			error,
		);

		throw error;
	}
}