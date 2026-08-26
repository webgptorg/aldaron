import { CommunityProjectsPanel } from '@/businesses/community/CommunityProjectsPanel';
import { loadCommunityProjects } from '@/lib/communityProjects';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CommunityProjectsPage() {
    const projects = await loadCommunityProjects();
    return <main className="min-h-screen bg-[#06131b] px-4 py-10 text-slate-200 sm:px-8"><div className="mx-auto max-w-[1200px]"><Link href="/cs/komunita" className="text-sm text-cyan-300">← Zpět do komunity</Link><h1 className="mt-8 text-4xl font-bold text-white">Projekty komunity</h1><p className="mt-3 max-w-2xl text-slate-400">Objevte projekty a výtvory členů Promptbooku.</p><CommunityProjectsPanel projects={projects} /></div></main>;
}
