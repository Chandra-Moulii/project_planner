import { Toaster } from "sonner";
import { Tooltip } from "react-tooltip";
import { useLayoutEffect, useState } from "react";

import Main from "components/main/Main";
import Sidebar from "components/sidebar/Sidebar";
import useAppContext from "customHooks/useContext";
import { ThemeContext } from "App";

export default function Layout() {
  const { theme } = useAppContext(ThemeContext);
  const [sidebarActive, setSidebarActiveState] = useState(true);

  function populateStoredData() {
    const sidebarState = localStorage.getItem("sidebarState");
    if (sidebarState) {
      setSidebarActiveState(JSON.parse(sidebarState));
    }
  }
  useLayoutEffect(() => {
    populateStoredData();
  }, []);

  return (
    <div className="flex h-screen max-w-[100vw] overscroll-x-auto">
      <Sidebar state={{ sidebarActive, setSidebarActiveState }} />
      <Main />

      {/* Tooltip overlay */}
      <Tooltip
        delayShow={400}
        id="_plannerTooltip"
        disableStyleInjection
        className="rounded bg-blackStroke px-3 py-1.5 text-sm text-whiteStroke shadow"
      />
      {/* Toaster */}
      <Toaster
        expand
        richColors
        theme={theme}
        toastOptions={{
          className: "px-4 py-3",
        }}
      />
    </div>
  );
}
