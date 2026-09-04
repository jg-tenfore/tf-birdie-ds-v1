import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { MobileApp } from "./mobile-app";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MobileApp />
    </StrictMode>,
);
