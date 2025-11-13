import React from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

interface ExportControlsProps {
  diagramRef: React.RefObject<HTMLDivElement | null>;
  mermaidSource: string;
  skillName: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  diagramRef,
  mermaidSource,
  skillName,
}) => {
  const [copied, setCopied] = React.useState(false);

  const exportToPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const dataUrl = await toPng(diagramRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${skillName}-diagram.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export PNG:', error);
    }
  };

  const exportToSVG = async () => {
    if (!diagramRef.current) return;
    try {
      const dataUrl = await toSvg(diagramRef.current, {
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${skillName}-diagram.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export SVG:', error);
    }
  };

  const downloadMermaid = () => {
    const blob = new Blob([mermaidSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${skillName}-diagram.mmd`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(mermaidSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
        <button
          onClick={exportToPNG}
          className="px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 transition-colors"
          title="Export as PNG (2x resolution)"
        >
          <Download size={16} />
          PNG
        </button>
        <button
          onClick={exportToSVG}
          className="px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 transition-colors"
          title="Export as SVG"
        >
          <Download size={16} />
          SVG
        </button>
        <button
          onClick={downloadMermaid}
          className="px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 transition-colors"
          title="Download Mermaid source"
        >
          <Download size={16} />
          .mmd
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={copyMermaid}
          className="px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 transition-colors"
          title="Copy Mermaid source to clipboard"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
