import "./src/polyfills/abortSignalAny";

import AppNavigator from "./src/navigation/AppNavigator";
import "./src/firebase/firebaseConfig";

export default function App() {
  return <AppNavigator />;
}
