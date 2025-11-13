/**
 * KeyboardShortcutHelp component
 *
 * Displays a modal with all available keyboard shortcuts grouped by context.
 * Triggered by pressing ? key.
 *
 * Features:
 * - Platform-specific key display (⌘ on Mac, Ctrl on Windows/Linux)
 * - Focus trap to keep keyboard navigation within modal
 * - Closes on Escape, close button click, or overlay click
 * - Fully accessible with ARIA attributes
 */

import React, { useEffect, useRef } from 'react';
import { usePlatformModifier } from '../hooks/usePlatformModifier';

export interface KeyboardShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { modifierSymbol } = usePlatformModifier();

  // Define all shortcuts grouped by context
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Search',
      shortcuts: [
        {
          keys: [modifierSymbol, 'F'],
          description: 'Focus search input',
        },
        {
          keys: ['Esc'],
          description: 'Clear search and unfocus',
        },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        {
          keys: ['↓'],
          description: 'Move to next item',
        },
        {
          keys: ['↑'],
          description: 'Move to previous item',
        },
        {
          keys: ['Enter'],
          description: 'Select highlighted item',
        },
        {
          keys: ['Esc'],
          description: 'Clear selection',
        },
      ],
    },
    {
      title: 'Tabs',
      shortcuts: [
        {
          keys: [modifierSymbol, '1'],
          description: 'Overview tab',
        },
        {
          keys: [modifierSymbol, '2'],
          description: 'Content tab',
        },
        {
          keys: [modifierSymbol, '3'],
          description: 'Triggers tab',
        },
        {
          keys: [modifierSymbol, '4'],
          description: 'Diagram tab',
        },
        {
          keys: [modifierSymbol, '5'],
          description: 'References tab',
        },
        {
          keys: [modifierSymbol, '6'],
          description: 'Scripts tab',
        },
      ],
    },
    {
      title: 'List',
      shortcuts: [
        {
          keys: ['↓'],
          description: 'Highlight next skill',
        },
        {
          keys: ['↑'],
          description: 'Highlight previous skill',
        },
        {
          keys: ['Enter'],
          description: 'Select highlighted skill',
        },
        {
          keys: ['Esc'],
          description: 'Clear highlight',
        },
      ],
    },
    {
      title: 'Help',
      shortcuts: [
        {
          keys: ['?'],
          description: 'Show this help',
        },
        {
          keys: ['Esc'],
          description: 'Close help',
        },
      ],
    },
  ];

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    firstElement?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab - wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab - wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  // Handle overlay click (close modal)
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleOverlayClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-description"
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="help-modal-title" className="text-2xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close help modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p id="help-modal-description" className="text-gray-600 mb-6">
          Use these keyboard shortcuts to navigate and interact with Skill Debugger more
          efficiently.
        </p>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {shortcutGroups.map((group) => (
            <div key={group.title} role="group" aria-labelledby={`group-${group.title}`}>
              <h3 id={`group-${group.title}`} className="text-lg font-semibold text-gray-900 mb-3">
                {group.title}
              </h3>

              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    {/* Key combination */}
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-sm">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Description */}
                    <span className="text-sm text-gray-600 ml-4">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Table header labels for accessibility */}
        <div className="sr-only">
          <span>Key</span>
          <span>Action</span>
        </div>
      </div>
    </div>
  );
};
