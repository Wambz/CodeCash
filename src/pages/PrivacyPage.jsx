import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white p-6 font-display">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center ring-1 ring-red-500/20">
                        <Shield className="w-6 h-6 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, and government-issued ID for KYC verification.</li>
                            <li><strong>Financial Information:</strong> M-Pesa transaction details, Deriv account IDs, and transaction history.</li>
                            <li><strong>Usage Data:</strong> Information about how you access and use our platform, including device information and IP addresses.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                            <li>Process your M-Pesa and Deriv transactions.</li>
                            <li>Verify your identity and prevent fraud.</li>
                            <li>Comply with legal and regulatory requirements.</li>
                            <li>Provide customer support and improve our services.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">3. Data Sharing and Disclosure</h2>
                        <p>We may share your information with:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                            <li><strong>Service Providers:</strong> Deriv, M-Pesa (Safaricom), and identity verification partners.</li>
                            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and users.</li>
                        </ul>
                        <p className="mt-2">We do not sell your personal data to third parties.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
                        <p>We implement industry-standard security measures, including encryption and secure protocols, to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
                        <p>You have the right to access, correct, or delete your personal information. You may also object to processing or request data portability. Contact our support team to exercise these rights.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
                        <p>We use local storage and cookies to maintain your session and preference settings. You can control cookie settings through your browser.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPage;
