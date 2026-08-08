import './App.css'
import {HashRouter, Routes, Route, Navigate} from "react-router-dom"; // ✨ 引入 Navigate 做兜底
import {ThemeProvider} from './hooks/ThemeContext.tsx';
import {AuthProvider} from './auth/AuthProvider';

// 内部页面
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import {Library} from './pages/Library';
import {Shelves} from './pages/Shelves';
import {Match} from './pages/Match';
import {Discover} from './pages/Discover';
import Theme from "./pages/Theme";
import {Planner} from "./pages/Planner.tsx";
import {Stats} from "./pages/Stats.tsx";
import {AddBook} from "./pages/AddBook.tsx";
import {Settings} from "./pages/Settings.tsx";
import {ProtectedRoute} from './components/layout/ProtectedRoute.tsx';
import {Clubs} from "./pages/Clubs.tsx";
import {Tropes} from "./pages/Tropes.tsx";
// 外部页面
import Landing from './auth/Landing';
import AuthScreen from './auth/AuthScreen';
import UnauthShell from './auth/UnauthShell';
import {Toaster} from 'react-hot-toast';


export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                {/* ⚡ 1. 将 Toast 放在全局顶层，与 Router 平级 */}
                <Toaster position="top-center" reverseOrder={false}/>

                <HashRouter>
                    <Routes>
                        {/* 🌟 1. 公共路由：不需要侧边栏 */}
                        <Route element={<UnauthShell/>}>
                            <Route path="/welcome" element={<Landing/>}/>
                            <Route path="/auth" element={<AuthScreen/>}/>
                        </Route>

                        {/* 🌟 2. 私有路由：受 ProtectedRoute 保护，且使用带侧边栏的 Layout */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout/>
                            </ProtectedRoute>
                        }>
                            <Route index element={<Home/>}/>
                            <Route path="library" element={<Library/>}/>
                            <Route path="stats" element={<Stats/>}/>
                            <Route path="match" element={<Match/>}/>
                            <Route path="discover" element={<Discover/>}/>
                            <Route path="planner" element={<Planner/>}/>
                            <Route path="clubs" element={<Clubs/>}/>
                            <Route path="settings" element={<Settings/>}/>
                            <Route path="shelves" element={<Shelves/>}/>
                            <Route path="addBook" element={<AddBook/>}/>
                            <Route path="theme" element={<Theme/>}/>
                            <Route path="tropes" element={<Tropes/>}/>
                        </Route>

                        {/* 🌟 3. 兜底策略：如果访问了未定义的路径，自动跳转到 /welcome */}
                        <Route path="*" element={<Navigate to="/welcome" replace />} />
                    </Routes>
                </HashRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}