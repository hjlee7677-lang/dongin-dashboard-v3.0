/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;

const defaultFolders = [
  { id: "folder-1", name: "업무관리" },
  { id: "folder-2", name: "교무행정" },
  { id: "folder-3", name: "담임업무" },
  { id: "folder-4", name: "일정관리" },
  { id: "folder-5", name: "수업자료" }
];

const defaultProjects = [
  {
    id: "proj-1",
    name: "출석부 관리",
    url: "https://neis.go.kr",
    responsible: "김철수 선생님",
    folder_id: "folder-3",
    description: "학생 출석 현황을 기록하고 관리하는 시스템",
    created_at: "2026. 6. 2."
  },
  {
    id: "proj-2",
    name: "성적 처리 시스템",
    url: "https://neis.go.kr",
    responsible: "이영희 선생님",
    folder_id: "folder-3",
    description: "학기별 성적 입력 및 통계 분석 도구",
    created_at: "2026. 6. 2."
  },
  {
    id: "proj-3",
    name: "연간 업무 일정",
    url: "https://calendar.google.com",
    responsible: "박민준 선생님",
    folder_id: "folder-4",
    description: "교사 업무 일정 및 학사 일정 통합 관리",
    created_at: "2026. 6. 2."
  },
  {
    id: "proj-4",
    name: "공문서 발송 관리",
    url: "https://edupine.go.kr",
    responsible: "최수진 선생님",
    folder_id: "folder-2",
    description: "교내 공문서 작성 및 발송 이력 관리",
    created_at: "2026. 6. 2."
  },
  {
    id: "proj-5",
    name: "수업지도안 공유",
    url: "https://drive.google.com",
    responsible: "정다은 선생님",
    folder_id: "folder-5",
    description: "각 교과별 수업 지도안 공유 및 저장소",
    created_at: "2026. 6. 2."
  }
];

class DbManager {
  private useSupabase = false;
  private supabaseClient: any = null;
  private localFilePath = path.join(process.cwd(), "data.json");

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key && url !== "MY_SUPABASE_URL" && key !== "MY_SUPABASE_ANON_KEY" && url.trim() !== "" && key.trim() !== "") {
      try {
        this.supabaseClient = createClient(url, key);
        this.useSupabase = true;
        console.log("Supabase client initialized successfully with URL:", url);
      } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
        this.useSupabase = false;
      }
    } else {
      console.log("Supabase credentials not set or placeholder. Operating in Local DB Mode.");
    }
    this.ensureLocalFile();
  }

  public getStatus() {
    return {
      useSupabase: this.useSupabase,
      supabaseUrl: this.useSupabase ? process.env.SUPABASE_URL : null
    };
  }

  private ensureLocalFile() {
    if (!fs.existsSync(this.localFilePath)) {
      const initialData = {
        folders: defaultFolders,
        projects: defaultProjects
      };
      fs.writeFileSync(this.localFilePath, JSON.stringify(initialData, null, 2), "utf-8");
    }
  }

  private getLocalData() {
    this.ensureLocalFile();
    try {
      const content = fs.readFileSync(this.localFilePath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading local data file:", e);
      return { folders: defaultFolders, projects: defaultProjects };
    }
  }

  private saveLocalData(data: { folders: any[]; projects: any[] }) {
    try {
      fs.writeFileSync(this.localFilePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing local data file:", e);
    }
  }

  async getFolders() {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("folders").select("*").order("name");
        if (error) throw error;
        // Seed database if empty
        if (!data || data.length === 0) {
          const { data: inserted, error: insertError } = await this.supabaseClient.from("folders").insert(defaultFolders).select();
          if (insertError) throw insertError;
          return inserted;
        }
        return data;
      } catch (e: any) {
        console.warn("Supabase getFolders failed, falling back to local file:", e.message || e);
      }
    }
    return this.getLocalData().folders;
  }

  async addFolder(folder: { id: string; name: string }) {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("folders").insert([folder]).select();
        if (error) throw error;
        return data[0] || folder;
      } catch (e: any) {
        console.warn("Supabase addFolder failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    local.folders.push(folder);
    this.saveLocalData(local);
    return folder;
  }

  async updateFolder(id: string, name: string) {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("folders").update({ name }).eq("id", id).select();
        if (error) throw error;
        return data[0];
      } catch (e: any) {
        console.warn("Supabase updateFolder failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    const folder = local.folders.find((f: any) => f.id === id);
    if (folder) {
      folder.name = name;
      this.saveLocalData(local);
    }
    return folder;
  }

  async deleteFolder(id: string) {
    if (this.useSupabase) {
      try {
        // Safe cascading in server code or DB rules
        await this.supabaseClient.from("projects").update({ folder_id: "" }).eq("folder_id", id);
        const { error } = await this.supabaseClient.from("folders").delete().eq("id", id);
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        console.warn("Supabase deleteFolder failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    local.folders = local.folders.filter((f: any) => f.id !== id);
    local.projects = local.projects.map((p: any) => p.folder_id === id ? { ...p, folder_id: "" } : p);
    this.saveLocalData(local);
    return { success: true };
  }

  async getProjects() {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("projects").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) {
          const { data: inserted, error: insertError } = await this.supabaseClient.from("projects").insert(defaultProjects).select();
          if (insertError) throw insertError;
          return inserted;
        }
        return data;
      } catch (e: any) {
        console.warn("Supabase getProjects failed, falling back to local file:", e.message || e);
      }
    }
    return this.getLocalData().projects;
  }

  async addProject(project: any) {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("projects").insert([project]).select();
        if (error) throw error;
        return data[0] || project;
      } catch (e: any) {
        console.warn("Supabase addProject failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    local.projects.push(project);
    this.saveLocalData(local);
    return project;
  }

  async updateProject(id: string, projectUpdates: any) {
    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabaseClient.from("projects").update(projectUpdates).eq("id", id).select();
        if (error) throw error;
        return data[0];
      } catch (e: any) {
        console.warn("Supabase updateProject failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    const index = local.projects.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      local.projects[index] = { ...local.projects[index], ...projectUpdates };
      this.saveLocalData(local);
      return local.projects[index];
    }
    return null;
  }

  async deleteProject(id: string) {
    if (this.useSupabase) {
      try {
        const { error } = await this.supabaseClient.from("projects").delete().eq("id", id);
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        console.warn("Supabase deleteProject failed, falling back to local file:", e.message || e);
      }
    }
    const local = this.getLocalData();
    local.projects = local.projects.filter((p: any) => p.id !== id);
    this.saveLocalData(local);
    return { success: true };
  }
}

const app = express();
app.use(express.json());

const db = new DbManager();

// API Routes
app.get("/api/status", (req, res) => {
  res.json(db.getStatus());
});

app.get("/api/folders", async (req, res) => {
  try {
    const folders = await db.getFolders();
    res.json(folders);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/folders", async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Missing folder parameters" });
    }
    const newFolder = await db.addFolder({ id, name });
    res.status(201).json(newFolder);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Missing name parameter" });
    }
    const updated = await db.updateFolder(id, name);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.deleteFolder(id);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const project = req.body;
    if (!project.id || !project.name || !project.url || !project.responsible) {
      return res.status(400).json({ error: "Missing mandatory project parameters" });
    }
    const newProject = await db.addProject(project);
    res.status(201).json(newProject);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateProject(id, updates);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.deleteProject(id);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Setup function for dev vs production
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening in non-Vercel environments
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Dongin High School Work Automation Dashboard listening on http://localhost:${PORT}`);
    });
  }
}

setupApp();

export default app;
