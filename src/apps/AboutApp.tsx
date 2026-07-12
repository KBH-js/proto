import { useState } from 'react';
import { 
  Info, 
  FileText, 
  Calculator, 
  Zap, 
  Github,
  Terminal,
  Server,
  Monitor,
  Layers,
  ArrowDown,
  Package,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function AboutApp() {
  const [showArchitecture, setShowArchitecture] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">KBH-Desktop에 오신 것을 환영합니다</h1>
            <p className="text-sm text-white/80">Micro-Frontend 포트폴리오 데모</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 space-y-5">
        {/* Introduction */}
        <section>
          <p className="text-gray-600 text-sm leading-relaxed">
            이 프로젝트는 <strong>Module Federation</strong>을 활용한 마이크로 프론트엔드 아키텍처를 
            데스크탑 형태로 시연하는 포트폴리오입니다. 각 앱 아이콘을 더블클릭하여 실행해보세요.
          </p>
        </section>

        {/* Available Apps */}
        <section>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            아이콘 정보
          </h2>

          <div className="space-y-3">
            {/* Resume */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Resume</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    이력서를 셸 내부 PDF 뷰어 창에서 엽니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Calculator - Remote MFE */}
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">Calculator</h3>
                    <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Remote MFE
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    <strong className="text-cyan-700">🎯 Module Federation 데모:</strong> 이 계산기는 
                    별도로 배포된 <strong>독립적인 마이크로 프론트엔드</strong>입니다. (Vercel에서 호스팅)
                  </p>
                  <div className="mt-2 p-2 bg-white/70 rounded border border-cyan-100">
                    <p className="text-xs text-gray-700">
                      👆 <strong>데스크탑의 Calculator 아이콘을 더블클릭</strong>하여 실행해보세요! 
                      창이 열리면 타이틀바에 <span className="text-cyan-600 font-semibold">MFE</span> 배지가 
                      표시되며, 토스트 알림으로 로딩 시간이 표시됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Section - Collapsible */}
        <section>
          <button
            onClick={() => setShowArchitecture(!showArchitecture)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3 hover:text-purple-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              시스템 아키텍처
            </span>
            {showArchitecture ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showArchitecture && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Architecture Diagram */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-3 text-center">Module Federation 구조도</p>
                
                <div className="flex flex-col items-center gap-3">
                  {/* User Browser */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">User Browser</span>
                  </div>
                  
                  <ArrowDown className="w-4 h-4 text-gray-400" />
                  
                  {/* Host App */}
                  <div className="w-full bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">Host App (Web-OS)</span>
                      <span className="text-[10px] bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full ml-auto">
                        Vercel
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <div className="bg-white/70 rounded p-1.5 text-center border border-purple-100">
                        <Package className="w-3 h-3 mx-auto mb-0.5 text-purple-500" />
                        <span className="text-gray-600">Zustand</span>
                      </div>
                      <div className="bg-white/70 rounded p-1.5 text-center border border-purple-100">
                        <Layers className="w-3 h-3 mx-auto mb-0.5 text-purple-500" />
                        <span className="text-gray-600">Registry</span>
                      </div>
                      <div className="bg-white/70 rounded p-1.5 text-center border border-purple-100">
                        <Monitor className="w-3 h-3 mx-auto mb-0.5 text-purple-500" />
                        <span className="text-gray-600">Desktop</span>
                      </div>
                    </div>
                  </div>

                  {/* Federation Arrow */}
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Module Federation (Runtime)</span>
                  </div>

                  {/* Remote App */}
                  <div className="w-full bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-lg p-3 border border-cyan-200">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs font-semibold text-cyan-700">Remote App (Calculator)</span>
                      <span className="text-[10px] bg-cyan-200 text-cyan-700 px-1.5 py-0.5 rounded-full ml-auto">
                        Vercel
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Module Federation */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-[10px] font-medium text-green-800">의존성 공유</p>
                  <p className="text-[10px] text-green-600">번들 사이즈 최적화</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] font-medium text-blue-800">독립 배포</p>
                  <p className="text-[10px] text-blue-600">런타임에 통합</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Tech Highlights */}
        <section>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
            기술 스택
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'React 19', color: 'bg-cyan-100 text-cyan-700' },
              { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
              { name: 'Module Federation', color: 'bg-purple-100 text-purple-700' },
              { name: 'Zustand', color: 'bg-orange-100 text-orange-700' },
              { name: 'Tailwind', color: 'bg-teal-100 text-teal-700' },
            ].map((tech) => (
              <span
                key={tech.name}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <section className="pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Github className="w-3 h-3" />
              시작 메뉴에서 GitHub 링크 확인
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
