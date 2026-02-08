import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

function TermsPage() {
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
                        <Scale className="w-6 h-6 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing and using CodeCash, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">2. Eligibility</h2>
                        <p>You must be at least 18 years old and capable of forming a binding contract to use our services. By using CodeCash, you represent and warrant that you meet these requirements.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">3. Services Provided</h2>
                        <p>CodeCash provides an intermediary platform to facilitate the exchange of funds between M-Pesa mobile money accounts and Deriv trading accounts. We are not a bank, financial institution, or an associate of Deriv.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">4. Account Registration</h2>
                        <p>To use our services, you must register an account and provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">5. Fees and Payments</h2>
                        <p>We charge fees for our services as displayed at the time of transaction. You are responsible for all third-party fees (e.g., M-Pesa transaction charges) associated with your transfers.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">6. Prohibited Activities</h2>
                        <p>You agree not to use our services for any unlawful purpose, including but not limited to money laundering, fraud, or financing terrorism. We reserve the right to suspend or terminate accounts suspected of such activities.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                        <p>CodeCash shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">8. Termination</h2>
                        <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason aimed at protecting our platform and users.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsPage;
