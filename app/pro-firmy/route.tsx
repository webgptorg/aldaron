export async function GET(request: Request, { params }: { params: Promise<{ shortFileUrlParts: Array<string> }> }) {
    return Response.redirect(new URL('/cs', request.url), 301);
}
