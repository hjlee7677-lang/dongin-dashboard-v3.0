/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Project, Folder } from "../types";
import { ExternalLink, Pencil, Trash2, User, Clock, FolderClosed } from "lucide-react";

interface ProjectCardProps {
  key?: React.Key | string;
  project: Project;
  folders: Folder[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  folders,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  // Find folder name
  const folder = folders.find((f) => f.id === project.folder_id);
  const folderName = folder ? folder.name : "분류 없음";

  // Handle URL opening safely
  const handleOpenUrl = () => {
    if (project.url) {
      window.open(project.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300" id={`project-card-${project.id}`}>
      <div>
        {/* Header: Title and Folder badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-sans font-semibold text-slate-800 text-base leading-snug tracking-tight">{project.name}</h4>
        </div>
        
        {/* Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-medium text-slate-500 mb-4" id={`badge-folder-${project.id}`}>
          <FolderClosed size={11} className="text-slate-400" />
          <span>{folderName}</span>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-sm mb-5 leading-relaxed min-h-[40px] font-sans" id={`desc-project-${project.id}`}>
          {project.description || "등록된 설명이 없습니다."}
        </p>
      </div>

      <div>
        {/* Responsible Person and Date */}
        <div className="flex items-center justify-between text-slate-400 text-xs mb-5 pt-3 border-t border-slate-50" id={`meta-row-${project.id}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={13} className="text-slate-400 flex-shrink-0" />
            <span className="truncate font-sans font-medium text-slate-600">{project.responsible}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
            <Clock size={13} />
            <span className="font-sans">{project.created_at}</span>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2" id={`actions-row-${project.id}`}>
          <button
            onClick={handleOpenUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-3 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            id={`btn-open-proj-${project.id}`}
          >
            <span>열기</span>
            <ExternalLink size={14} />
          </button>
          
          <button
            onClick={() => onEdit(project)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
            title="프로젝트 수정"
            id={`btn-edit-proj-${project.id}`}
          >
            <Pencil size={14} />
          </button>
          
          <button
            onClick={() => {
              if (confirm(`'${project.name}' 프로젝트를 삭제하시겠습니까?`)) {
                onDelete(project.id);
              }
            }}
            className="p-2 border border-slate-200 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all duration-200 cursor-pointer"
            title="프로젝트 삭제"
            id={`btn-delete-proj-${project.id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
