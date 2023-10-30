import { createUseStyles, ThemeProvider } from "react-jss";

import RootHeader from "./components/RootHeader";
import RootWorkspace from "./components/RootWorkspace";

import theme from './theme'
import './App.css'

function App() {
  let classes = useStyles()
  return (
    <ThemeProvider theme={theme}>
      <header className={classes.header}>
        <RootHeader/>
      </header>
      <main className={classes.main}>
        <RootWorkspace/>
      </main>
    </ThemeProvider>
  )
}

let useStyles = createUseStyles({
  header: {}, main: {}
})

export default App
