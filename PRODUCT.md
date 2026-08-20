# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Spanish-speaking adults evaluating online psychotherapy for general emotional wellbeing — not limited to anxiety or trauma specifically. They may be dealing with anxiety, stress, past trauma, low self-esteem, emotional regulation, relationship difficulties, or simply want personal growth and to feel more grounded. They land on the site to decide whether to book Angie's first session (35€) or reach out with questions first.

## Product Purpose

Hogar Terapéutico is the personal practice site for Angie Sánchez, a licensed psychologist (Colegiada M-42569, Madrid) offering online therapy. The site informs, builds trust, and converts visitors into booked sessions via an embedded calendar, a contact form, and WhatsApp. Success is a visitor deciding the fit feels right and booking or messaging.

## Positioning

An integrative, personalized approach — no one-size-fits-all method. Angie combines multiple evidence-based tools (including EMDR for trauma/attachment work) tailored to each person, delivered with warm, human, safe presence. This is the site's core differentiator over a generic listing on a directory like Doctoralia: the "hogar interior" (inner home) framing — therapy as building a safe internal place to return to, not just symptom management.

## Operating Context

- Fully online, one therapist (Angie), video/remote sessions only today; in-person sessions in Madrid are announced as "coming soon."
- Booking flow: visitor picks a date/time on an embedded calendar → confirms via WhatsApp → receives instructions.
- Alternate contact paths: contact form (Formspree-backed) and direct WhatsApp link.
- Business hours stated: Mon–Fri, 9:00–20:00.
- Site is a single long-scroll landing page (hero → offer → about → commitment → areas of intervention → pricing → testimonials → FAQ → booking calendar → contact) plus a blog (SEO/educational articles on anxiety, EMDR, therapy cost, online vs. in-person, etc.) and standard legal pages (privacy policy, cookie policy, legal notice).
- Built with Eleventy (11ty) + Tailwind CSS + TypeScript, static site deployed via Netlify.

## Capabilities and Constraints

- Areas of intervention: trauma/attachment/EMDR, anxiety and stress, self-esteem and confidence, emotional management, personal relationships. In-person sessions are explicitly "próximamente" (not yet available) — must not be presented as currently offered.
- Solo practice: Angie is the only practitioner. Content and design must not imply a multi-therapist clinic or team.
- Pricing (as currently published, treat as real and subject to change only by the user): first session 35€ (50 min), follow-up individual online session 50€ (50 min).
- Session availability is genuinely weekday mornings (roughly 10:00–13:00). There is no afternoon/evening availability. The slots published in `public/api/horarios.json` are real, not a data bug — do not "fix" them or invent evening slots in mockups or designs. The "Lu-Vi: 9:00–20:00" in the contact block is the *contact/response* window, not session availability; label it as such so visitors do not read it as bookable hours.
- Testimonials/reviews must stay sourced from the verified Doctoralia profile (currently 5.0 average, 23 reviews) — never fabricated, invented, or paraphrased into new claims.
- Legal/compliance surface exists (privacy policy, cookie policy, aviso legal) and must stay consistent with real data-handling practice (Formspree form, cookie consent banner).

## Brand Commitments

- Name: Hogar Terapéutico. Founder/practitioner: Angie Sánchez (Sánchez Gallego). License number M-42569 must remain visible as a trust signal.
- Contact identity: info@hogarterapeutico.com, +34 621 348 616, WhatsApp same number.
- Voice: warm, human, calm, safe, non-clinical-sounding despite clinical credentials — avoid cold/corporate tone.

## Evidence on Hand

- Real testimonials sourced live from Doctoralia (linked to https://www.doctoralia.es/angie-sanchez-gallego/psicologo/madrid#profile-reviews); do not add invented quotes beyond what's sourced there.
- Real pricing as published on the current site (see Capabilities and Constraints).
- No case studies, press mentions, or additional credentials beyond what's already in the "Mi Formación" (academic + continuing education) section of the site — do not fabricate additional credentials, awards, or press.

## Product Principles

1. Warmth and safety over clinical distance — every surface should feel like a calm, trustworthy space, not a medical intake form.
2. Personalization over generic self-help — reflect the integrative, tailored-to-you positioning rather than one-size-fits-all messaging.
3. Low-friction path to booking — the first 35€ session is the primary conversion goal; reduce friction between arriving and booking/messaging.
4. Credibility through real, verifiable signals (license number, sourced reviews, actual credentials) — never through invented proof.
5. Solo-practitioner honesty — design and copy should read as one dedicated person, not a scaled clinic.

## Accessibility & Inclusion

No explicit standard was established beyond general web accessibility good practice already present in the code (ARIA labels, semantic sections, required-field markup on the contact form).
