// Prints the engine facts (distance, drive time, fares per class) for one route or all: node tools/route-facts.mjs [slug]
import { ROUTES, facts } from './seo/routes.mjs';
const slug = process.argv[2];
const list = slug ? ROUTES.filter(r => r.slug === slug) : ROUTES;
console.log(JSON.stringify(list.map(r => ({ ...facts(r), name: r.name, notes: r.notes, languages: r.langs })), null, 1));
