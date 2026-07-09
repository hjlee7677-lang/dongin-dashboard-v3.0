/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Database, Copy, Check, Info, Server, Shield } from "lucide-react";

export default function SupabaseGuide() {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- 1. folders 테이블 생성
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. projects 테이블 생성
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  responsible TEXT NOT NULL,
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

-- 3. 초기 기본 폴더 샘플 삽입 (선택사항)
INSERT INTO folders (id, name) VALUES 
('folder-1', '업무관리'),
('folder-2', '교무행정'),
('folder-3', '담임업무'),
('folder-4', '일정관리'),
('folder-5', '수업자료')
ON CONFLICT (id) DO NOTHING;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 mb-8" id="supabase-guide-panel">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Database size={20} />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-800 font-sans tracking-tight">Supabase 데이터베이스 연동 안내</h4>
          <p className="text-slate-500 text-sm mt-0.5 leading-relaxed font-sans">
            현재 애플리케이션은 로컬 파일 기반 DB(또는 메모리)로 동작하여 즉시 데이터를 안전하게 보존하고 있습니다. 
            실시간 Supabase 연동 및 Vercel 배포 시 아래 단계를 따라 데이터베이스를 설정해주세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left column: Setup steps */}
        <div className="space-y-4" id="guide-steps">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
            <div className="text-sm">
              <p className="font-semibold text-slate-700 font-sans">Supabase 프로젝트 생성</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed font-sans">
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Supabase Console</a>에서 무료 새 프로젝트를 생성하세요.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
            <div className="text-sm">
              <p className="font-semibold text-slate-700 font-sans">SQL 스키마 실행</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed font-sans">
                오른쪽 상자의 SQL 쿼리를 복사한 뒤 Supabase 대시보드의 <strong>SQL Editor</strong>에서 새 쿼리를 생성하여 실행(Run)하세요.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
            <div className="text-sm">
              <p className="font-semibold text-slate-700 font-sans">환경 변수 설정</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed font-sans">
                프로젝트의 Settings &gt; API 메뉴에서 URL과 Anon Key를 복사하여 <code>.env</code> 파일 또는 배포 플랫폼(Vercel 등) 환경 변수에 아래와 같이 등록하세요.
              </p>
              <pre className="mt-2 p-2.5 bg-slate-800 text-slate-200 text-xs rounded-lg font-mono overflow-x-auto leading-normal">
{`SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"`}
              </pre>
            </div>
          </div>
        </div>

        {/* Right column: SQL Area */}
        <div className="bg-slate-900 rounded-xl p-4 flex flex-col h-[280px]" id="sql-schema-box">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield size={14} />
              <span className="text-xs font-semibold font-sans tracking-wider uppercase">SQL Schema Script</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
              id="btn-copy-sql"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>복사하기</span>
                </>
              )}
            </button>
          </div>
          <pre className="flex-1 overflow-auto text-xs font-mono text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
}
