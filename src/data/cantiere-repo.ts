// Re-export everything from the Supabase-backed repo.
// Components import from here so we don't need to update every import path.
export {
  saveCantiere,
  deleteCantiere,
  seedCantieriDemo,
  saveOperaio,
  deleteOperaio,
  getOperaiByIds as getOperai,
} from './supabase-cantiere-repo';
