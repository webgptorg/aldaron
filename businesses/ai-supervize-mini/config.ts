// Baseline for the dynamic seat countdown.
// On REMAINING_SEATS_BASELINE_DATE_ISO the page shows REMAINING_SEATS_BASELINE.
// Each calendar day in Europe/Prague after that, the count drops by 1 (clamped at 0).
// The Prague timezone keeps SSR and client renders aligned regardless of where the
// Node process or the visitor is located.
const REMAINING_SEATS_BASELINE = 5;
const REMAINING_SEATS_BASELINE_DATE_ISO = '2026-05-11';

const pragueDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

function getPragueDateAsUtcMidnight(date: Date): Date {
    const pragueIso = pragueDateFormatter.format(date);
    return new Date(`${pragueIso}T00:00:00Z`);
}

function computeRemainingSeats(): number {
    const today = getPragueDateAsUtcMidnight(new Date());
    const baseline = new Date(`${REMAINING_SEATS_BASELINE_DATE_ISO}T00:00:00Z`);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysPassed = Math.floor((today.getTime() - baseline.getTime()) / msPerDay);
    return Math.max(0, REMAINING_SEATS_BASELINE - daysPassed);
}

export const aiSupervizeMiniWorkshopConfig = {
    pricePerParticipantCzk: 8500,
    maxParticipantsPerWorkshop: 10,
    place: 'Praha',
    timeRange: '9:30-17:00',
    discount: {
        percent: 15,
        validCodeRegex: /^SUPER_[A-Z0-9]+(?:_[A-Z0-9]+)*_15$/,
    },
    dates: [
        {
            id: '2026-05-15',
            label: '15. 5. 2026',
            get remainingSeats() {
                return computeRemainingSeats();
            },
        },
        /*
        {
            id: '2026-05-21',
            label: '21. 5. 2026',
            get remainingSeats() {
                return computeRemainingSeats();
            },
        },
        */
    ],
} as const;
