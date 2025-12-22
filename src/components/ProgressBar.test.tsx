import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders correctly with given percentage', () => {
    const { container } = render(<ProgressBar percent={50} />);
    
    // Check if the progress bar container exists
    const progressContainer = container.querySelector('.w-full.h-2.bg-gray-200');
    expect(progressContainer).toBeTruthy();
    
    // Check if the inner bar has the correct width
    const innerBar = container.querySelector('.bg-gradient-to-r');
    expect(innerBar).toHaveStyle({ width: '50%' });
  });

  it('displays the label and percentage when showLabel is true', () => {
    const testLabel = 'Test Progress';
    render(<ProgressBar percent={75} showLabel={true} label={testLabel} />);
    
    expect(screen.getByText(testLabel)).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('clamps percentage to 100', () => {
    const { container } = render(<ProgressBar percent={150} />);
    const innerBar = container.querySelector('.bg-gradient-to-r');
    expect(innerBar).toHaveStyle({ width: '100%' });
  });
});
