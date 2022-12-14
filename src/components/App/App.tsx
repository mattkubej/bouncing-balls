import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root, HtmlBounce, CanvasBounce, WasmBounce } from '../';

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/html-bounce',
    element: <HtmlBounce />,
  },
  {
    path: '/canvas-bounce',
    element: <CanvasBounce />,
  },
  {
    path: '/wasm-bounce',
    element: <WasmBounce />,
  },
]);

export function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
