/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Folder, Project } from "./types";
import FolderSidebar from "./components/FolderSidebar";
import DashboardStats from "./components/DashboardStats";
import ProjectCard from "./components/ProjectCard";
import ProjectForm from "./components/ProjectForm";
import SupabaseGuide from "./components/SupabaseGuide";
import { Plus, Database, Sparkles, HelpCircle, Layers, CheckCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [status, setStatus] = useState<{ useSupabase: boolean; supabaseUrl: string | null }>({
    useSupabase: false,
    supabaseUrl: null,
  });
  
  // Navigation: "dashboard" or "form"
  const [view, setView] = useState<"dashboard" | "form">("dashboard");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // UI states
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch DB Status
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }

      // 2. Fetch Folders
      const foldersRes = await fetch("/api/folders");
      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }

      // 3. Fetch Projects
      const projectsRes = await fetch("/api/projects");
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }
    } catch (e: any) {
      console.error("Error fetching data from API:", e);
      setErrorMessage("서버와 통신하는 중 요류가 발생했습니다. 로컬 데이터를 불러옵니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Folder actions
  const handleAddFolder = async (name: string) => {
    const id = `folder-${Date.now()}`;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (res.ok) {
        const newFolder = await res.json();
        setFolders((prev) => [...prev, newFolder]);
      }
    } catch (e) {
      console.error("Failed to add folder:", e);
    }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
      }
    } catch (e) {
      console.error("Failed to rename folder:", e);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        // Reset selected folder if deleted
        if (selectedFolderId === id) {
          setSelectedFolderId("");
        }
        // Update local projects folder_id locally
        setProjects((prev) =>
          prev.map((p) => (p.folder_id === id ? { ...p, folder_id: "" } : p))
        );
      }
    } catch (e) {
      console.error("Failed to delete folder:", e);
    }
  };

  // Project actions
  const handleSaveProject = async (projectData: Omit<Project, "id" | "created_at"> & { id?: string }) => {
    const formattedDate = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).replace(/\s/g, ""); // "2026.7.8." format
    
    // Convert e.g., "2026.7.8." to "2026. 7. 8." with spaces for neat look
    const cleanDate = formattedDate.split(".").filter(Boolean).join(". ") + ".";

    setIsSaving(true);

    if (projectData.id) {
      // Edit mode
      try {
        const res = await fetch(`/api/projects/${projectData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectData.name,
            url: projectData.url,
            responsible: projectData.responsible,
            folder_id: projectData.folder_id,
            description: projectData.description,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setProjects((prev) => prev.map((p) => (p.id === projectData.id ? updated : p)));
          setView("dashboard");
          setEditingProject(null);
        } else {
          const errData = await res.json();
          alert(`프로젝트 수정에 실패했습니다: ${errData.error || "알 수 없는 오류"}`);
        }
      } catch (e) {
        console.error("Failed to update project:", e);
        alert("서버 통신 실패로 프로젝트 수정에 실패했습니다.");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Add mode
      const newId = `proj-${Date.now()}`;
      const newProj: Project = {
        id: newId,
        name: projectData.name,
        url: projectData.url,
        responsible: projectData.responsible,
        folder_id: projectData.folder_id || "",
        description: projectData.description || "",
        created_at: cleanDate,
      };

      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProj),
        });
        if (res.ok) {
          const savedProj = await res.json();
          setProjects((prev) => [savedProj, ...prev]);
          setView("dashboard");
        } else {
          const errData = await res.json();
          alert(`프로젝트 등록에 실패했습니다: ${errData.error || "알 수 없는 오류"}`);
        }
      } catch (e) {
        console.error("Failed to add project:", e);
        alert("서버 통신 실패로 프로젝트 등록에 실패했습니다.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  };

  const handleEditTrigger = (project: Project) => {
    setEditingProject(project);
    setView("form");
  };

  const handleCreateTrigger = () => {
    setEditingProject(null);
    setView("form");
  };

  // Calculations for sidebar badge counts
  const projectCounts: Record<string, number> = {
    all: projects.length,
  };
  projects.forEach((proj) => {
    if (proj.folder_id) {
      projectCounts[proj.folder_id] = (projectCounts[proj.folder_id] || 0) + 1;
    }
  });

  // Filtering projects for main view
  const filteredProjects = selectedFolderId
    ? projects.filter((p) => p.folder_id === selectedFolderId)
    : projects;

  // Selected folder object
  const selectedFolderObj = folders.find((f) => f.id === selectedFolderId);
  const currentCategoryName = selectedFolderObj ? selectedFolderObj.name : "모든 프로젝트";

  // Calculate Stats
  // Let's count recently added as projects added "today" or in the last 7 days.
  // Since we use formatted strings, let's treat anything created in 2026 as recent, 
  // or simply count projects added during this specific browser session / recently added array of 2.
  const recentAddedCount = projects.slice(0, 3).length; // Show latest 3 projects count as recent

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="app-root">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4" id="main-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              {/* Customized SVG logo representing Dongin and work automation */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight font-sans">동인고 업무 대시보드</h1>
              <p className="text-[10px] text-slate-400 font-medium font-sans">DONGIN HIGH SCHOOL WORK AUTOMATION</p>
            </div>
          </div>

          {/* Database Status and Guide Toggles */}
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            {status.useSupabase ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase 연동 완료</span>
              </div>
            ) : (
              <div 
                onClick={() => setShowGuide(!showGuide)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-full text-xs font-semibold text-amber-700 cursor-pointer transition-all"
                title="데이터베이스 연동 가이드 보기"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>로컬 DB 모드 (Supabase 연동 가능)</span>
              </div>
            )}

            {/* Help Button */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                showGuide 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              title="데이터베이스 가이드"
              id="btn-toggle-guide"
            >
              <HelpCircle size={18} />
            </button>

            {/* Add New Project Button */}
            {view === "dashboard" && (
              <button
                onClick={handleCreateTrigger}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                id="btn-header-add-project"
              >
                <Plus size={16} />
                <span>새 프로젝트</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto" id="main-layout-container">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-sans text-sm">대시보드를 구성하는 중입니다...</p>
          </div>
        ) : view === "dashboard" ? (
          <>
            {/* Folder Sidebar */}
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onAddFolder={handleAddFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              projectCounts={projectCounts}
            />

            {/* Dashboard Content Panel */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto" id="dashboard-main-panel">
              {/* Supabase connection guide block */}
              {showGuide && <SupabaseGuide />}

              {/* Stats overview */}
              <DashboardStats
                totalProjects={projects.length}
                totalFolders={folders.length}
                recentAddedCount={recentAddedCount}
              />

              {/* Selected Folder Projects Grid Section */}
              <div className="mb-10" id="selected-folder-section">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">
                      {currentCategoryName}
                    </h2>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {filteredProjects.length}
                    </span>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl py-12 px-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers size={20} />
                    </div>
                    <h5 className="font-semibold text-slate-700 mb-1">등록된 프로젝트가 없습니다</h5>
                    <p className="text-slate-400 text-sm mb-5">이 분류 폴더에 새로운 업무 자동화 툴을 등록해보세요.</p>
                    <button
                      onClick={handleCreateTrigger}
                      className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>첫 프로젝트 등록하기</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5" id="projects-grid">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        folders={folders}
                        onEdit={handleEditTrigger}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Added Items Section (최근 추가된 항목) */}
              <div className="border-t border-slate-100 pt-8" id="recently-added-section">
                <div className="flex items-center gap-2 mb-6 text-slate-700">
                  <span className="p-1 bg-slate-100 text-slate-600 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <h3 className="text-base font-bold text-slate-800 font-sans tracking-tight">최근 추가된 항목</h3>
                </div>

                {projects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">추가된 항목이 없습니다.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5" id="recent-projects-grid">
                    {projects.slice(0, 4).map((project) => (
                      <ProjectCard
                        key={`recent-${project.id}`}
                        project={project}
                        folders={folders}
                        onEdit={handleEditTrigger}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </>
        ) : (
          <div className="flex-1 p-6 md:p-8" id="form-view-container">
            <ProjectForm
              folders={folders}
              editingProject={editingProject}
              onSave={handleSaveProject}
              isSaving={isSaving}
              onCancel={() => {
                setView("dashboard");
                setEditingProject(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6 mt-12" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-sans">
          <p>© 2026 동인고등학교. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>담당자: 교사 이효정 (hjlee7677@dongin.hs.kr)</span>
            <span>|</span>
            <span className="text-slate-500 font-medium">업무 자동화 대시보드 v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
