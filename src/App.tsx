import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './auth/AuthProvider';

// 内部页面
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Shelves from './pages/Shelves';
import Match from './pages/Match';
import Discover from './pages/Discover';
import {Theme} from "./pages/Theme.tsx";
import Stats from "./pages/Stats.tsx";
import {AddBook} from "./pages/AddBook.tsx";
import {Settings} from "./pages/Settings.tsx";
import { ProtectedRoute } from './components/ProtectedRoute';

// 外部页面 (新建这些文件)
import Landing from './auth/Landing';
import AuthScreen from './auth/AuthScreen';
import UnauthShell from './auth/UnauthShell';

const basename = import.meta.env.MODE === 'production' ? '/somnia-library' : '';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter basename={basename}>
                    <Routes>
                        {/* 🌟 1. 公共路由：不需要侧边栏 */}
                        <Route element={<UnauthShell />}>
                            <Route path="/welcome" element={<Landing />} />
                            <Route path="/auth" element={<AuthScreen />} />
                        </Route>

                        {/* 🌟 2. 私有路由：受 ProtectedRoute 保护，且使用带侧边栏的 Layout */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Home />} />
                            <Route path="library" element={<Library />} />
                            <Route path="stats" element={<Stats />} />
                            <Route path="match" element={<Match />} />
                            <Route path="discover" element={<Discover />} />


                            <Route path="settings" element={<Settings />} />

                            <Route path="shelves" element={<Shelves />} />
                            <Route path="addBook" element={<AddBook />} />
                            <Route path="theme" element={<Theme />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}