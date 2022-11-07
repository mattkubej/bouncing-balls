import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root, HtmlBounce, CanvasBounce } from '../';

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
]);

export function App() {
  console.log('test');
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
