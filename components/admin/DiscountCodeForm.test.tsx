/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiscountCodeForm } from './DiscountCodeForm';

describe('discount-code form', () => {
    it('defaults subscription discounts to permanent and saves the selected temporary month count', async () => {
        const onSave = vi.fn().mockResolvedValue(true);

        render(
            <DiscountCodeForm
                discountCode={null}
                onSave={onSave}
                onCancelEditing={() => undefined}
            />,
        );

        expect((screen.getByRole('radio', { name: /Trvalá sleva/ }) as HTMLInputElement).checked).toBe(true);

        fireEvent.change(screen.getByLabelText('Slevový kód'), { target: { value: 'community-three-months' } });
        fireEvent.click(screen.getByRole('radio', { name: /Dočasná sleva/ }));
        fireEvent.change(screen.getByRole('spinbutton', { name: /Počet zlevněných měsíců/ }), {
            target: { value: '3' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit slevový kód' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                code: 'community-three-months',
                subscriptionDiscountDurationMonths: 3,
            }),
        );
    });
});
