import { createUseStyles } from "react-jss";

function RootWorkspace() {
  let classes = useStyles()
  return <div className={classes.root}/>
}

let useStyles = createUseStyles({
  root: {
    backgroundColor: 'grey',
    flex: 1,
  }
})

export default RootWorkspace
