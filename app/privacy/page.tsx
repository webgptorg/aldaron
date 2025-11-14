import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mt-24 max-w-4xl mx-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                            <p>
                                PTBK (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
                                your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                your information when you use our service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                            <h3 className="text-xl font-medium mb-2">Personal Information</h3>
                            <p>We may collect personal information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 mb-4">
                                <li>Email address (for newsletter subscriptions)</li>
                                <li>Contact information (when you contact us)</li>
                                <li>Usage data and analytics</li>
                            </ul>

                            <h3 className="text-xl font-medium mb-2">Automatically Collected Information</h3>
                            <p>We automatically collect certain information when you use our service:</p>
                            <ul className="list-disc pl-6 mb-4">
                                <li>IP address and device information</li>
                                <li>Browser type and version</li>
                                <li>Usage patterns and preferences</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
                            <p>
                                Our service integrates with the following third-party platforms. Please review their
                                privacy policies:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">Facebook</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We may use Facebook Login and Facebook Analytics.
                                    </p>
                                    <a
                                        href="https://www.facebook.com/privacy/policy/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Facebook Privacy Policy →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">GitHub</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We may use GitHub OAuth for authentication.
                                    </p>
                                    <a
                                        href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        GitHub Privacy Statement →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">LinkedIn</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We may use LinkedIn Login and LinkedIn Analytics.
                                    </p>
                                    <a
                                        href="https://www.linkedin.com/legal/privacy-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        LinkedIn Privacy Policy →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">Google</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We may use Google Analytics and Google OAuth.
                                    </p>
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Google Privacy Policy →
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6">
                                <li>Provide and maintain our service</li>
                                <li>Improve user experience</li>
                                <li>Send newsletters and updates (with your consent)</li>
                                <li>Respond to your inquiries</li>
                                <li>Analyze usage patterns</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                            <p>
                                We do not sell your personal information. We may share your information in the following
                                circumstances:
                            </p>
                            <ul className="list-disc pl-6">
                                <li>With your explicit consent</li>
                                <li>To comply with legal requirements</li>
                                <li>To protect our rights and safety</li>
                                <li>With service providers who assist us in operating our service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your information</li>
                                <li>Object to processing of your information</li>
                                <li>Data portability</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:privacy@ptbk.io" className="text-blue-600 hover:underline">
                                    privacy@ptbk.io
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
