/**
 * @file Contact.tsx
 * @brief Contact details list used on the Contact page.
 */

import { site } from '../content/site';
import { Missing } from './Status';

/**
 * @brief Render email, GitHub, LinkedIn, Upwork and location.
 * @details Any link that is null in site.ts shows a visible "Add …" placeholder instead
 * of a broken link; Upwork is omitted entirely when unset.
 * @returns A definition list of contact routes.
 */
export function ContactList() {
  const { email, github, linkedin, upwork } = site.contact;
  return (
    <dl className="contact">
      <div>
        <dt>Email</dt>
        <dd>{email ? <a href={`mailto:${email}`}>{email}</a> : <Missing what="email in site.ts" />}</dd>
      </div>
      <div>
        <dt>GitHub</dt>
        <dd>{github ? <a href={github} rel="me noopener">{github.replace(/^https?:\/\/(www\.)?/, '')}</a> : <Missing what="GitHub URL in site.ts" />}</dd>
      </div>
      <div>
        <dt>LinkedIn</dt>
        <dd>{linkedin ? <a href={linkedin} rel="me noopener">{linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a> : <Missing what="LinkedIn URL in site.ts" />}</dd>
      </div>
      {upwork && (
        <div>
          <dt>Upwork</dt>
          <dd><a href={upwork} rel="me noopener">Hire me on Upwork</a></dd>
        </div>
      )}
      <div>
        <dt>Location</dt>
        <dd>{site.location}</dd>
      </div>
    </dl>
  );
}
