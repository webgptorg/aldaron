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
            remainingSeats: 7,
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
