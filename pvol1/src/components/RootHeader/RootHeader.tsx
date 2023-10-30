import { createUseStyles } from "react-jss";

function RootHeader() {
  let classes = useStyles()
  return <div className={classes.root}>a</div>
}

let useStyles = createUseStyles({
  root: {
    backgroundColor: 'lightblue',
    width: '100vw',
    minHeight: '35px',
    height: '4vh',
  }
})

export default RootHeader