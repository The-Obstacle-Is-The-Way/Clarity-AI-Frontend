/**
 * CLARITY-AI Neural Test Suite
 * Header testing focusing on presentation
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';
import { render } from '../../../infrastructure/testing/utils/test-utils.unified'; // Basic render is sufficient

const mockProps = {
  title: 'Test Dashboard Title',
  subtitle: 'Test Subtitle',
};

describe('Header', () => {
  it('renders the title correctly', () => {
    render(<Header title={mockProps.title} />);
    // Check that the title is rendered as a heading
    expect(screen.getByRole('heading', { name: mockProps.title, level: 1 })).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<Header title={mockProps.title} subtitle={mockProps.subtitle} />);
    expect(screen.getByText(mockProps.subtitle)).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const ActionButton = () => <button>Click Me</button>;
    render(<Header title={mockProps.title} actions={<ActionButton />} />);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('does not render subtitle or actions when not provided', () => {
    render(<Header title={mockProps.title} />);
    expect(screen.queryByText(mockProps.subtitle)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
