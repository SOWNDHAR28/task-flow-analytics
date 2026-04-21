import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./Routes";



export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
