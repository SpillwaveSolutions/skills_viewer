import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationFilter } from '../../../../src/components/filters/LocationFilter';
import { useSkillStore } from '../../../../src/stores/useSkillStore';
import { act } from 'react';

describe('LocationFilter', () => {
  beforeEach(() => {
    // Reset store state
    const store = useSkillStore.getState();
    store.resetSearchFilters();
    store.setSkills([
      {
        name: 'Skill 1',
        location: 'claude',
        path: '/test/1',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: {},
      },
      {
        name: 'Skill 2',
        location: 'claude',
        path: '/test/2',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: {},
      },
      {
        name: 'Skill 3',
        location: 'opencode',
        path: '/test/3',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: {},
      },
    ]);
  });

  it('should render both location checkboxes', () => {
    render(<LocationFilter />);

    expect(screen.getByLabelText(/Filter by Claude skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by OpenCode skills/i)).toBeInTheDocument();
  });

  it('should show correct skill counts', () => {
    render(<LocationFilter />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills \(2 skills\)/i);
    const opencodeCheckbox = screen.getByLabelText(/Filter by OpenCode skills \(1 skills\)/i);

    expect(claudeCheckbox).toBeInTheDocument();
    expect(opencodeCheckbox).toBeInTheDocument();
  });

  it('should have both locations checked by default', () => {
    render(<LocationFilter />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);
    const opencodeCheckbox = screen.getByLabelText(/Filter by OpenCode skills/i);

    expect(claudeCheckbox).toBeChecked();
    expect(opencodeCheckbox).toBeChecked();
  });

  it('should toggle claude location filter', () => {
    render(<LocationFilter />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);

    act(() => {
      fireEvent.click(claudeCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.locations).toEqual(['opencode']);
  });

  it('should toggle opencode location filter', () => {
    render(<LocationFilter />);

    const opencodeCheckbox = screen.getByLabelText(/Filter by OpenCode skills/i);

    act(() => {
      fireEvent.click(opencodeCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.locations).toEqual(['claude']);
  });

  it('should allow both locations to be unchecked', () => {
    render(<LocationFilter />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);
    const opencodeCheckbox = screen.getByLabelText(/Filter by OpenCode skills/i);

    act(() => {
      fireEvent.click(claudeCheckbox);
      fireEvent.click(opencodeCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.locations).toEqual([]);
  });

  it('should allow selecting both locations after unchecking', () => {
    render(<LocationFilter />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);
    const opencodeCheckbox = screen.getByLabelText(/Filter by OpenCode skills/i);

    act(() => {
      fireEvent.click(claudeCheckbox);
      fireEvent.click(opencodeCheckbox);
      fireEvent.click(claudeCheckbox);
      fireEvent.click(opencodeCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.locations).toEqual(['claude', 'opencode']);
  });

  it('should have proper accessibility attributes', () => {
    render(<LocationFilter />);

    const group = screen.getByRole('group', { name: /Filter by location/i });
    expect(group).toBeInTheDocument();
  });

  it('should show location paths as labels', () => {
    render(<LocationFilter />);

    expect(screen.getByText('~/.claude/skills')).toBeInTheDocument();
    expect(screen.getByText('~/.config/opencode/skills')).toBeInTheDocument();
  });
});
