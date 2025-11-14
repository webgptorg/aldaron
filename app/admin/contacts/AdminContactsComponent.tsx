'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useGetParam } from '@/hooks/useGetParam';
import moment from 'moment';
import { useEffect, useState } from 'react';

export default function AdminContactsComponent() {
    const [token] = useGetParam('token');
    const [contacts, setContacts] = useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/contacts?token=${encodeURIComponent(token || '')}&showAll=${showAll}`)
            .then((res) => res.json())
            .then((data) => {
                setContacts((data as { contacts: any[] }).contacts || []);
                setLoading(false);
            });
    }, [showAll]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Contacts Dashboard</h1>
            <div className="flex items-center mb-4 gap-2">
                <Switch checked={showAll} onCheckedChange={setShowAll} />
                <span>{showAll ? 'Show all contacts' : 'Show only not contacted'}</span>
                <Button
                    onClick={() => {
                        const headers = [
                            'createdAt',
                            'fullname',
                            'email',
                            'phone',
                            'userNote',
                            'isContacted',
                            'ourNote',
                            'userAgent',
                            'ipAddress',
                            'referrer',
                            'appName',
                            'placeName',
                            'url',
                        ];
                        const csvRows = [
                            headers.join(','),
                            ...contacts.map((c) =>
                                headers.map((h) => `"${(c[h] ?? '').toString().replace(/"/g, '""')}"`).join(','),
                            ),
                        ];
                        const csvContent = csvRows.join('\r\n');
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'contacts.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    Export CSV
                </Button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell>Created At</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>User Note</TableCell>
                            <TableCell>Is Contacted</TableCell>
                            <TableCell>Our Note</TableCell>
                            <TableCell>User Agent</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Referrer</TableCell>
                            <TableCell>App Name</TableCell>
                            <TableCell>Place Name</TableCell>
                            <TableCell>URL</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((c: any) => (
                            <TableRow key={c.id}>
                                <TableCell>{moment(c.createdAt).calendar()}</TableCell>
                                <TableCell>{c.fullname}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.phone}</TableCell>
                                <TableCell>{c.userNote}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={!!c.isContacted}
                                        onCheckedChange={async (val) => {
                                            const res = await fetch(
                                                `/api/contacts?token=${encodeURIComponent(token || '')}`,
                                                {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: c.id,
                                                        isContacted: val,
                                                        ourNote: c.ourNote,
                                                    }),
                                                },
                                            );
                                            if (res.ok) {
                                                setContacts((prev) =>
                                                    prev.map((row) =>
                                                        row.id === c.id ? { ...row, isContacted: val } : row,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Textarea
                                        className="min-w-[200px] h-full min-h-[100px]"
                                        value={c.ourNote ?? ''}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            const res = await fetch(
                                                `/api/contacts?token=${encodeURIComponent(token || '')}`,
                                                {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: c.id,
                                                        ourNote: val,
                                                        isContacted: c.isContacted,
                                                    }),
                                                },
                                            );
                                            if (res.ok) {
                                                setContacts((prev) =>
                                                    prev.map((row) =>
                                                        row.id === c.id ? { ...row, ourNote: val } : row,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{c.userAgent}</TableCell>
                                <TableCell>{c.ipAddress}</TableCell>
                                <TableCell>{c.referrer}</TableCell>
                                <TableCell>{c.appName}</TableCell>
                                <TableCell>{c.placeName}</TableCell>
                                <TableCell>{c.url}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
