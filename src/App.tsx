import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root, HtmlBounce, CanvasBounce } from "./components";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />
  },
  {
    path: "/html-bounce",
    element: <HtmlBounce />
  },
  {
    path: "/canvas-bounce",
    element: <CanvasBounce />
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
