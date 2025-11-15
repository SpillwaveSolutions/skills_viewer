/**
 * Unit tests for BreadcrumbNavigation component
 *
 * Tests cover:
 * - Renders breadcrumb segments with correct separators
 * - Clickable segments have correct styling and handlers
 * - Active segment is NOT clickable
 * - ARIA attributes for accessibility
 * - Navigation arrows (← →) integration with navigationStore
 * - Long skill name truncation with title tooltip
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreadcrumbNavigation } from '../../../src/components/BreadcrumbNavigation';
import { useNavigationStore } from '../../../src/stores/navigationStore';

// Mock navigationStore
vi.mock('../../../src/stores/navigationStore');
vi.mock('../../../src/hooks/useBreadcrumbSegments');

// Mock useBreadcrumbSegments hook
import { useBreadcrumbSegments } from '../../../src/hooks/useBreadcrumbSegments';
import type { BreadcrumbSegment } from '../../../src/types/layout';

describe('BreadcrumbNavigation', () => {
  let mockGoBack: ReturnType<typeof vi.fn>;
  let mockGoForward: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGoBack = vi.fn();
    mockGoForward = vi.fn();

    // Default mock: no navigation history
    vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
      const state = {
        history: [],
        currentIndex: -1,
        canGoBack: false,
        canGoForward: false,
        breadcrumbs: [],
        goBack: mockGoBack,
        goForward: mockGoForward,
        navigateTo: vi.fn(),
        clearHistory: vi.fn(),
        updateComputedState: vi.fn(),
      };
      return selector(state);
    });
  });

  describe('Basic Rendering', () => {
    it('should render semantic HTML with nav and ol elements', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');

      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();
    });

    it('should render single "Home" segment when no skill selected', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(1);
    });

    it('should render "Home › Skill › Tab" when skill selected', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'skill', label: 'Test Skill', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Test Skill')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('should render separators (›) between segments', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'skill', label: 'Test Skill', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Diagram', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      // Should have 2 separators for 3 segments
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Clickable Segments', () => {
    it('should render clickable segments as buttons', () => {
      const mockHomeClick = vi.fn();
      const mockSkillClick = vi.fn();

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        {
          id: 'home',
          label: 'Home',
          clickable: true,
          onClick: mockHomeClick,
          ariaLabel: 'Navigate to Home',
        },
        {
          id: 'skill',
          label: 'Test Skill',
          clickable: true,
          onClick: mockSkillClick,
          ariaLabel: 'Navigate to Test Skill',
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const homeButton = screen.getByRole('button', { name: /Navigate to Home/i });
      const skillButton = screen.getByRole('button', { name: /Navigate to Test Skill/i });

      expect(homeButton).toBeInTheDocument();
      expect(skillButton).toBeInTheDocument();
    });

    it('should call onClick handler when clickable segment is clicked', () => {
      const mockHomeClick = vi.fn();
      const mockSkillClick = vi.fn();

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        {
          id: 'home',
          label: 'Home',
          clickable: true,
          onClick: mockHomeClick,
          ariaLabel: 'Navigate to Home',
        },
        {
          id: 'skill',
          label: 'Test Skill',
          clickable: true,
          onClick: mockSkillClick,
          ariaLabel: 'Navigate to Test Skill',
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const homeButton = screen.getByRole('button', { name: /Navigate to Home/i });
      const skillButton = screen.getByRole('button', { name: /Navigate to Test Skill/i });

      fireEvent.click(homeButton);
      expect(mockHomeClick).toHaveBeenCalledTimes(1);

      fireEvent.click(skillButton);
      expect(mockSkillClick).toHaveBeenCalledTimes(1);
    });

    it('should have hover styling on clickable segments', () => {
      const mockHomeClick = vi.fn();

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        {
          id: 'home',
          label: 'Home',
          clickable: true,
          onClick: mockHomeClick,
          ariaLabel: 'Navigate to Home',
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const homeButton = screen.getByRole('button', { name: /Navigate to Home/i });
      expect(homeButton.className).toContain('hover:');
    });
  });

  describe('Active (Non-Clickable) Segment', () => {
    it('should render active segment as span (not button)', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        {
          id: 'home',
          label: 'Home',
          clickable: true,
          onClick: vi.fn(),
          ariaLabel: 'Navigate to Home',
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      // "Home" should be a button
      expect(screen.getByRole('button', { name: /Navigate to Home/i })).toBeInTheDocument();

      // "Overview" should NOT be a button
      const overviewElement = screen.getByText('Overview');
      expect(overviewElement.tagName).not.toBe('BUTTON');
    });

    it('should have distinct styling for active segment', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const overviewElement = screen.getByText('Overview');
      // Active segment should have different text color or weight
      expect(overviewElement.className).toContain('text-');
    });

    it('should mark active segment with aria-current="page"', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const overviewElement = screen.getByText('Overview');
      expect(overviewElement).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Navigation Arrows', () => {
    it('should render back arrow when canGoBack is true', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [{} as any],
          currentIndex: 1,
          canGoBack: true,
          canGoForward: false,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).not.toBeDisabled();
    });

    it('should render forward arrow when canGoForward is true', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [{} as any, {} as any],
          currentIndex: 0,
          canGoBack: false,
          canGoForward: true,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const forwardButton = screen.getByRole('button', { name: /Forward/i });
      expect(forwardButton).toBeInTheDocument();
      expect(forwardButton).not.toBeDisabled();
    });

    it('should disable back arrow when canGoBack is false', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [],
          currentIndex: -1,
          canGoBack: false,
          canGoForward: false,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      expect(backButton).toBeDisabled();
    });

    it('should disable forward arrow when canGoForward is false', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [],
          currentIndex: -1,
          canGoBack: false,
          canGoForward: false,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const forwardButton = screen.getByRole('button', { name: /Forward/i });
      expect(forwardButton).toBeDisabled();
    });

    it('should call goBack when back arrow is clicked', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [{} as any],
          currentIndex: 1,
          canGoBack: true,
          canGoForward: false,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('should call goForward when forward arrow is clicked', () => {
      vi.mocked(useNavigationStore).mockImplementation((selector: any) => {
        const state = {
          history: [{} as any, {} as any],
          currentIndex: 0,
          canGoBack: false,
          canGoForward: true,
          breadcrumbs: [],
          goBack: mockGoBack,
          goForward: mockGoForward,
          navigateTo: vi.fn(),
          clearHistory: vi.fn(),
          updateComputedState: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const forwardButton = screen.getByRole('button', { name: /Forward/i });
      fireEvent.click(forwardButton);

      expect(mockGoForward).toHaveBeenCalledTimes(1);
    });
  });

  describe('Long Skill Names', () => {
    it('should render title attribute for truncated skill names', () => {
      const longName = 'This is a very long skill name that will be truncated...';

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        {
          id: 'skill',
          label: longName,
          clickable: true,
          onClick: vi.fn(),
          ariaLabel: 'Navigate to ' + longName,
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const skillButton = screen.getByText(longName);
      expect(skillButton).toHaveAttribute('title', longName);
    });

    it('should apply truncate class for long skill names', () => {
      const longName = 'This is a very long skill name that will be truncated...';

      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        {
          id: 'skill',
          label: longName,
          clickable: true,
          onClick: vi.fn(),
          ariaLabel: 'Navigate to ' + longName,
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const skillButton = screen.getByText(longName);
      expect(skillButton.className).toContain('truncate');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on nav element', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should have aria-current="page" on active segment', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      const activeElement = screen.getByText('Overview');
      expect(activeElement).toHaveAttribute('aria-current', 'page');
    });

    it('should have aria-label on clickable segments', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        {
          id: 'home',
          label: 'Home',
          clickable: true,
          onClick: vi.fn(),
          ariaLabel: 'Navigate to Home',
        },
        {
          id: 'skill',
          label: 'Test Skill',
          clickable: true,
          onClick: vi.fn(),
          ariaLabel: 'Navigate to Test Skill',
        },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      render(<BreadcrumbNavigation />);

      expect(screen.getByRole('button', { name: /Navigate to Home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Navigate to Test Skill/i })).toBeInTheDocument();
    });

    it('should hide separators from screen readers', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: true, onClick: vi.fn() },
        { id: 'skill', label: 'Test Skill', clickable: true, onClick: vi.fn() },
        { id: 'tab', label: 'Overview', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling', () => {
    it('should have dark background (#2d2d2d)', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('bg-');
    });

    it('should apply proper spacing and padding', () => {
      vi.mocked(useBreadcrumbSegments).mockReturnValue([
        { id: 'home', label: 'Home', clickable: false },
      ]);

      const { container } = render(<BreadcrumbNavigation />);

      const nav = container.querySelector('nav');
      expect(nav?.className).toMatch(/(p-|px-|py-)/);
    });
  });
});
