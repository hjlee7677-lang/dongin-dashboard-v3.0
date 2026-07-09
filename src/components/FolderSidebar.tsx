/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Folder as FolderType } from "../types";
import { Folder, FolderPlus, Plus, Pencil, Trash2, X, Check, Layers } from "lucide-react";

interface FolderSidebarProps {
  folders: FolderType[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onAddFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  projectCounts: Record<string, number>;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  projectCounts,
}: FolderSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName("");
      setIsAdding(false);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      onRenameFolder(id, editingName.trim());
      setEditingFolderId(null);
      setEditingName("");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-slate-100 p-5 flex flex-col h-full" id="folder-sidebar">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-slate-800 text-sm tracking-wide uppercase">폴더 구조</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
          title="새 폴더 추가"
          id="btn-add-folder-toggle"
        >
          <FolderPlus size={18} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-4 flex gap-1.5 items-center" id="form-add-folder">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="폴더 이름 입력..."
            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
            id="btn-add-folder-submit"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
            id="btn-add-folder-cancel"
          >
            <X size={14} />
          </button>
        </form>
      )}

      <div className="space-y-1 overflow-y-auto flex-1 pr-1" id="folder-list">
        {/* All Projects button */}
        <button
          onClick={() => onSelectFolder("")}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
            selectedFolderId === ""
              ? "bg-blue-50/70 text-blue-700 font-medium shadow-sm shadow-blue-500/5"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
          id="btn-folder-all"
        >
          <div className="flex items-center gap-2.5">
            <Layers size={16} className={selectedFolderId === "" ? "text-blue-600" : "text-slate-400"} />
            <span>모든 프로젝트</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              selectedFolderId === "" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            {projectCounts["all"] || 0}
          </span>
        </button>

        {/* Dynamic folders */}
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          const isEditing = editingFolderId === folder.id;
          const count = projectCounts[folder.id] || 0;

          if (isEditing) {
            return (
              <div key={folder.id} className="flex gap-1 items-center px-2 py-1.5 bg-slate-50 rounded-xl" id={`edit-folder-${folder.id}`}>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  autoFocus
                />
                <button
                  onClick={() => handleRenameSubmit(folder.id)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded-md cursor-pointer"
                  id={`btn-save-folder-${folder.id}`}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingFolderId(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-md cursor-pointer"
                  id={`btn-cancel-folder-${folder.id}`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={folder.id}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/70 text-blue-700 font-medium shadow-sm shadow-blue-500/5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => onSelectFolder(folder.id)}
              id={`btn-folder-${folder.id}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Folder size={16} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                <span className="truncate">{folder.name}</span>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                {/* Edit/Delete tools only visible on hover */}
                <div className="hidden group-hover:flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolderId(folder.id);
                      setEditingName(folder.name);
                    }}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="이름 바꾸기"
                    id={`btn-rename-folder-toggle-${folder.id}`}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${folder.name}' 폴더를 삭제하시겠습니까? 관련 프로젝트는 분류 없음으로 변경됩니다.`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="p-1 hover:bg-red-50 rounded-md text-slate-500 hover:text-red-600 cursor-pointer"
                    title="폴더 삭제"
                    id={`btn-delete-folder-toggle-${folder.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full group-hover:hidden ${
                    isSelected ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
