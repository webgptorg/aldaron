'use client';

import { CreateAvatarModal } from '@/components/create-avatar-modal';
import { useState } from 'react';

export default function TestModalPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Test Modal with Deep Scraping</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                    Open Modal
                </button>

                <div className="mt-8 text-left max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click "Open Modal" to open the Create Avatar modal</li>
                        <li>Select Facebook (the only available platform)</li>
                        <li>Look for the "Enable Deep Scraping Mode" checkbox</li>
                        <li>Toggle the checkbox to test deep vs quick mode</li>
                        <li>Click "Import Data & Create Avatar" to test the URL generation</li>
                    </ol>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800">Expected URLs:</h3>
                        <ul className="mt-2 space-y-1 text-sm text-blue-700">
                            <li><strong>Quick Mode (default):</strong> https://promptbook.studio/from-social?services=facebook&scrapingMode=QUICK</li>
                            <li><strong>Deep Mode:</strong> https://promptbook.studio/from-social?services=facebook&scrapingMode=DEEP</li>
                        </ul>
                    </div>
                </div>
            </div>

            <CreateAvatarModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
