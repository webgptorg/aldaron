'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContact, setNewContact] = useState({
        fullname: '',
        email: '',
        phone: '',
        userNote: '',
        appName: '',
        placeName: '',
    });

    useEffect(() => {
        setLoading(true);
        fetch(`/api/contacts?token=${encodeURIComponent(token || '')}&showAll=${showAll}`)
            .then((res) => res.json())
            .then((data) => {
                setContacts((data as { contacts: any[] }).contacts || []);
                setLoading(false);
            });
    }, [showAll]);

    const handleAddContact = async () => {
        const res = await fetch(`/api/contacts?token=${encodeURIComponent(token || '')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact),
        });
        if (res.ok) {
            const addedContact = await res.json();
            setContacts((prev) => [addedContact, ...prev]);
            setNewContact({
                fullname: '',
                email: '',
                phone: '',
                userNote: '',
                appName: '',
                placeName: '',
            });
            setShowAddForm(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Contacts Dashboard</h1>
            <div className="flex items-center mb-4 gap-2">
                <Switch checked={showAll} onCheckedChange={setShowAll} />
                <span>{showAll ? 'Show all contacts' : 'Showing only not contacted'}</span>
                <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? 'outline' : 'default'}>
                    {showAddForm ? 'Cancel' : 'Add Contact'}
                </Button>
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
            {showAddForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">Add New Contact</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <Input
                                type="text"
                                value={newContact.fullname}
                                onChange={(e) => setNewContact({ ...newContact, fullname: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                                type="email"
                                value={newContact.email}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                                type="tel"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">App Name</label>
                            <Input
                                type="text"
                                value={newContact.appName}
                                onChange={(e) => setNewContact({ ...newContact, appName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Place Name</label>
                            <Input
                                type="text"
                                value={newContact.placeName}
                                onChange={(e) => setNewContact({ ...newContact, placeName: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">User Note</label>
                            <Textarea
                                className="w-full"
                                value={newContact.userNote}
                                onChange={(e) => setNewContact({ ...newContact, userNote: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button className="mt-4" onClick={handleAddContact}>
                        Save Contact
                    </Button>
                </div>
            )}
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
