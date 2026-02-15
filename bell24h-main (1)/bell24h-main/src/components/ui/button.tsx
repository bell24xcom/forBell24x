export function Button({ children, ...props }: any) {
  return (
    <button {...props} style={{
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer'
    }}>
      {children}
    </button>
  );
}
