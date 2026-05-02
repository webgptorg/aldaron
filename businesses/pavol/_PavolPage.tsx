'use client';

import { PAVOL_CV_URL, pavolContent, type PavolLanguage } from '@/businesses/pavol/pavolContent';
import { FeatureCardsSection, type FeatureCard } from '@/components/feature-cards-section';
import { Header } from '@/components/header';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BrainCircuit,
    CalendarDays,
    CheckCircle,
    ExternalLink,
    FileText,
    Github,
    GraduationCap,
    Linkedin,
    Loader2,
    Mail,
    Mic2,
    Newspaper,
    Podcast,
    Send,
    Sparkles,
    Youtube,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

const serviceIcons = [BrainCircuit, Mic2] as const;

function isExternalHref(href: string) {
    return href.startsWith('http');
}

function linkProps(href: string) {
    return isExternalHref(href) ? { target: '_blank', rel: 'noreferrer' } : {};
}

function PavolBrandMark() {
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white ring-2 ring-cyan-200">
            PH
        </div>
    );
}

function ContactLinkIcon({ label }: { label: string }) {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('email') || lowerLabel.includes('e-mail')) return <Mail className="h-4 w-4" />;
    if (lowerLabel.includes('github')) return <Github className="h-4 w-4" />;
    if (lowerLabel.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
    if (lowerLabel.includes('calendar') || lowerLabel.includes('rezervace')) return <CalendarDays className="h-4 w-4" />;
    if (lowerLabel.includes('cv')) return <FileText className="h-4 w-4" />;

    return <ExternalLink className="h-4 w-4" />;
}

function PavolContactForm({ language }: { language: PavolLanguage }) {
    const content = pavolContent[language].contact;
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [topic, setTopic] = useState(content.topicOptions[0] ?? '');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!fullname.trim() || !emailIsValid || !message.trim()) {
            setError(content.requiredError);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const note = [
            `Personal page language: ${language}`,
            `Topic: ${topic}`,
            `Company / organization: ${company.trim() || '(not provided)'}`,
            '',
            message.trim(),
        ].join('\n');

        try {
            await subscribeToWaitlist({
                fullname,
                email,
                placeName: `PavolPersonalPage-${language}`,
                note,
            });

            setSuccess(true);
            setFullname('');
            setEmail('');
            setCompany('');
            setTopic(content.topicOptions[0] ?? '');
            setMessage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : content.genericError);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">{content.successTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{content.successDescription}</p>
                <Button
                    type="button"
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="mt-6 rounded-full"
                >
                    {content.formTitle}
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase text-cyan-700">{content.eyebrow}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">{content.formTitle}</h3>
            </div>

            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="pavol-fullname" className="text-sm font-semibold text-slate-700">
                            {content.nameLabel}
                        </label>
                        <Input
                            id="pavol-fullname"
                            value={fullname}
                            onChange={(event) => setFullname(event.target.value)}
                            placeholder={content.namePlaceholder}
                            autoComplete="name"
                            className="mt-2 h-11"
                        />
                    </div>
                    <div>
                        <label htmlFor="pavol-email" className="text-sm font-semibold text-slate-700">
                            {content.emailLabel}
                        </label>
                        <Input
                            id="pavol-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={content.emailPlaceholder}
                            autoComplete="email"
                            className="mt-2 h-11"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="pavol-company" className="text-sm font-semibold text-slate-700">
                            {content.companyLabel}
                        </label>
                        <Input
                            id="pavol-company"
                            value={company}
                            onChange={(event) => setCompany(event.target.value)}
                            placeholder={content.companyPlaceholder}
                            autoComplete="organization"
                            className="mt-2 h-11"
                        />
                    </div>
                    <div>
                        <label htmlFor="pavol-topic" className="text-sm font-semibold text-slate-700">
                            {content.topicLabel}
                        </label>
                        <select
                            id="pavol-topic"
                            value={topic}
                            onChange={(event) => setTopic(event.target.value)}
                            className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            {content.topicOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="pavol-message" className="text-sm font-semibold text-slate-700">
                        {content.messageLabel}
                    </label>
                    <Textarea
                        id="pavol-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={content.messagePlaceholder}
                        className="mt-2 min-h-[128px]"
                    />
                </div>

                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-slate-950 text-base font-semibold text-white hover:bg-slate-800"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {content.submitting}
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-5 w-5" />
                            {content.submit}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

function MediaIcon({ type }: { type: 'youtube' | 'podcast' | 'article' }) {
    if (type === 'youtube') return <Youtube className="h-5 w-5" />;
    if (type === 'podcast') return <Podcast className="h-5 w-5" />;
    return <Newspaper className="h-5 w-5" />;
}

export function PavolPage({ language }: { language: PavolLanguage }) {
    const content = pavolContent[language];
    const alternateLanguage = language === 'cs' ? 'en' : 'cs';
    const serviceCards: FeatureCard[] = content.services.items.map((item, index) => ({
        icon: serviceIcons[index],
        eyebrow: content.services.eyebrow,
        title: item.title,
        description: item.description,
        items: item.bullets,
        highlight: item.highlight,
    }));

    return (
        <main className="min-h-screen bg-white">
            <Header
                brandHref={`/pavol/${language}`}
                brandLogo={<PavolBrandMark />}
                brandName={<span className="text-xl font-semibold text-gray-900">Pavol Hejný</span>}
                centerContent={
                    <nav className="flex items-center gap-4">
                        {content.header.centerLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-slate-950">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                }
                primaryAction={{
                    label: content.header.contact,
                    href: '#contact',
                }}
                secondaryAction={{
                    label: content.header.languageSwitch,
                    href: `/pavol/${alternateLanguage}`,
                }}
            />

            <section
                className="relative flex min-h-[88svh] items-center overflow-hidden bg-slate-950 pt-24 text-white"
                style={{
                    backgroundImage: 'url(/backgrounds/ai-supervize.svg)',
                    backgroundPosition: '50% 100%',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container relative z-10 mx-auto px-4 py-16">
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
                        <motion.div
                            initial={{ opacity: 0, x: -44 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75 }}
                            className="min-w-0 space-y-8"
                        >
                            <div className="space-y-5">
                                <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                    <Sparkles className="h-4 w-4 text-amber-200" />
                                    {content.hero.eyebrow}
                                </div>

                                <div>
                                    <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                                        {content.hero.title}
                                    </h1>
                                    <p className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-cyan-200 sm:text-4xl">
                                        {content.hero.highlightedTitle}
                                    </p>
                                </div>

                                <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    {content.hero.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-cyan-400 px-8 py-6 text-center text-lg font-semibold text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-300 hover:shadow-lg"
                                >
                                    <Link href="#contact">
                                        {content.hero.primaryCta}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                                >
                                    <Link href={PAVOL_CV_URL} {...linkProps(PAVOL_CV_URL)}>
                                        {content.hero.secondaryCta}
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/75 sm:gap-4">
                                {content.hero.badges.map((badge) => (
                                    <div
                                        key={badge}
                                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
                                    >
                                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 44 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, delay: 0.15 }}
                            className="min-w-0"
                        >
                            <div className="relative mx-auto max-w-md lg:max-w-lg">
                                <div className="absolute inset-x-10 bottom-0 h-28 rounded-[100%] bg-black/30 blur-xl" />
                                <Image
                                    src={pavolHejny}
                                    alt="Pavol Hejný"
                                    priority
                                    className="relative z-10 h-auto w-full object-contain"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <FeatureCardsSection
                id="services"
                title={content.services.title}
                description={content.services.description}
                cards={serviceCards}
                columns={2}
                tone="white"
            />

            <div id="testimonials">
                <TestimonialsSection
                    language={language}
                    mode="custom"
                    eyebrow={content.testimonials.eyebrow}
                    title={content.testimonials.title}
                    description={content.testimonials.description}
                    testimonials={content.testimonials.items}
                    metrics={content.testimonials.metrics}
                />
            </div>

            <section id="projects" className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                            {content.projects.eyebrow}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {content.projects.title}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.projects.description}</p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {content.projects.items.map((project) => (
                            <article
                                key={project.title}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-44 bg-slate-950">
                                    <Image
                                        src={project.image}
                                        alt={project.imageAlt}
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className={
                                            project.title === 'Promptbook' ? 'object-contain p-10' : 'object-cover'
                                        }
                                    />
                                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                                        {project.badge}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-slate-950">{project.title}</h3>
                                    <p className="mt-3 min-h-[96px] text-sm leading-relaxed text-slate-600">
                                        {project.description}
                                    </p>
                                    <Button asChild variant="outline" className="mt-5 rounded-full">
                                        <Link href={project.href} {...linkProps(project.href)}>
                                            {content.projects.visit}
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="media" className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                            {content.media.eyebrow}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {content.media.title}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.media.description}</p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {content.media.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                {...linkProps(item.href)}
                                className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                                        <MediaIcon type={item.type} />
                                    </div>
                                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-cyan-600" />
                                </div>
                                <div className="mt-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {item.source}
                                    </p>
                                    <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950">{item.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <div className="lg:sticky lg:top-24">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                                {content.contact.eyebrow}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                {content.contact.title}
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.contact.description}</p>

                            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <h3 className="text-lg font-bold text-slate-950">{content.contact.contactsTitle}</h3>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    {content.contact.contacts.map((contact) => (
                                        <Link
                                            key={contact.href}
                                            href={contact.href}
                                            {...linkProps(contact.href)}
                                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-200 hover:text-cyan-700"
                                        >
                                            <ContactLinkIcon label={contact.label} />
                                            {contact.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
                                <GraduationCap className="mb-3 h-5 w-5" />
                                {content.projects.items[0]?.description}
                            </div>
                        </div>

                        <PavolContactForm language={language} />
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-slate-950 py-10 text-white">
                <div className="container mx-auto flex flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <PavolBrandMark />
                        <div>
                            <p className="font-semibold">Pavol Hejný</p>
                            <p className="text-sm text-slate-400">{content.footer.copyright}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        {content.footer.links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                {...linkProps(link.href)}
                                className="transition-colors hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </main>
    );
}
