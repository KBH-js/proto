import { ExternalLink, Download } from 'lucide-react';
import { portfolioConfig } from '../config/portfolio.config';
import { useTranslation } from '../i18n';

/**
 * Resume App - In-shell PDF viewer
 *
 * Renders the resume PDF (served from public/) via the browser's native
 * PDF viewer in an iframe. A toolbar offers open-in-new-tab and download
 * fallbacks for browsers with poor iframe PDF support (e.g. iOS Safari).
 */
export function ResumeApp() {
  const pdfUrl = portfolioConfig.resume.pdfUrl;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <span className="text-xs text-gray-500">{t('resume.filename')}</span>
        <div className="flex items-center gap-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title={t('resume.openNewTab')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('resume.openNewTab')}
          </a>
          <a
            href={pdfUrl}
            download="Byunghoon-Kang-Resume.pdf"
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title={t('resume.download')}
          >
            <Download className="w-3.5 h-3.5" />
            {t('resume.download')}
          </a>
        </div>
      </div>

      {/* PDF viewer — browser-native rendering */}
      <iframe
        src={pdfUrl}
        title="Resume PDF"
        className="flex-1 w-full border-0"
      />
    </div>
  );
}
