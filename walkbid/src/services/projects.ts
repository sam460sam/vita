import { db, now, uid } from '@/data/db';
import type { ID, Project, ProjectStatus, Geo } from '@/data/types';

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy('createdAt').reverse().toArray();
}

export async function getProject(id: ID): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function projectsForClient(clientId: ID): Promise<Project[]> {
  return db.projects.where('clientId').equals(clientId).reverse().sortBy('createdAt');
}

export async function createProject(
  data: Pick<Project, 'clientId' | 'title' | 'siteAddress'> & Partial<Project>,
): Promise<Project> {
  const project: Project = {
    id: uid('prj_'),
    clientId: data.clientId,
    title: data.title.trim(),
    siteAddress: data.siteAddress.trim(),
    geo: data.geo,
    status: data.status ?? 'lead',
    createdAt: now(),
  };
  await db.projects.put(project);
  return project;
}

export async function updateProject(id: ID, patch: Partial<Project>): Promise<void> {
  const p = await db.projects.get(id);
  if (!p) return;
  await db.projects.put({ ...p, ...patch });
}

export async function setProjectStatus(id: ID, status: ProjectStatus): Promise<void> {
  await updateProject(id, { status });
}

export async function setProjectGeo(id: ID, geo: Geo): Promise<void> {
  await updateProject(id, { geo });
}

/** Cascade delete a job and everything attached to it. */
export async function deleteProject(id: ID): Promise<void> {
  await db.transaction(
    'rw',
    [db.projects, db.estimates, db.estimateItems, db.contracts, db.changeOrders, db.coItems, db.photos, db.diaryEntries, db.payments],
    async () => {
      const estimates = await db.estimates.where('projectId').equals(id).primaryKeys();
      for (const eid of estimates) await db.estimateItems.where('estimateId').equals(eid).delete();
      const cos = await db.changeOrders.where('projectId').equals(id).primaryKeys();
      for (const cid of cos) await db.coItems.where('changeOrderId').equals(cid).delete();
      await db.estimates.where('projectId').equals(id).delete();
      await db.contracts.where('projectId').equals(id).delete();
      await db.changeOrders.where('projectId').equals(id).delete();
      await db.photos.where('projectId').equals(id).delete();
      await db.diaryEntries.where('projectId').equals(id).delete();
      await db.payments.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    },
  );
}
