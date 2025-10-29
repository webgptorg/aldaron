import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Link from 'next/link';

export default function DataDeletion() {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="mt-24 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Data Deletion Instructions</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Your Right to Data Deletion</h2>
                        <p>
                            You have the right to request deletion of your personal data from PTBK and any third-party
                            services we integrate with. This page provides instructions on how to delete your data from
                            our platform and connected services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Delete Your PTBK Account Data</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium mb-3">Contact Us for Account Deletion</h3>
                            <p className="mb-4">
                                To delete your PTBK account and all associated data, please contact us at:
                            </p>
                            <div className="space-y-2">
                                <p>
                                    <strong>Email:</strong>{' '}
                                    <a href="mailto:privacy@ptbk.io" className="text-blue-600 hover:underline">
                                        privacy@ptbk.io
                                    </a>
                                </p>
                                <p>
                                    <strong>Subject:</strong> Account Deletion Request
                                </p>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                Please include your account email address and any additional information that can help
                                us identify your account.
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm">
                                <strong>Note:</strong> Account deletion is permanent and cannot be undone. All your
                                shortened URLs, analytics data, and account information will be permanently removed.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Third-Party Service Data Deletion</h2>
                        <p className="mb-6">
                            If you&apos;ve used third-party authentication services with PTBK, you may also want to
                            revoke access and delete data from these platforms:
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <span className="mr-2">📘</span>
                                    Facebook
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Remove PTBK app access and delete associated data from Facebook.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Steps:</strong>
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Go to Facebook Settings &gt; Apps and Websites</li>
                                        <li>Find PTBK in your app list</li>
                                        <li>Click &quot;Remove&quot; or &quot;Delete&quot;</li>
                                        <li>Confirm deletion of all data</li>
                                    </ol>
                                </div>
                                <a
                                    href="https://www.facebook.com/settings?tab=applications"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                                >
                                    Facebook Apps Settings →
                                </a>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <span className="mr-2">🐙</span>
                                    GitHub
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Revoke PTBK&apos;s access to your GitHub account.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Steps:</strong>
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Go to GitHub Settings &gt; Applications</li>
                                        <li>Find PTBK in &quot;Authorized OAuth Apps&quot;</li>
                                        <li>Click &quot;Revoke&quot;</li>
                                        <li>Confirm the revocation</li>
                                    </ol>
                                </div>
                                <a
                                    href="https://github.com/settings/applications"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                                >
                                    GitHub Applications →
                                </a>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <span className="mr-2">💼</span>
                                    LinkedIn
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Remove PTBK&apos;s access to your LinkedIn profile.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Steps:</strong>
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Go to LinkedIn Settings &gt; Data Privacy</li>
                                        <li>Click &quot;Permitted Services&quot;</li>
                                        <li>Find PTBK and click &quot;Remove&quot;</li>
                                        <li>Confirm removal</li>
                                    </ol>
                                </div>
                                <a
                                    href="https://www.linkedin.com/psettings/permitted-services"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                                >
                                    LinkedIn Permitted Services →
                                </a>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <span className="mr-2">🔍</span>
                                    Google
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Remove PTBK&apos;s access to your Google account.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Steps:</strong>
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Go to Google Account &gt; Security</li>
                                        <li>Click &quot;Third-party apps with account access&quot;</li>
                                        <li>Find PTBK and click &quot;Remove Access&quot;</li>
                                        <li>Confirm removal</li>
                                    </ol>
                                </div>
                                <a
                                    href="https://myaccount.google.com/permissions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                                >
                                    Google Account Permissions →
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Data Deletion Timeline</h2>
                        <div className="bg-gray-50 border rounded-lg p-6">
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        1
                                    </span>
                                    <div>
                                        <strong>Immediate:</strong> Account access is disabled upon request
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        2
                                    </span>
                                    <div>
                                        <strong>Within 7 days:</strong> Personal data is removed from active systems
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        3
                                    </span>
                                    <div>
                                        <strong>Within 30 days:</strong> Data is purged from backups and archives
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Data Retention Exceptions</h2>
                        <p className="mb-4">
                            Some data may be retained for legitimate business purposes or legal requirements:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Transaction records for accounting and tax purposes (as required by law)</li>
                            <li>Data necessary for legal compliance or ongoing legal proceedings</li>
                            <li>Aggregated, anonymized analytics data that cannot identify you</li>
                            <li>Security logs for fraud prevention and system security</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
                        <p>
                            If you need assistance with data deletion or have questions about this process, please
                            contact us:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p>
                                <strong>Email:</strong>{' '}
                                <a href="mailto:privacy@ptbk.io" className="text-blue-600 hover:underline">
                                    privacy@ptbk.io
                                </a>
                            </p>
                            <p className="mt-2">
                                <strong>Privacy Policy:</strong>{' '}
                                <Link href="/privacy" className="text-blue-600 hover:underline">
                                    View our Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
