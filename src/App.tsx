import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout} from './components/layout/Layout'
import Home from './pages/Home'
import Library from './pages/Library'
import Shelves from './pages/Shelves'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
            <Routes>
                {/*
                  ✨ 外层路由：渲染 Layout。
                  只要路径是以 "/" 开头的，都会先渲染 Layout。
                  Layout 里面的 <Outlet /> 就会根据后面的路径，显示对应的子组件
                */}
                <Route path="/" element={<Layout/>}>

                    {/* index 路由：当路径刚好是 "/" 时，Outlet 里显示 Home */}
                    <Route index element={<Home/>}/>

                    <Route path="library" element={<Library/>}/>
                    <Route path="shelves" element={<Shelves/>}/>


                </Route>
            </Routes>
        </BrowserRouter></ThemeProvider>
    )
}