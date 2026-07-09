/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Project, Folder } from "../types";
import { ArrowLeft } from "lucide-react";

interface ProjectFormProps {
  folders: Folder[];
  editingProject: Project | null;
  onSave: (projectData: Omit<Project, "id" | "created_at"> & { id?: string }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function ProjectForm({
  folders,
  editingProject,
  onSave,
  onCancel,
  isSaving = false,
}: ProjectFormProps) {
  const isEditMode = !!editingProject;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [responsible, setResponsible] = useState("");
  const [folderId, setFolderId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setUrl(editingProject.url);
      setResponsible(editingProject.responsible);
      setFolderId(editingProject.folder_id || "");
      setDescription(editingProject.description || "");
    } else {
      setName("");
      setUrl("");
      setResponsible("");
      setFolderId("");
      setDescription("");
    }
    setErrors({});
  }, [editingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "프로젝트 이름을 입력해주세요.";
    if (!url.trim()) {
      newErrors.url = "연결 URL을 입력해주세요.";
    } else {
      // Basic check: we can format the URL nicely or warn.
      // If it doesn't start with http/https, let's auto-format or check.
    }
    if (!responsible.trim()) newErrors.responsible = "담당자 / 등록자를 입력해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Auto prepend https:// if missing
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    onSave({
      id: editingProject?.id,
      name: name.trim(),
      url: finalUrl,
      responsible: responsible.trim(),
      folder_id: folderId,
      description: description.trim(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" id="project-form-container">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-all mb-8 cursor-pointer group"
        id="btn-back-to-dashboard"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>대시보드로 돌아가기</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10" id="form-card">
        <h2 className="text-2xl font-bold text-slate-800 font-sans tracking-tight mb-2">
          {isEditMode ? "프로젝트 수정" : "새 프로젝트 등록"}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          학교 업무나 수업에 활용하는 외부 툴, 웹사이트 등을 대시보드에 등록하여 쉽게 접근하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 font-sans">
              프로젝트 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 구글 클래스룸 (2학년 1반)"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/20"
              } text-slate-800 text-sm focus:outline-none focus:ring-4 bg-slate-50/50`}
              id="input-project-name"
            />
            {errors.name && <p className="text-xs text-red-500 font-sans">{errors.name}</p>}
          </div>

          {/* Connection URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 font-sans">
              연결 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.url ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/20"
              } text-slate-800 text-sm focus:outline-none focus:ring-4 bg-slate-50/50`}
              id="input-project-url"
            />
            {errors.url && <p className="text-xs text-red-500 font-sans">{errors.url}</p>}
          </div>

          {/* Registrant and Folder in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsible Person */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 font-sans">
                담당자 / 등록자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="예: 김동인 교사"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.responsible ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/20"
                } text-slate-800 text-sm focus:outline-none focus:ring-4 bg-slate-50/50`}
                id="input-project-responsible"
              />
              {errors.responsible && <p className="text-xs text-red-500 font-sans">{errors.responsible}</p>}
            </div>

            {/* Folder Select */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 font-sans">
                분류 폴더
              </label>
              <div className="relative">
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-slate-50/50 appearance-none cursor-pointer"
                  id="select-project-folder"
                >
                  <option value="">분류 없음 (최상위)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 font-sans">
              간단한 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트나 툴에 대한 설명을 입력하세요."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-slate-50/50 resize-none"
              id="textarea-project-description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="form-actions-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className={`px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600 text-sm transition-all cursor-pointer ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
              id="btn-cancel-form"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 ${
                isSaving ? "opacity-75 cursor-not-allowed" : ""
              }`}
              id="btn-submit-form"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>저장 중...</span>
                </>
              ) : isEditMode ? (
                "프로젝트 수정"
              ) : (
                "프로젝트 등록"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
