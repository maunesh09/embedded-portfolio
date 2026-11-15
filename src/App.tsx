/**
 * @file App.tsx
 * @brief Route table for the whole site.
 */

import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { showDrafts } from './lib/env';
import About from './pages/About';
import Article from './pages/Article';
import Contact from './pages/Contact';
import Expertise from './pages/Expertise';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Notebook from './pages/Notebook';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Template from './pages/Template';

/**
 * @brief Root component: maps URL paths to page components inside the shared layout.
 * @details The article template route exists only when drafts are shown (dev and draft previews).
 * @returns The route tree.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="expertise" element={<Expertise />} />
        <Route path="notebook" element={<Notebook />} />
        {showDrafts && <Route path="notebook/template" element={<Template />} />}
        <Route path="notebook/:slug" element={<Article />} />
        <Route path="about" element={<About />} />
        <Route path="resume" element={<Resume />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
