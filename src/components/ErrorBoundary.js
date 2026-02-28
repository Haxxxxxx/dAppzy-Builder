import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary:${this.props.name || 'unknown'}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#888',
            backgroundColor: '#1e1e1e',
            borderRadius: '8px',
            margin: '8px',
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            Something went wrong in {this.props.name || 'this section'}.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: '#2a2a2a',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
