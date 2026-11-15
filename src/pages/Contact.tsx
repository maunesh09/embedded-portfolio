/**
 * @file Contact.tsx
 * @brief Contact page.
 */

import { ContactList } from '../components/Contact';
import { site } from '../content/site';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render contact routes; mentions freelance work when an Upwork URL is set.
 * @returns The page content, rendered inside the shared layout.
 */
export default function Contact() {
  useMeta('Contact', `Contact ${site.name} about embedded firmware and hardware roles.`);
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Contact</h1>
        <p className="lede">
          The fastest way to reach me is email. I’m interested in embedded firmware, BLE and hardware/firmware roles at
          product companies.
          {site.contact.upwork && ' I also take on freelance embedded work through Upwork.'}
        </p>
      </header>
      <ContactList />
    </div>
  );
}
