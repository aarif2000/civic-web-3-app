// src/LandingPageLayout.jsx
const LandingPageLayout = ({ children }) => {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#282c34', padding: '20px', color: 'white' }}>
          <h1>Welcome to DeFi Card</h1>
          <p>Your Web3 Business Card Generator</p>
        </header>
  
        <main style={{ padding: '20px', flex: 1 }}>
          {children}
        </main>
  
        <footer style={{ background: '#282c34', padding: '10px', color: 'white', textAlign: 'center' }}>
          <p>&copy; 2025 DeFi Card</p>
        </footer>
      </div>
    );
  };
  
  export default LandingPageLayout;
  