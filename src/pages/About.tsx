/**
 * @file About.tsx
 * @brief About page: background narrative, education and focus.
 */

import { Link } from 'react-router-dom';
import { site } from '../content/site';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render the about page.
 * @returns The page content, rendered inside the shared layout.
 */
export default function About() {
  useMeta('About', 'Background in electronics and communication engineering and embedded systems, with professional work across firmware and electronics hardware.');
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>About</h1>
      </header>
      <div className="about">
        <div className="prose prose-long">
          <p className="lede">
            I’m an embedded systems engineer in Kitchener, Ontario. My work sits where firmware meets the board it runs
            on, and where that board meets the network.
          </p>
          <p>
            I studied Electronics and Communication Engineering in Ahmedabad, at a college under Gujarat Technological
            University, and started in IoT as an intern at Silver Touch Techlab. At MOBA Mobile Automation I wrote
            bare-metal firmware for fuel pumps, machine control systems and displays, delivering nine projects that
            included firmware-over-the-air updates.
          </p>
          <p>
            In 2023 I started the postgraduate program in Embedded Systems Development at Conestoga College in Ontario,
            while freelancing on Upwork. I joined CareHawk Life Safety Communications as an R&amp;D intern, and since
            May 2024 I’ve been their Electronics Hardware Developer. That title undersells the job a little: I do the
            schematics, multilayer PCB layout and validation, and I also write the BLE firmware for our badge devices,
            including Bluetooth Channel Sounding and deep sleep.
          </p>
          <p>
            On the projects on this site I’ve worked alone on the device side, firmware and unit tests, while server and cloud
            software was built by others. That means I’m used to owning everything up to the network boundary and agreeing
            a clear protocol at it.
          </p>
          <h2>Where I’m heading</h2>
          <p>
            I want to grow into a senior embedded role with ownership of a product subsystem. My main focus is Zephyr RTOS
            and Bluetooth Low Energy, supported by hardware design, RF integration, verification and product certification.
            The <Link to="/expertise">expertise page</Link> shows what’s established and what I’m still building.
          </p>
        </div>
        <aside className="about-side">
          <h2>Education</h2>
          <ul className="edu">
            {site.education.map((e) => (
              <li key={e.credential}>
                <strong>{e.credential}</strong>
                <span>{e.institution}, {e.place}</span>
                {e.period && <span>{e.period}</span>}
              </li>
            ))}
          </ul>
          <h2>Focus</h2>
          <p>Zephyr and BLE product firmware, with hardware design, RF integration and verification alongside.</p>
        </aside>
      </div>
    </div>
  );
}
