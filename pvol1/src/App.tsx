import { createUseStyles, ThemeProvider } from "react-jss";

import theme from './theme'
import './App.css'

function App() {
  let classes = useStyles()
  return (
    <ThemeProvider theme={theme}>
    </ThemeProvider>
  )
}

let useStyles = createUseStyles({
  header: {}, main: {}
})

export default App
