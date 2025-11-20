const LONG_URL = `https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/`;
// const SHORT_URL = `https://ptbk.io/k/`;

/*
https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/f/a/nt-220-2012-aplikace-zakona-o-dph.doc

https://ptbk.io/k/78/2ded9/nt-247-2014-zajisteni-bozp-v-umc-13.pdf
http://localhost:4009/k/78/2ded9/nt-247-2014-zajisteni-bozp-v-umc-13.pdf
*/

/*
export default function KnowledgeSourcePage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mt-24 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Knowledge</h1>
                <iframe
                    src="https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/f/a/nt-220-2012-aplikace-zakona-o-dph.doc"
                    className="w-full h-screen border"
                    title="Knowledge Source Document"
                ></iframe>
            </main>
            <Footer />
        </div>
    );
}
*/

export async function GET(request: Request, { params }: { params: Promise<{ shortFileUrlParts: Array<string> }> }) {
    let { shortFileUrlParts } = await params;

    const shortFileUrl = shortFileUrlParts.join('/');
    const longFileUrl = `${LONG_URL}${shortFileUrl}`;

    try {
        /*
        return new Response(JSON.stringify({ shortFileUrlParts, shortFileUrl, longFileUrl }, null, 4), {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
        */

        return Response.redirect(longFileUrl, 302);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: (error as Error).message }, null, 4), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
