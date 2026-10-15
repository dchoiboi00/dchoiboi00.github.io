// One record per project. The home page, the Projects page, and each case
// study read from here, so a date or result is written once.
import { formatLength, formatPeriod } from '../lib/project-dates.ts';

export interface Project {
  /** Matches a Markdown file in src/content/writing. */
  slug: string;
  name: string;
  summary: string;
  /** The impact line on the cards and rows, and the Result fact on the case study. */
  result: string;
  builtWith: string[];
  /** 'YYYY-MM-DD', from the first substantial PR to the last one merged. */
  start: string;
  end: string;
  diagram: string;
  /** Must match the `width` and `height` on the SVG's own root tag. */
  diagramWidth: number;
  diagramHeight: number;
  diagramAlt: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: 'csv-schema-mapper-at-catalogit',
    name: 'CSV auto-mapper',
    summary:
      "An LLM pipeline that maps the columns of a customer's spreadsheet to CatalogIt's fields, so museums can import decades of records without a setup call. The model writes a short profile of each column, and embedding search and past imports do the matching.",
    result: 'Cut the import backlog from 16 weeks to 4, with over 85% of suggestions accepted',
    builtWith: ['TypeScript', 'LLMs', 'embeddings', 'Redis'],
    start: '2025-10-08',
    end: '2026-02-05',
    diagram: '/work/csv-mapper-diagram.svg',
    diagramWidth: 960,
    diagramHeight: 600,
    diagramAlt: 'Spreadsheet columns on the left, each connected to the CatalogIt field it maps to on the right',
    featured: true,
  },
  {
    slug: 'zero-downtime-billing-migration-at-catalogit',
    name: 'Billing migration',
    summary:
      'Moved every account from per-user to per-account Stripe billing, with webhooks upgraded in phases and a staged rollout.',
    result: '$800K ARR across 3,000 paying accounts, zero downtime',
    builtWith: ['TypeScript', 'Stripe'],
    start: '2026-04-14',
    end: '2026-06-05',
    diagram: '/work/billing-migration-diagram.svg',
    diagramWidth: 960,
    diagramHeight: 640,
    diagramAlt: 'The migration in order: run both webhook endpoints, cut over, backfill 1,535 accounts, roll out in stages',
    featured: false,
  },
  {
    slug: 'account-capacity-enforcement-at-catalogit',
    name: 'Plan limit enforcement',
    summary:
      'A 15-day countdown for 600 over-limit accounts, ending in a read-only freeze that lifts the moment they pay.',
    result: '+15% MRR in the first month',
    builtWith: ['TypeScript', 'scheduled jobs'],
    start: '2026-09-08',
    end: '2026-09-21',
    diagram: '/work/capacity-enforcement-diagram.svg',
    diagramWidth: 960,
    diagramHeight: 610,
    diagramAlt: 'A daily scan feeds a 15-day countdown of in-app notices and emails, then a freeze on day 15 that lifts on payment',
    featured: false,
  },
  {
    slug: 'adjust-plan-wizard-xstate-at-catalogit',
    name: 'Adjust Plan wizard',
    summary:
      'The plan-change checkout, rebuilt as one XState state machine with four steps and three async calls.',
    result: 'Every plan change charges exactly what the preview showed',
    builtWith: ['TypeScript', 'React', 'XState', 'Stripe'],
    start: '2026-06-26',
    end: '2026-07-08',
    diagram: '/work/xstate-wizard-diagram.svg',
    diagramWidth: 960,
    diagramHeight: 600,
    diagramAlt: 'Statechart of the wizard: adjust, preview, payment, committing, success, with a shortcut that skips payment',
    featured: false,
  },
];

/** "Apr – Jun 2026, 2 months" */
export const projectWhen = (project: Project) =>
  `${formatPeriod(project.start, project.end)}, ${formatLength(project.start, project.end).replace(' ', '\u00a0')}`;

export const newestFirst = (a: Project, b: Project) => b.end.localeCompare(a.end);

export function findProject(slug: string): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`No project in src/data/projects.ts for case study "${slug}"`);
  return project;
}
