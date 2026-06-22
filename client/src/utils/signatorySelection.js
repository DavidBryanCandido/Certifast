export function buildClientSignatorySnapshot(
    captain,
    kagawads = [],
    selections = {},
) {
    const byId = new Map(
        kagawads.map((item) => [String(item.assignmentId), item]),
    );
    const snapshot = captain ? { captain } : {};

    Object.entries(selections || {}).forEach(([slot, assignmentId]) => {
        const selected = byId.get(String(assignmentId));
        if (selected) snapshot[slot] = selected;
    });

    return snapshot;
}

export function validateSignatorySelections(
    requirements,
    selections,
    kagawads,
) {
    if (!requirements.length) return "";
    if (!kagawads.length) {
        return "No active Barangay Kagawads are configured for the current administration.";
    }

    const selectedIds = [];
    const validIds = new Set(
        kagawads.map((item) => String(item.assignmentId)),
    );
    for (const requirement of requirements) {
        const selected = selections?.[requirement.slot];
        if (!selected) return `Select ${requirement.label}.`;
        if (!validIds.has(String(selected))) {
            return `Select an active Kagawad for ${requirement.label}.`;
        }
        selectedIds.push(String(selected));
    }
    if (new Set(selectedIds).size !== selectedIds.length) {
        return "Choose a different Kagawad for each signatory or witness slot.";
    }
    return "";
}
