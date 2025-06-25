import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#000000'
}) => {
  const spinnerSize = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  return (
    <div
      className="loading-spinner"
      style={{
        width: spinnerSize[size],
        height: spinnerSize[size],
        borderColor: `${color}20`,
        borderTopColor: color
      }}
    />
  );
};

export default LoadingSpinner;