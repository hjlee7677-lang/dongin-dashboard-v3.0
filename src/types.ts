/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Folder {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  responsible: string;
  folder_id: string; // empty string or 'root' means no folder/top-level
  description: string;
  created_at: string; // format: "YYYY. M. D." or ISO
}

export interface DashboardStats {
  totalProjects: number;
  totalFolders: number;
  recentAddedCount: number;
}
