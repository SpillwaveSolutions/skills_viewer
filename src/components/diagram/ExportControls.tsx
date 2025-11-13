import React, { useState } from 'react';
import { Download, Copy, FileImage, FileCode } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ExportControlsProps {
  diagramRef: React.RefObject<HTMLDivElement>;
  mermaidSource: string;
  skillName: string;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  diagramRef,
  mermaidSource,
  skillName,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
  };

  const exportToPNG = async () => {
    if (!diagramRef.current) return;

    setIsExporting(true);
    try {
      const svgElement = diagramRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      // Create a clone of the SVG to avoid modifying the original
      const clone = svgElement.cloneNode(true) as SVGElement;

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.background = 'white';
      container.appendChild(clone);
      document.body.appendChild(container);

      // Export at 2x resolution for better quality
      const dataUrl = await toPng(container, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Clean up
      document.body.removeChild(container);

      // Download
      const link = document.createElement('a');
      link.download = `${sanitizeFilename(skillName)}-diagram.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToSVG = async () => {
    if (!diagramRef.current) return;

    setIsExporting(true);
    try {
      const svgElement = diagramRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      // Create a clone of the SVG
      const clone = svgElement.cloneNode(true) as SVGElement;

      // Ensure the SVG has proper namespaces
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // Serialize the SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);

      // Create blob and download
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `${sanitizeFilename(skillName)}-diagram.svg`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export SVG:', error);
      alert('Failed to export SVG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportMermaidSource = () => {
    const blob = new Blob([mermaidSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${sanitizeFilename(skillName)}-diagram.mmd`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  };

  const copyMermaidToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mermaidSource);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
        <button
          onClick={exportToPNG}
          disabled={isExporting}
          className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as PNG"
          title="Export as PNG (2x resolution)"
        >
          <FileImage className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={exportToSVG}
          disabled={isExporting}
          className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as SVG"
          title="Export as SVG (scalable)"
        >
          <Download className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={exportMermaidSource}
          className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors"
          aria-label="Download Mermaid source"
          title="Download Mermaid source (.mmd)"
        >
          <FileCode className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={copyMermaidToClipboard}
          className={`p-2 rounded border transition-colors ${
            copySuccess
              ? 'bg-green-100 border-green-300'
              : 'bg-white hover:bg-gray-50 border-gray-300'
          }`}
          aria-label="Copy Mermaid source to clipboard"
          title={copySuccess ? 'Copied!' : 'Copy Mermaid source'}
        >
          <Copy className={`w-4 h-4 ${copySuccess ? 'text-green-700' : 'text-gray-700'}`} />
        </button>
      </div>
      {isExporting && <span className="text-xs text-gray-600 animate-pulse">Exporting...</span>}
    </div>
  );
};
