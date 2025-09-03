import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './contexts/AppProviders';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChannelListPage } from './pages/channels/ChannelListPage';
import { CreateChannelPage } from './pages/channels/CreateChannelPage';
import { EditChannelPage } from './pages/channels/EditChannelPage';
import { GroupListPage } from './pages/groups/GroupListPage';
import { CreateGroupPage } from './pages/groups/CreateGroupPage';
import { EditGroupPage } from './pages/groups/EditGroupPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ROUTES } from './utils/constants';

function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/*" 
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route path="" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="channels" element={<ChannelListPage />} />
            <Route path="channels/create" element={<CreateChannelPage />} />
            <Route path="channels/:id/edit" element={<EditChannelPage />} />
            <Route path="groups" element={<GroupListPage />} />
            <Route path="groups/create" element={<CreateGroupPage />} />
            <Route path="groups/:id/edit" element={<EditGroupPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* 其他路由将在后续添加 */}
          </Route>
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;