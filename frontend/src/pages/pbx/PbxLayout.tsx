import { useState } from 'react';
import { Outlet } from 'react-router';
import { Box } from '@mui/material';
import PbxThemeProvider from '../../components/pbx/PbxThemeProvider';
import PbxSidebar from '../../components/pbx/PbxSidebar';
import PbxTopBar from '../../components/pbx/PbxTopBar';

export default function PbxLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PbxThemeProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar — reserves its own width via flexShrink: 0 */}
        <PbxSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main area — takes remaining width */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0, // prevents flex child from overflowing
          }}
        >
          <PbxTopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />

          {/* Scrollable content area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </PbxThemeProvider>
  );
}
