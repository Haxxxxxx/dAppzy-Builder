import React from 'react';

class DropZoneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DropZone Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="dropzone-error">
          <p>Something went wrong with the dropzone. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DropZoneErrorBoundary; 