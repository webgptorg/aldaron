export const aiSupervizeMiniWorkshopConfig = {
    pricePerParticipantCzk: 8500,
    maxParticipantsPerWorkshop: 10,
    place: 'Praha',
    timeRange: '9:00-17:00',
    discount: {
        code: 'SUPER',
        percent: 15,
        codeFormat: {
            suffix: '15',
            minimumMiddleParts: 1,
        },
    },
    dates: [
        {
            id: '2026-05-15',
            label: '15. 5. 2026',
            remainingSeats: 8,
        },
        /*
        {
            id: '2026-05-21',
            label: '21. 5. 2026',
            remainingSeats: 7,
        },
        */
    ],
} as const;
