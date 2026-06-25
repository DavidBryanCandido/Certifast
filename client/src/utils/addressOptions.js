export const PUROKS_FALLBACK = [
    { purok_id: 1, name: "Purok 1" },
    { purok_id: 2, name: "Purok 2" },
    { purok_id: 3, name: "Purok 3" },
    { purok_id: 4, name: "Purok 4" },
    { purok_id: 5, name: "Purok 5" },
    { purok_id: 6, name: "Purok 6" },
    { purok_id: 7, name: "Purok 7" },
    { purok_id: 8, name: "Purok 8" },
    { purok_id: 9, name: "Purok 9" },
    { purok_id: 10, name: "Purok 10" },
    { purok_id: 11, name: "Purok 11" },
];

export const STREETS_FALLBACK = [
    { street_id: 1, name: "Acayan Street" },
    { street_id: 2, name: "Apelado Street" },
    { street_id: 3, name: "Bacon Street" },
    { street_id: 4, name: "Cruz Dela Drive" },
    { street_id: 5, name: "Coll Street" },
    { street_id: 6, name: "Donor Street" },
    { street_id: 7, name: "Espiritu Street" },
    { street_id: 8, name: "Fendler Street" },
    { street_id: 9, name: "Fendler Extension Street" },
    { street_id: 10, name: "Fontain Extension Street" },
    { street_id: 11, name: "Gallagher Street" },
    { street_id: 12, name: "Hansen Street" },
    { street_id: 13, name: "Irving Street" },
    { street_id: 14, name: "5th Street" },
    { street_id: 15, name: "6th Street" },
    { street_id: 16, name: "8th Street" },
    { street_id: 17, name: "9th Street" },
    { street_id: 18, name: "10th Street" },
    { street_id: 19, name: "12th Street" },
    { street_id: 20, name: "13th Street" },
    { street_id: 21, name: "14th Street" },
    { street_id: 22, name: "16th Street" },
];

const FALLBACK_MAPPING_PAIRS = [
    [1, 8],
    [1, 11],
    [1, 12],
    [1, 13],
    [1, 19],
    [1, 20],
    [1, 21],
    [2, 6],
    [2, 8],
    [2, 11],
    [2, 12],
    [2, 21],
    [2, 22],
    [3, 4],
    [3, 5],
    [3, 6],
    [3, 10],
    [3, 21],
    [3, 22],
    [4, 6],
    [4, 8],
    [4, 10],
    [4, 11],
    [4, 12],
    [4, 21],
    [4, 22],
    [5, 3],
    [5, 6],
    [5, 7],
    [5, 8],
    [5, 10],
    [5, 21],
    [5, 22],
    [6, 6],
    [6, 8],
    [6, 11],
    [6, 12],
    [6, 19],
    [6, 20],
    [6, 21],
    [6, 22],
    [7, 8],
    [7, 11],
    [7, 12],
    [7, 13],
    [7, 19],
    [7, 20],
    [7, 21],
    [8, 2],
    [8, 3],
    [8, 7],
    [8, 8],
    [8, 16],
    [8, 17],
    [8, 18],
    [9, 8],
    [9, 11],
    [9, 12],
    [9, 13],
    [9, 18],
    [9, 19],
    [10, 3],
    [10, 7],
    [10, 8],
    [10, 16],
    [10, 17],
    [10, 18],
    [11, 1],
    [11, 2],
    [11, 8],
    [11, 9],
    [11, 14],
    [11, 15],
];

function toPositiveId(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function byId(items, key) {
    return new Map(items.map((item) => [String(item[key]), item]));
}

function enrichMappings(mappings, puroks, streets) {
    const puroksById = byId(puroks, "purok_id");
    const streetsById = byId(streets, "street_id");

    return mappings
        .map((mapping, index) => {
            const purokId = toPositiveId(mapping.purok_id);
            const streetId = toPositiveId(mapping.street_id);
            if (!purokId || !streetId) return null;

            return {
                purok_id: purokId,
                purok_name:
                    mapping.purok_name ||
                    puroksById.get(String(purokId))?.name ||
                    `Purok ${purokId}`,
                street_id: streetId,
                street_name:
                    mapping.street_name ||
                    streetsById.get(String(streetId))?.name ||
                    `Street ${streetId}`,
                sort_order: toPositiveId(mapping.sort_order) || index + 1,
            };
        })
        .filter(Boolean);
}

export const STREET_MAPPINGS_FALLBACK = enrichMappings(
    FALLBACK_MAPPING_PAIRS.map(([purok_id, street_id], index) => ({
        purok_id,
        street_id,
        sort_order: index + 1,
    })),
    PUROKS_FALLBACK,
    STREETS_FALLBACK,
);

export function normalizeAddressOptions(data) {
    const puroks =
        Array.isArray(data?.puroks) && data.puroks.length
            ? data.puroks
            : PUROKS_FALLBACK;
    const streets =
        Array.isArray(data?.streets) && data.streets.length
            ? data.streets
            : STREETS_FALLBACK;
    const rawMappings =
        Array.isArray(data?.streetMappings) && data.streetMappings.length
            ? data.streetMappings
            : Array.isArray(data?.street_mappings) &&
                data.street_mappings.length
              ? data.street_mappings
              : STREET_MAPPINGS_FALLBACK;

    return {
        puroks,
        streets,
        streetMappings: enrichMappings(rawMappings, puroks, streets),
    };
}

export function isMappedPurokStreet(streetMappings, purokId, streetId) {
    if (!purokId || !streetId) return false;
    return streetMappings.some(
        (mapping) =>
            String(mapping.purok_id) === String(purokId) &&
            String(mapping.street_id) === String(streetId),
    );
}

export function isStreetAllowedForPurok(streetMappings, purokId, streetId) {
    if (!purokId || !streetId) return true;
    return isMappedPurokStreet(streetMappings, purokId, streetId);
}

export function findSingleMappedPurok(streetMappings, streetId) {
    if (!streetId) return "";
    const purokIds = Array.from(
        new Set(
            streetMappings
                .filter((mapping) => String(mapping.street_id) === String(streetId))
                .map((mapping) => String(mapping.purok_id)),
        ),
    );
    return purokIds.length === 1 ? purokIds[0] : "";
}

export function buildStreetOptions(streets, streetMappings, purokId) {
    const streetsById = byId(streets, "street_id");
    const mappedStreetIds = new Set();

    if (purokId) {
        streetMappings
            .filter((mapping) => String(mapping.purok_id) === String(purokId))
            .forEach((mapping) => mappedStreetIds.add(String(mapping.street_id)));
    }

    const source = purokId
        ? Array.from(mappedStreetIds)
              .map((streetId) => {
                  const street = streetsById.get(streetId);
                  const mapping = streetMappings.find(
                      (item) => String(item.street_id) === streetId,
                  );
                  return street
                      ? { street_id: street.street_id, name: street.name }
                      : {
                            street_id: streetId,
                            name: mapping?.street_name || `Street ${streetId}`,
                        };
              })
              .filter(Boolean)
        : streets;

    return source.map((street) => {
        return {
            value: String(street.street_id),
            label: street.name,
            street_id: String(street.street_id),
        };
    });
}
