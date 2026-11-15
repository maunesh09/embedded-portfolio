/**
 * @file Home.tsx
 * @brief Home page: oscilloscope hero, instrument bench, PCB explorer, projects and notebook.
 */

import { Link } from 'react-router-dom';
import { ArticleList } from '../components/ArticleList';
import { LogicAnalyzer } from '../components/LogicAnalyzer';
import { Multimeter } from '../components/Multimeter';
import { Oscilloscope } from '../components/Oscilloscope';
import { PcbExplorer } from '../components/PcbExplorer';
import { ProjectList } from '../components/ProjectList';
import { articles } from '../content/articles';
import { projects } from '../content/projects';
import { site } from '../content/site';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render the home page.
 * @returns The page content, rendered inside the shared layout.
 */
export default function Home() {
  useMeta(null, `${site.headline} ${site.intro}`);
  const featured = projects.filter((p) => p.featured);
  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <div className="wrap">
          <Oscilloscope>
            <p className="hero-name">{site.fullName ?? site.name}, embedded systems engineer</p>
            <h1 id="hero-h">Firmware, BLE and the boards they run on.</h1>
            <p className="lede">
              I own the device side of connected products: firmware architecture, wireless links, circuit design, and the
              unit tests that prove it works. Growing toward senior ownership of Zephyr and BLE products.
            </p>
            <div className="actions">
              <Link to="/projects" className="btn btn-primary">Explore projects</Link>
              <Link to="/resume" className="btn">View resume</Link>
              <Link to="/contact" className="btn btn-quiet">Get in touch</Link>
            </div>
          </Oscilloscope>
        </div>
      </section>

      <section className="band" aria-labelledby="bench-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="bench-h">On the bench</h2>
          </div>
          <p className="section-lede">Turn the meter’s dial for the short version. The analyzer decodes my name in three protocols.</p>
          <div className="bench">
            <Multimeter />
            <LogicAnalyzer text={site.name} />
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="pcb-h">
        <div className="wrap">
          <h2 id="pcb-h">Where I work on a board</h2>
          <p className="section-lede">Every product I’ve built crosses these parts of the board. Select a component to see what I do there.</p>
          <PcbExplorer />
        </div>
      </section>

      <section className="band" aria-labelledby="proj-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="proj-h">Channels</h2>
            <Link to="/projects">All projects and repositories</Link>
          </div>
          <p className="section-lede">Selected projects. The trace shows the state: square for implemented, burst for in progress, dashed for concept.</p>
          <ProjectList projects={featured} />
        </div>
      </section>

      <section className="band" aria-labelledby="nb-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="nb-h">Engineering notebook</h2>
            <Link to="/notebook">All notes</Link>
          </div>
          <p className="section-lede">Write-ups I’m working on, drawn from the projects above.</p>
          <ArticleList articles={articles.slice(0, 3)} />
        </div>
      </section>

      <section className="band band-close">
        <div className="wrap">
          <div className="close-inner">
            <p className="close-kicker"><span className="trig" aria-hidden="true" />Trigger armed</p>
            <h2>Hiring for embedded firmware or hardware? Send a signal.</h2>
            <div className="actions">
              <Link to="/contact" className="btn btn-primary">Contact me</Link>
              <Link to="/about" className="btn">Read my background</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
