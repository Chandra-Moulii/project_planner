import { createContext, useLayoutEffect, useState } from "react";

import { board } from "components/utils/types";
import Layout from "components/layout/Layout";

type themes = "light" | "dark" | "system";
type themeContext = {
  theme: themes;
  setTheme: React.Dispatch<React.SetStateAction<themes>>;
};
type contextTypes = {
  boards: board[];
  setBoards: React.Dispatch<React.SetStateAction<board[]>>;
};
type activeBoardTypes = {
  activeBoard: string;
  setActiveBoard: React.Dispatch<React.SetStateAction<string>>;
};
export const ThemeContext = createContext<themeContext | null>(null);
export const PlanningContext = createContext<contextTypes | null>(null);
export const ActiveBoardContext = createContext<activeBoardTypes | null>(null);

function App() {
  const [boards, setBoards] = useState<board[]>([]);
  const [theme, setTheme] = useState<themes>("light");
  const [activeBoard, setActiveBoard] = useState<string>("");

  function populateStoredState() {
    const storedData = localStorage.getItem("boards");
    const lastSelectedBoard = localStorage.getItem("lastSelectedBoard");
    if (storedData !== null) {
      const parsedData: board[] = JSON.parse(storedData);
      setBoards(parsedData);
    }
    if (lastSelectedBoard) {
      setActiveBoard(JSON.parse(lastSelectedBoard));
    }
  }

  function populateTheme() {
    const storedTheme = localStorage.getItem("theme") as themes | null;
    if (storedTheme !== null) {
      setTheme(storedTheme);
      document.documentElement.classList.add(storedTheme);
    }
  }

  useLayoutEffect(() => {
    populateTheme();
    populateStoredState();
  }, []);

  return (
    <PlanningContext.Provider value={{ boards, setBoards }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ActiveBoardContext.Provider value={{ activeBoard, setActiveBoard }}>
          <Layout />
        </ActiveBoardContext.Provider>
      </ThemeContext.Provider>
    </PlanningContext.Provider>
  );
}

export default App;
