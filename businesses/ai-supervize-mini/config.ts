type WorkshopFormat = 'onsite' | 'online';

type WorkshopDate = {
    id: string;
    label: string;
    format: WorkshopFormat;
    formatLabel: string;
    placeLabel: string;
    pricePerParticipantCzk: number;
    remainingSeats: number;
};

export const aiSupervizeMiniWorkshopConfig = {
    maxParticipantsPerWorkshop: 10,
    timeRange: '9:30-17:00',
    discount: {
        percent: 15,
        validCodeRegex: /^SUPER_[A-Z0-9]+(?:_[A-Z0-9]+)*_15$/,
    },
    dates: [
        {
            id: '2026-06-19',
            label: '19. 6. 2026',
            format: 'onsite',
            formatLabel: 'Prezenčně v Praze',
            placeLabel: 'Praha',
            pricePerParticipantCzk: 12000,
            remainingSeats: 6,
        },
        {
            id: '2026-06-25',
            label: '25. 6. 2026',
            format: 'online',
            formatLabel: 'Online',
            placeLabel: 'Online',
            pricePerParticipantCzk: 9000,
            remainingSeats: 8,
        },
    ] as ReadonlyArray<WorkshopDate>,
} as const;
