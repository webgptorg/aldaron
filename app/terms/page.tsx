import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mt-24 max-w-4xl mx-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                            <p>
                                By accessing and using PTBK (&quot;the Service&quot;), you accept and agree to be bound
                                by the terms and provision of this agreement. If you do not agree to abide by the above,
                                please do not use this service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
                            <p>
                                PTBK is a platform that provides URL shortening and management services. We reserve the
                                right to modify, suspend, or discontinue the service at any time without notice.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">User Accounts and Registration</h2>
                            <p>
                                To access certain features of our service, you may be required to register for an
                                account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your account information</li>
                                <li>Keep your account credentials secure</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Third-Party Authentication</h2>
                            <p>
                                Our service may integrate with third-party authentication providers. By using these
                                services, you also agree to their terms:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">Facebook Login</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Authentication via Facebook is subject to Facebook&apos;s terms.
                                    </p>
                                    <a
                                        href="https://www.facebook.com/legal/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Facebook Terms →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">GitHub OAuth</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Authentication via GitHub is subject to GitHub&apos;s terms.
                                    </p>
                                    <a
                                        href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        GitHub Terms →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">LinkedIn Login</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Authentication via LinkedIn is subject to LinkedIn&apos;s terms.
                                    </p>
                                    <a
                                        href="https://www.linkedin.com/legal/user-agreement"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        LinkedIn User Agreement →
                                    </a>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-2">Google OAuth</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Authentication via Google is subject to Google&apos;s terms.
                                    </p>
                                    <a
                                        href="https://policies.google.com/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Google Terms →
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                            <p>You agree not to use the service to:</p>
                            <ul className="list-disc pl-6">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Distribute malware, spam, or harmful content</li>
                                <li>Engage in fraudulent or deceptive practices</li>
                                <li>Harass, abuse, or harm others</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Create shortened URLs for illegal or harmful content</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Content and Intellectual Property</h2>
                            <p>
                                You retain ownership of any content you submit to our service. By submitting content,
                                you grant us a license to use, modify, and display that content in connection with
                                providing the service.
                            </p>
                            <p className="mt-4">
                                Our service and its original content, features, and functionality are owned by PTBK and
                                are protected by international copyright, trademark, and other intellectual property
                                laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
                            <p>
                                Your privacy is important to us. Please review our{' '}
                                <Link href="/privacy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </Link>
                                , which also governs your use of the service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
                            <p>
                                We may terminate or suspend your account and access to the service immediately, without
                                prior notice, for conduct that we believe violates these Terms of Service or is harmful
                                to other users, us, or third parties.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
                            <p>
                                The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We
                                make no representations or warranties of any kind, express or implied, regarding the
                                service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                            <p>
                                In no event shall PTBK be liable for any indirect, incidental, special, consequential,
                                or punitive damages, including without limitation, loss of profits, data, use, goodwill,
                                or other intangible losses.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will notify users of any
                                material changes by posting the new terms on this page and updating the &quot;Last
                                updated&quot; date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                            <p>
                                If you have any questions about these Terms of Service, please contact us at{' '}
                                <a href="mailto:legal@ptbk.io" className="text-blue-600 hover:underline">
                                    legal@ptbk.io
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
