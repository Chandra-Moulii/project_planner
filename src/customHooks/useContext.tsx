import { useContext } from "react";

export default function useAppContext<T>(context: React.Context<T | null>): T {
  const appContext = useContext(context);
  if (appContext === null) {
    throw new Error("Context has not been Provided!");
  }
  return appContext;
}
